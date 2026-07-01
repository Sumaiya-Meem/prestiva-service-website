const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/backgroundController');
const adminAuth = require('../middleware/adminAuth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB raw; compressed on save
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

const one = (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large (max 20MB).'
        : err.message || 'Upload failed.';
      return res.status(400).json({ success: false, message: msg });
    }
    next();
  });

// Admin (token-protected). Reading happens via /api/settings (pageBackgrounds).
router.post('/:page', adminAuth, one, ctrl.upload);
router.delete('/:page', adminAuth, ctrl.remove);

module.exports = router;
