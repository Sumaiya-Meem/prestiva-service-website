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
const os = require('os');
const storage = require('./storage');

const mimeForFile = (name) => {
  const ext = path.extname(name).toLowerCase();
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  return 'image/webp';
};

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
 * WebP thumbnail as a Buffer (from a Buffer or a file path). Used for
 * grid/carousel tiles so pages don't download full-size images.
 */
const makeThumbBuffer = async (source) =>
  sharp(source)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY, effort: 5 })
    .toBuffer();

/**
 * Legacy disk-writing thumbnail — kept for the one-off CLI scripts
 * (scripts/seedGallery.js, scripts/backfillThumbs.js) which write straight to
 * UPLOAD_ROOT. The live upload/import paths use makeThumbBuffer + storage.put.
 */
const makeThumb = async (source, destPath) => {
  const buf = await makeThumbBuffer(source);
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
  return { slug: section.slug, tag: section.tag, order: section.order, media: [] };
};

/** Delete a section, all of its media records, and its files on disk. */
const deleteSection = async (slug) => {
  const section = await GallerySection.findOne({ slug });
  if (!section) throw new Error('Section not found.');

  await Media.deleteMany({ section: section._id });
  await section.deleteOne();
  await storage.delPrefix(`gallery/${slug}/`);
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
  const order = await Media.countDocuments({ section: section._id });

  let doc;
  if (isImage) {
    const key = `gallery/${slug}/${id}.webp`;
    const thumbKey = `gallery/${slug}/${id}-t.webp`;
    const pipeline = sharp(file.buffer).rotate();
    const meta = await pipeline.metadata();
    const optimized = await pipeline
      .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();
    const url = await storage.put(key, optimized, 'image/webp');
    const thumbUrl = await storage.put(thumbKey, await makeThumbBuffer(file.buffer), 'image/webp');

    doc = await Media.create({
      section: section._id,
      type: 'image',
      url,
      thumbUrl,
      width: meta.width || null,
      height: meta.height || null,
      bytes: optimized.length,
      order,
    });
  } else {
    // ffmpeg needs real files, so process in a local temp dir regardless of the
    // storage backend; only the finished artifacts are uploaded.
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prestiva-vid-'));
    try {
      const origExt = (path.extname(file.originalname || '') || '.mp4').toLowerCase();
      const tmpUpload = path.join(tmpDir, `src${origExt}`);
      fs.writeFileSync(tmpUpload, file.buffer);

      const tmpMp4 = path.join(tmpDir, 'out.mp4');
      const transcoded = await transcodeVideo(tmpUpload, tmpMp4);

      let finalLocal, finalName;
      if (transcoded) {
        const origSize = file.buffer.length;
        const outSize = fs.statSync(tmpMp4).size;
        // Keep the original only if it's already an MP4 AND no larger than the
        // re-encode; otherwise use the web-optimised MP4 (also converts .mov/.webm).
        if (origExt === '.mp4' && origSize <= outSize) {
          finalLocal = tmpUpload; finalName = `${id}.mp4`;
        } else {
          finalLocal = tmpMp4; finalName = `${id}.mp4`;
        }
      } else {
        finalLocal = tmpUpload; finalName = `${id}${origExt}`;
      }

      const videoBuf = fs.readFileSync(finalLocal);
      const url = await storage.put(`gallery/${slug}/${finalName}`, videoBuf, mimeForFile(finalName));

      // Poster frame (best-effort) + small thumbnail derived from it.
      let posterUrl = '', thumbUrl = '';
      const tmpPoster = path.join(tmpDir, 'poster.jpg');
      const posterOk = await runFfmpeg([
        '-ss', '00:00:01', '-i', finalLocal, '-frames:v', '1',
        '-vf', `scale='min(${POSTER_WIDTH},iw)':-2`, tmpPoster,
      ]);
      if (posterOk && fs.existsSync(tmpPoster)) {
        posterUrl = await storage.put(`gallery/${slug}/${id}.jpg`, fs.readFileSync(tmpPoster), 'image/jpeg');
        try {
          thumbUrl = await storage.put(`gallery/${slug}/${id}-t.webp`, await makeThumbBuffer(tmpPoster), 'image/webp');
        } catch { /* thumb is best-effort */ }
      }

      doc = await Media.create({
        section: section._id, type: 'video', url, thumbUrl, posterUrl, bytes: videoBuf.length, order,
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  return toMediaDTO(doc);
};

/** Remove a single media item (record + file + any poster). */
const deleteMedia = async (slug, id) => {
  const section = await GallerySection.findOne({ slug });
  if (!section) throw new Error('Section not found.');

  const media = await Media.findOne({ _id: id, section: section._id });
  if (!media) throw new Error('Media not found.');

  await storage.del(storage.keyFromUrl(media.url));
  await storage.del(storage.keyFromUrl(media.thumbUrl));
  await storage.del(storage.keyFromUrl(media.posterUrl));
  await media.deleteOne();
};

// ── Import the built-in gallery (server-side) ──
// Reads the images/videos committed in the repo (client/src/assets/gallery) and
// writes them to the SAME storage path admin uploads use, so it works on the
// server even when the files were only ever seeded on a developer's laptop.
// File-aware & idempotent: it (re)writes any file that's missing on disk, even
// when a DB record already exists, and can be safely re-run.
const DEFAULT_SRC = path.join(__dirname, '..', '..', 'client', 'src', 'assets', 'gallery');

const IMPORT_TAGS = {
  office: 'Office Cleaning', commercial: 'Commercial Cleaning', builders: 'Builders Cleaning',
  'end-of-lease': 'End of Lease', airbnb: 'Airbnb Cleaning', 'real-estate': 'Real Estate Cleaning',
  pressure: 'Pressure Washing', property: 'Property Maintenance', landscaping: 'Landscaping',
  window: 'Window Cleaning', carpet: 'Carpet Cleaning', results: 'Cleaning Results',
};
const idFor = (rel) => crypto.createHash('md5').update(rel).digest('hex').slice(0, 16);
const titleCase = (slug) =>
  slug.replace(/(^|-)([a-z])/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase()).trim();

const importDefaults = async (srcDir = DEFAULT_SRC) => {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Built-in gallery source not found on the server (${srcDir}).`);
  }
  await ensureSeeded();

  const folders = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();

  let added = 0, restored = 0, skipped = 0, failed = 0;

  for (const slug of folders) {
    const dir = path.join(srcDir, slug);
    const files = fs.readdirSync(dir).sort();

    let section = await GallerySection.findOne({ slug });
    if (!section) {
      const order = await GallerySection.estimatedDocumentCount();
      section = await GallerySection.create({ slug, tag: IMPORT_TAGS[slug] || titleCase(slug), order });
    }
    let order = await Media.countDocuments({ section: section._id });

    const videoBaseNames = new Set(
      files.filter((f) => /\.(mp4|webm|mov)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, ''))
    );

    for (const f of files) {
      try {
        const abs = path.join(dir, f);
        const ext = path.extname(f).toLowerCase();
        const base = f.replace(/\.[^.]+$/, '');
        const id = idFor(`${slug}/${f}`);

        if (/\.(mp4|webm|mov)$/i.test(f)) {
          const key = `gallery/${slug}/${id}${ext}`;
          const url = storage.publicUrl(key);
          const existing = await Media.findOne({ url });
          if (existing && await storage.exists(key)) { skipped++; continue; }

          await storage.put(key, fs.readFileSync(abs), mimeForFile(f));
          let posterUrl = '', thumbUrl = '';
          const poster = files.find((p) => p.replace(/\.[^.]+$/, '') === base && /\.(jpg|jpeg|png)$/i.test(p));
          if (poster) {
            const pExt = path.extname(poster).toLowerCase();
            const ps = path.join(dir, poster);
            posterUrl = await storage.put(`gallery/${slug}/${id}${pExt}`, fs.readFileSync(ps), mimeForFile(poster));
            thumbUrl = await storage.put(`gallery/${slug}/${id}-t.webp`, await makeThumbBuffer(ps), 'image/webp');
          }
          if (existing) {
            const patch = {};
            if (!existing.posterUrl && posterUrl) patch.posterUrl = posterUrl;
            if (!existing.thumbUrl && thumbUrl) patch.thumbUrl = thumbUrl;
            if (Object.keys(patch).length) { Object.assign(existing, patch); await existing.save(); }
            restored++;
          } else {
            await Media.create({ section: section._id, type: 'video', url, posterUrl, thumbUrl, bytes: fs.statSync(abs).size, order: order++ });
            added++;
          }
        } else if (/\.(webp|jpg|jpeg|png)$/i.test(f)) {
          if (videoBaseNames.has(base)) continue; // poster handled with its video
          const key = `gallery/${slug}/${id}.webp`;
          const thumbKey = `gallery/${slug}/${id}-t.webp`;
          const url = storage.publicUrl(key);
          const existing = await Media.findOne({ url });
          if (existing && await storage.exists(key) && await storage.exists(thumbKey)) { skipped++; continue; }

          const pipeline = sharp(abs).rotate();
          const meta = await pipeline.metadata();
          const out = await pipeline
            .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY, effort: 6 })
            .toBuffer();
          await storage.put(key, out, 'image/webp');
          const thumbUrl = await storage.put(thumbKey, await makeThumbBuffer(abs), 'image/webp');

          if (existing) {
            if (!existing.thumbUrl) { existing.thumbUrl = thumbUrl; await existing.save(); }
            restored++;
          } else {
            await Media.create({ section: section._id, type: 'image', url, thumbUrl, width: meta.width || null, height: meta.height || null, bytes: out.length, order: order++ });
            added++;
          }
        }
      } catch {
        failed++;
      }
    }
  }

  return { added, restored, skipped, failed };
};

/**
 * One-time repair for a storage switch (e.g. disk → R2): drop all media records
 * (their files may be gone from the old/ephemeral disk) and re-import the
 * built-in gallery into the current storage backend. Sections are preserved.
 */
const rebuild = async () => {
  await Media.deleteMany({});
  return importDefaults();
};

module.exports = {
  list,
  addSection,
  deleteSection,
  addMedia,
  deleteMedia,
  importDefaults,
  rebuild,
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
