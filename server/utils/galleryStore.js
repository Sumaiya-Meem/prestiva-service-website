/**
 * Gallery storage layer — MongoDB metadata + files on the server's disk.
 *
 * • Metadata (sections, media records) lives in MongoDB via the GallerySection
 *   and Media models.
 * • The actual bytes live under /uploads/gallery/<slug>/ and are served
 *   statically by Express (see server.js).
 *
 * Images are compressed to WebP (1100px wide, matching the rest of the site).
 * Videos are stored as-is, and a poster frame is extracted (best-effort) so the
 * public site and admin can show a thumbnail before the clip plays.
 *
 * The exported API — list / addSection / deleteSection / addMedia / deleteMedia
 * — is what the controller depends on, so swapping disk for object storage
 * later only touches this file.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const GallerySection = require('../models/GallerySection');
const Media = require('../models/Media');

// Where uploaded files are stored on disk. In production set UPLOAD_DIR to a
// path on a PERSISTENT disk (e.g. /data/uploads on Render) so media survives
// deploys; locally it defaults to server/uploads.
const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const UPLOAD_ROOT = path.join(UPLOAD_BASE, 'gallery');
const URL_PREFIX = '/uploads/gallery'; // public path prefix (static in server.js)

const IMAGE_WIDTH = 1600;  // px — gallery images (large enough for the full-screen lightbox)
const POSTER_WIDTH = 1280; // px — video poster frames
const VIDEO_WIDTH = 1280;  // px — max width when transcoding videos (720p-class)
const WEBP_QUALITY = 80;

const THUMB_WIDTH = 480;   // px — small tile thumbnail for grids/carousels
const THUMB_QUALITY = 72;

/**
 * Write a small WebP thumbnail from a source (Buffer or file path) to destPath.
 * Used for grid/carousel tiles so pages don't download full-size images.
 */
const makeThumb = async (source, destPath) => {
  const buf = await sharp(source)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY, effort: 5 })
    .toBuffer();
  fs.writeFileSync(destPath, buf);
  return buf.length;
};

// Categories the site ships with — seeded once so the admin starts with a
// familiar structure (empty until photos/videos are added or imported).
const DEFAULT_SECTIONS = [
  ['office', 'Office Cleaning'],
  ['commercial', 'Commercial Cleaning'],
  ['builders', 'Builders Cleaning'],
  ['end-of-lease', 'End of Lease'],
  ['airbnb', 'Airbnb Cleaning'],
  ['real-estate', 'Real Estate Cleaning'],
  ['pressure', 'Pressure Washing'],
  ['property', 'Property Maintenance'],
  ['window', 'Window Cleaning'],
  ['carpet', 'Carpet Cleaning'],
  ['results', 'Cleaning Results'],
  ['landscaping', 'Landscaping'],
];

const slugify = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sectionDir = (slug) => path.join(UPLOAD_ROOT, slug);
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

/** Shape a Media doc for the API (stable public contract). */
const toMediaDTO = (m) => ({
  id: String(m._id),
  type: m.type,
  url: m.url,
  thumbUrl: m.thumbUrl || '',
  posterUrl: m.posterUrl || '',
  width: m.width || null,
  height: m.height || null,
});

/**
 * Create the default sections the first time the gallery is used, so the admin
 * isn't staring at a blank slate. No-op once any section exists.
 */
const ensureSeeded = async () => {
  const count = await GallerySection.estimatedDocumentCount();
  if (count > 0) return;
  await GallerySection.insertMany(
    DEFAULT_SECTIONS.map(([slug, tag], i) => ({ slug, tag, order: i }))
  );
};

/** All sections (ordered) with their media (ordered) nested under each. */
const list = async () => {
  await ensureSeeded();
  const sections = await GallerySection.find().sort({ order: 1, createdAt: 1 }).lean();
  const media = await Media.find().sort({ order: 1, createdAt: 1 }).lean();

  const bySection = new Map();
  for (const m of media) {
    const key = String(m.section);
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(toMediaDTO(m));
  }

  return sections.map((s) => ({
    slug: s.slug,
    tag: s.tag,
    order: s.order,
    media: bySection.get(String(s._id)) || [],
  }));
};

