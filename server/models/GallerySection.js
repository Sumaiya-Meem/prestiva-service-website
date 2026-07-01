const mongoose = require('mongoose');

/**
 * A gallery category (e.g. "Office Cleaning", "Pressure Washing").
 * Media documents reference a section via its ObjectId. `slug` is the
 * URL-safe key the public site groups/filters by; `order` lets the admin
 * arrange how sections appear.
 */
const gallerySectionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    tag: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GallerySection', gallerySectionSchema);
