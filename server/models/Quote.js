const mongoose = require('mongoose');

/**
 * A single quote request submitted through the website contact form.
 * Photos themselves are emailed as attachments; here we store metadata
 * (filename + size) so the record is lightweight. Add an object-storage
 * URL field later if/when uploads are persisted to S3/R2.
 */
const photoSchema = new mongoose.Schema(
  {
    filename: String,
    size: Number,
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    service: { type: String, required: true, trim: true },
    propertyType: { type: String, trim: true, default: '' },
    preferredDate: { type: String, trim: true, default: '' },
    suburb: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    photos: { type: [photoSchema], default: [] },

    // Lead pipeline
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'won', 'lost'],
      default: 'new',
      index: true,
    },

    // Private admin notes (never shown to the customer).
    internalNotes: { type: String, trim: true, default: '' },

    // Soft-hide from the default list without deleting the record.
    archived: { type: Boolean, default: false, index: true },

    // Light audit context
    source: { type: String, default: 'website' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

// Common dashboard query: newest-first, filtered by pipeline status.
quoteSchema.index({ archived: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);
