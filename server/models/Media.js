const mongoose = require('mongoose');

/**
 * A single gallery media item — an image or a video — belonging to a section.
 *
 * The bytes themselves live on disk under /uploads/gallery/<slug>/ (served
 * statically by Express). This document holds the metadata: where the file is,
 * its poster frame (for videos), dimensions and display order. Swapping disk
 * for object storage later means only changing how `url`/`posterUrl` are built.
 */
const mediaSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GallerySection',
      required: true,
      index: true,
    },
    type: { type: String, enum: ['image', 'video'], required: true, index: true },

    // Server-relative paths (e.g. /uploads/gallery/office/ab12.webp).
    url: { type: String, required: true },       // full-size image / the video file
    thumbUrl: { type: String, default: '' },     // small WebP for grid/carousel tiles
    posterUrl: { type: String, default: '' },    // videos only — full-size poster frame

    width: { type: Number, default: null },
    height: { type: Number, default: null },
    bytes: { type: Number, default: 0 },

    // Display order within a section (lower first).
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

// Fast "media for a section, in order" reads.
mediaSchema.index({ section: 1, order: 1, createdAt: 1 });

module.exports = mongoose.model('Media', mediaSchema);
