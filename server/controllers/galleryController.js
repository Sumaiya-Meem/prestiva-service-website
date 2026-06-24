const store = require('../utils/galleryStore');

/**
 * Public: list all sections with their images.
 * GET /api/gallery
 */
exports.list = (req, res) => {
  try {
    return res.json({ success: true, sections: store.list() });
  } catch (err) {
    console.error('[gallery] list error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not load gallery.' });
  }
};

/**
 * Admin: create a section.
 * POST /api/gallery/sections  { name }
 */
exports.addSection = (req, res) => {
  try {
    const section = store.addSection(req.body && req.body.name);
    return res.status(201).json({ success: true, section });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: delete a section (and its images).
 * DELETE /api/gallery/sections/:slug
 */
exports.deleteSection = (req, res) => {
  try {
    store.deleteSection(req.params.slug);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: add an image to a section. Expects multipart field "image".
 * POST /api/gallery/sections/:slug/images
 */
exports.addImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded.' });
    const image = await store.addImage(req.params.slug, req.file.buffer, req.file.mimetype);
    return res.status(201).json({ success: true, image });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin: delete a single image from a section.
 * DELETE /api/gallery/sections/:slug/images/:id
 */
exports.deleteImage = (req, res) => {
  try {
    store.deleteImage(req.params.slug, req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
