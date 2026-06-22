const { dbReady } = require('../config/db');
const Settings = require('../models/Settings');

const FIXED_KEY = 'site';

/**
 * Public: return the saved config overrides (or {} if none / no DB).
 * The frontend merges these over its static defaults.
 * GET /api/settings
 */
exports.getSettings = async (req, res) => {
  if (!dbReady()) return res.json({ success: true, settings: {} });
  try {
    const doc = await Settings.findOne({ key: FIXED_KEY }).lean();
    return res.json({ success: true, settings: doc?.overrides || {} });
  } catch (err) {
    console.error('[settings] get error:', err.message);
    return res.json({ success: true, settings: {} }); // never break the public site
  }
};

/**
 * Admin: replace the overrides object. Token-protected.
 * PUT /api/settings  { settings: { ... } }
 */
exports.updateSettings = async (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: 'Database not configured.' });
  }
  const overrides = req.body && req.body.settings;
  if (typeof overrides !== 'object' || overrides === null || Array.isArray(overrides)) {
    return res.status(400).json({ success: false, message: 'Body must be { settings: { ... } }.' });
  }
  try {
    const doc = await Settings.findOneAndUpdate(
      { key: FIXED_KEY },
      { overrides },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({ success: true, settings: doc.overrides });
  } catch (err) {
    console.error('[settings] update error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not save settings.' });
  }
};
