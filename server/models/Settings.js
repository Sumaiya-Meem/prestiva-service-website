const mongoose = require('mongoose');

/**
 * A single settings document holding admin-editable overrides for the site
 * config (prices, contact details, key text, etc.). The frontend deep-merges
 * `overrides` on top of its static defaults, so anything not set here simply
 * falls back to the built-in siteConfig values.
 *
 * We keep exactly one document, identified by the fixed key 'site'.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true, index: true },
    overrides: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Settings', settingsSchema);
