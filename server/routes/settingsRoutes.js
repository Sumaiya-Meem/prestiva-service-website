const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const adminAuth = require('../middleware/adminAuth');

// Public: read effective overrides (consumed by the frontend on load)
router.get('/', settingsController.getSettings);

// Admin: save overrides
router.put('/', adminAuth, settingsController.updateSettings);

module.exports = router;