/** Add a new section from a display name. Returns the created section DTO. */
const addSection = async (name) => {
  const tag = String(name || '').trim();
  if (!tag) throw new Error('Section name is required.');
  const slug = slugify(tag);
  if (!slug) throw new Error('Section name must contain letters or numbers.');

  if (await GallerySection.findOne({ slug })) {
    throw new Error('A section with that name already exists.');
  }

  const order = await GallerySection.estimatedDocumentCount();
  const section = await GallerySection.create({ slug, tag, order });
  ensureDir(sectionDir(slug));
  return { slug: section.slug, tag: section.tag, order: section.order, media: [] };
};

/** Delete a section, all of its media records, and its files on disk. */
const deleteSection = async (slug) => {
  const section = await GallerySection.findOne({ slug });
  if (!section) throw new Error('Section not found.');

  await Media.deleteMany({ section: section._id });
  await section.deleteOne();
  fs.rmSync(sectionDir(slug), { recursive: true, force: true });
};

/** Remove a file at a server-relative /uploads path (safe if already gone). */
const removeFileByUrl = (url) => {
  if (!url) return;
  const rel = url.replace(new RegExp(`^${URL_PREFIX}/`), '');
  fs.rmSync(path.join(UPLOAD_ROOT, rel), { force: true });
};

// Resolve the bundled ffmpeg binary once (null if the dependency is missing).
const ffmpegBin = () => {
  try {
    return require('ffmpeg-static') || null;
  } catch {
    return null;
  }
};

// Run ffmpeg with quiet logging; resolves true on exit code 0. Generous
// maxBuffer/timeout so a longer clip doesn't error out mid-transcode.
const runFfmpeg = (args) =>
  new Promise((resolve) => {
    const bin = ffmpegBin();
    if (!bin) return resolve(false);
    const { execFile } = require('child_process');
    execFile(
      bin,
      ['-y', '-loglevel', 'error', ...args],
      { maxBuffer: 1024 * 1024 * 16, timeout: 6 * 60 * 1000 },
      (err) => resolve(!err)
    );
  });

/**
 * Extract a poster frame from a saved video (best-effort). Returns the poster's
 * server-relative URL, or '' if ffmpeg isn't available / extraction fails — the
 * <video> element still works without a poster.
 */
const makeVideoPoster = async (videoPath, slug, id) => {
  const posterFile = `${id}.jpg`;
  const posterPath = path.join(sectionDir(slug), posterFile);
  const ok = await runFfmpeg([
    '-ss', '00:00:01', '-i', videoPath, '-frames:v', '1',
    '-vf', `scale='min(${POSTER_WIDTH},iw)':-2`, posterPath,
  ]);
  return ok && fs.existsSync(posterPath) ? `${URL_PREFIX}/${slug}/${posterFile}` : '';
};

/**
 * Transcode to a web-optimised H.264 MP4: capped at VIDEO_WIDTH, CRF 26,
 * AAC audio, and `+faststart` (moov atom up front) so it streams/plays
 * immediately in the browser and seeks smoothly on mobile. Returns true if the
 * output was produced.
 */
const transcodeVideo = async (input, output) => {
  const ok = await runFfmpeg([
    '-i', input,
    '-vf', `scale='min(${VIDEO_WIDTH},iw)':-2`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    output,
  ]);
  return ok && fs.existsSync(output);
};

/**
 * Add an image or video to a section.
 * @param {string} slug
 * @param {{buffer:Buffer, mimetype:string, originalname?:string, size?:number}} file
 * @returns the created media DTO
 */
