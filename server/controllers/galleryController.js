const store = require('../utils/galleryStore');
const { dbReady } = require('../config/db');

const requireDb = (res) => {
  if (dbReady()) return true;
  res.status(503).json({ success: false, message: 'Database not configured.' });
  return false;
};

/**
 * Public: list all sections with their media.
 * GET /api/gallery
 * Never fails the public site — returns an empty list if the DB is unavailable.
 */
exports.list = async (req, res) => {
  if (!dbReady()) return res.json({ success: true, sections: [] });
  try {
    // Let browsers reuse the response briefly, so a quick reload doesn't re-query
    // the DB. Short enough that admin changes still appear promptly.
    res.set('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, sections: await store.list() });
  } catch (err) {
    console.error('[gallery] list error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not load gallery.' });
  }
};

/**
 * Admin: create a section.
 * POST /api/gallery/sections  { name }
 */
exports.addSection = async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const section = await store.addSection(req.body && req.body.name);
    return res.status(201).json({ success: true, section });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: delete a section (and its media).
 * DELETE /api/gallery/sections/:slug
 */
exports.deleteSection = async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await store.deleteSection(req.params.slug);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: add an image OR video to a section. Expects multipart field "file".
 * POST /api/gallery/sections/:slug/media
 */
exports.addMedia = async (req, res) => {
  if (!requireDb(res)) return;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const media = await store.addMedia(req.params.slug, req.file);
    return res.status(201).json({ success: true, media });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: import the built-in gallery (images/videos committed in the repo) onto
 * this server's storage. Fixes the case where media records exist in the DB but
 * their files were only ever created on a developer's machine.
 * POST /api/gallery/import-defaults
 */
exports.importDefaults = async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const result = await store.importDefaults();
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[gallery] importDefaults error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: delete a single media item from a section.
 * DELETE /api/gallery/sections/:slug/media/:id
 */
exports.deleteMedia = async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await store.deleteMedia(req.params.slug, req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
