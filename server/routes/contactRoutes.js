const express = require('express');
const multer = require('multer');
const router = express.Router();
const contactController = require('../controllers/contactController');
const adminAuth = require('../middleware/adminAuth');

// Photos are held in memory and attached to the notification email.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 6 }, // 6MB each, up to 6 files
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

// Public: submit a quote request
router.post('/', upload.array('photos', 6), contactController.submitContact);

// Admin (token-protected): view & manage saved quotes
router.get('/', adminAuth, contactController.listQuotes);
router.patch('/:id', adminAuth, contactController.updateQuoteStatus);

module.exports = router;
