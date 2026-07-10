const mongoose = require('mongoose');

/**
 * A marketing-built page (landing page). Rendered on the public site by the
 * dynamic `/:slug` route from its ordered `blocks`. Only `published` pages are
 * served publicly; `draft` pages 404 for visitors.
 */
const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      noindex: { type: Boolean, default: false },
    },
    showInNav: { type: Boolean, default: false },
    navLabel: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('Page', pageSchema);
