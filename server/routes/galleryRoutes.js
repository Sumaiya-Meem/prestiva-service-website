const express = require('express');
const multer = require('multer');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const adminAuth = require('../middleware/adminAuth');

// Uploads are held in memory, then images are compressed to WebP and videos are
// written to disk (with a poster extracted) by the store. Images and short
// result clips both fit comfortably under the limit below.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB raw — videos are re-compressed on save
  fileFilter: (req, file, cb) =>
    cb(null, /^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)),
});

// Multer errors (e.g. file too large) → clean JSON instead of an HTML stack.
const uploadMedia = (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large (max 200MB).'
        : err.message || 'Upload failed.';
      return res.status(400).json({ success: false, message: msg });
    }
    next();
  });

// Public: read the gallery (consumed by the public site).
router.get('/', galleryController.list);

// Admin (token-protected): manage sections & media.
router.post('/sections', adminAuth, galleryController.addSection);
router.delete('/sections/:slug', adminAuth, galleryController.deleteSection);
router.post('/sections/:slug/media', adminAuth, uploadMedia, galleryController.addMedia);
router.delete('/sections/:slug/media/:id', adminAuth, galleryController.deleteMedia);

module.exports = router;
