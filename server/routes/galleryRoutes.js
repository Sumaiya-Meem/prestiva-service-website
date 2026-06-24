const express = require('express');
const multer = require('multer');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const adminAuth = require('../middleware/adminAuth');

// Uploaded images are held in memory, then compressed to WebP by the store.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB raw; compressed on save
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

// Public: read the gallery (the public site can consume this later).
router.get('/', galleryController.list);

// Admin (token-protected): manage sections & images.
router.post('/sections', adminAuth, galleryController.addSection);
router.delete('/sections/:slug', adminAuth, galleryController.deleteSection);
router.post('/sections/:slug/images', adminAuth, upload.single('image'), galleryController.addImage);
router.delete('/sections/:slug/images/:id', adminAuth, galleryController.deleteImage);

module.exports = router;