const addMedia = async (slug, file) => {
  const section = await GallerySection.findOne({ slug });
  if (!section) throw new Error('Section not found.');
  if (!file || !file.buffer) throw new Error('No file uploaded.');

  const isImage = /^image\//.test(file.mimetype || '');
  const isVideo = /^video\//.test(file.mimetype || '');
  if (!isImage && !isVideo) throw new Error('Only image or video files are allowed.');

  const id = crypto.randomBytes(8).toString('hex');
  const dir = sectionDir(slug);
  ensureDir(dir);
  const order = await Media.countDocuments({ section: section._id });

  let doc;
  if (isImage) {
    const filename = `${id}.webp`;
    const thumbName = `${id}-t.webp`;
    const pipeline = sharp(file.buffer).rotate();
    const meta = await pipeline.metadata();
    const optimized = await pipeline
      .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(dir, filename), optimized);
    await makeThumb(file.buffer, path.join(dir, thumbName));

    doc = await Media.create({
      section: section._id,
      type: 'image',
      url: `${URL_PREFIX}/${slug}/${filename}`,
      thumbUrl: `${URL_PREFIX}/${slug}/${thumbName}`,
      width: meta.width || null,
      height: meta.height || null,
      bytes: optimized.length,
      order,
    });
  } else {
    const origExt = (path.extname(file.originalname || '') || '.mp4').toLowerCase();
    const tmpPath = path.join(dir, `${id}.upload${origExt}`);
    fs.writeFileSync(tmpPath, file.buffer);

    const mp4Path = path.join(dir, `${id}.mp4`);
    const transcoded = await transcodeVideo(tmpPath, mp4Path);

    let finalName;
    if (transcoded) {
      const origSize = file.buffer.length;
      const outSize = fs.statSync(mp4Path).size;
      // Keep the original only if it's already an MP4 AND smaller than the
      // re-encode (don't bloat already-optimised clips). Otherwise use the
      // web-optimised MP4 — which also converts .mov/.webm for compatibility.
      if (origExt === '.mp4' && origSize <= outSize) {
        fs.rmSync(mp4Path, { force: true });
        finalName = `${id}.mp4`;
        fs.renameSync(tmpPath, path.join(dir, finalName));
      } else {
        fs.rmSync(tmpPath, { force: true });
        finalName = `${id}.mp4`;
      }
    } else {
      // Transcode unavailable/failed → store the original as-is.
      fs.rmSync(mp4Path, { force: true }); // remove any partial output
      finalName = `${id}${origExt}`;
      fs.renameSync(tmpPath, path.join(dir, finalName));
    }

    const finalPath = path.join(dir, finalName);
    const posterUrl = await makeVideoPoster(finalPath, slug, id);

    // Small tile thumbnail derived from the poster frame.
    let thumbUrl = '';
    if (posterUrl) {
      try {
        const thumbName = `${id}-t.webp`;
        await makeThumb(path.join(dir, `${id}.jpg`), path.join(dir, thumbName));
        thumbUrl = `${URL_PREFIX}/${slug}/${thumbName}`;
      } catch { /* poster thumb is best-effort */ }
    }

    doc = await Media.create({
      section: section._id,
      type: 'video',
      url: `${URL_PREFIX}/${slug}/${finalName}`,
      thumbUrl,
      posterUrl,
      bytes: fs.statSync(finalPath).size,
      order,
    });
  }

  return toMediaDTO(doc);
};

/** Remove a single media item (record + file + any poster). */
const deleteMedia = async (slug, id) => {
  const section = await GallerySection.findOne({ slug });
  if (!section) throw new Error('Section not found.');

  const media = await Media.findOne({ _id: id, section: section._id });
  if (!media) throw new Error('Media not found.');

  removeFileByUrl(media.url);
  removeFileByUrl(media.thumbUrl);
  removeFileByUrl(media.posterUrl);
  await media.deleteOne();
};

module.exports = {
  list,
  addSection,
  deleteSection,
  addMedia,
  deleteMedia,
  slugify,
  ensureSeeded,
  makeThumb,
  UPLOAD_ROOT,
  URL_PREFIX,
  IMAGE_WIDTH,
  WEBP_QUALITY,
  THUMB_WIDTH,
  THUMB_QUALITY,
};
