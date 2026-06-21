const express = require('express');
const multer = require('multer');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Photos are held in memory and attached to the notification email.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 6 }, // 6MB each, up to 6 files
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

router.post('/', upload.array('photos', 6), contactController.submitContact);

module.exports = router;
