const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Lightweight token check used by the admin login screen.
// Works without a DB so login can be validated independently of persistence.
router.get('/verify', adminAuth, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
