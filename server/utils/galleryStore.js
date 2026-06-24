/**
 * Gallery storage layer.
 *
 * ⚠️  TEMPORARY FILE-BASED IMPLEMENTATION.
 * This persists gallery sections + images to disk (metadata in data/gallery.json,
 * files in uploads/gallery/<slug>/). It works with NO database so the admin UI is
 * fully functional today.
 *
 * When MongoDB is wired up, swap the internals of these functions for Mongoose
 * model calls (and move file bytes to object storage / a CDN). The exported API
 * — list / addSection / deleteSection / addImage / deleteImage — is what the
 * controller depends on, so callers won't change.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'gallery.json');
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'gallery');

// Public URL prefix (served statically by express in server.js).
const URL_PREFIX = '/uploads/gallery';

// Categories the site already uses — seeded so the admin starts with a familiar
// structure. (Existing photos live in the build for now; this is the manage-able set.)
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
].map(([slug, tag]) => ({ slug, tag, images: [] }));

const slugify = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureDirs = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
};

const read = () => {
  ensureDirs();
  if (!fs.existsSync(DATA_FILE)) {
    const seed = { sections: DEFAULT_SECTIONS };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { sections: [] };
  }
};

const write = (data) => {
  ensureDirs();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const findSection = (data, slug) => data.sections.find((s) => s.slug === slug);

/** All sections with their images. */
const list = () => read().sections;

/** Add a new section from a display name. Returns the created section. */
const addSection = (name) => {
  const tag = String(name || '').trim();
  if (!tag) throw new Error('Section name is required.');
  const slug = slugify(tag);
  if (!slug) throw new Error('Section name must contain letters or numbers.');

  const data = read();
  if (findSection(data, slug)) throw new Error('A section with that name already exists.');

  const section = { slug, tag, images: [] };
  data.sections.push(section);
  write(data);
  fs.mkdirSync(path.join(UPLOAD_ROOT, slug), { recursive: true });
  return section;
};

/** Delete a section and all of its image files. */
const deleteSection = (slug) => {
  const data = read();
  const idx = data.sections.findIndex((s) => s.slug === slug);
  if (idx === -1) throw new Error('Section not found.');

  data.sections.splice(idx, 1);
  write(data);
  fs.rmSync(path.join(UPLOAD_ROOT, slug), { recursive: true, force: true });
};

/**
 * Compress an uploaded image buffer to WebP (1100px wide, like the rest of the
 * gallery) and attach it to a section. Returns the created image record.
 */
const addImage = async (slug, buffer, mimetype) => {
  const data = read();
  const section = findSection(data, slug);
  if (!section) throw new Error('Section not found.');
  if (!buffer || !/^image\//.test(mimetype || '')) throw new Error('A valid image file is required.');

  const id = crypto.randomBytes(8).toString('hex');
  const filename = `${id}.webp`;
  const dir = path.join(UPLOAD_ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });

  const optimized = await sharp(buffer)
    .rotate()
    .resize({ width: 1100, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  fs.writeFileSync(path.join(dir, filename), optimized);

  const image = { id, url: `${URL_PREFIX}/${slug}/${filename}` };
  section.images.push(image);
  write(data);
  return image;
};

/** Remove a single image from a section and delete its file. */
const deleteImage = (slug, id) => {
  const data = read();
  const section = findSection(data, slug);
  if (!section) throw new Error('Section not found.');

  const idx = section.images.findIndex((im) => im.id === id);
  if (idx === -1) throw new Error('Image not found.');

  const [removed] = section.images.splice(idx, 1);
  write(data);

  // url is /uploads/gallery/<slug>/<file> → resolve back to disk path.
  const filename = removed.url.split('/').pop();
  fs.rmSync(path.join(UPLOAD_ROOT, slug, filename), { force: true });
};

module.exports = { list, addSection, deleteSection, addImage, deleteImage, slugify };
