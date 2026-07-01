/**
 * Backfill thumbnails for existing gallery media.
 *
 * Generates a small tile thumbnail (WebP) for every Media document that doesn't
 * have one yet, using the file already on disk (the full image, or a video's
 * poster). Run once after deploying the thumbnail feature; safe to re-run.
 *
 * Usage:  cd server && node scripts/backfillThumbs.js
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Media = require('../models/Media');
const store = require('../utils/galleryStore');

// /uploads/gallery/<slug>/<file>  →  absolute disk path
const diskFromUrl = (u) => path.join(store.UPLOAD_ROOT, u.replace(`${store.URL_PREFIX}/`, ''));
// …and its <slug>
const slugFromUrl = (u) => {
  const parts = u.split('/');
  return parts[parts.length - 2];
};

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('✗ MONGODB_URI not set in server/.env — cannot backfill.');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, socketTimeoutMS: 60000 });
  const items = await Media.find({ $or: [{ thumbUrl: { $exists: false } }, { thumbUrl: '' }] });
  console.log(`✓ Connected. Media needing a thumbnail: ${items.length}\n`);

  let done = 0, skipped = 0, failed = 0;

  for (const m of items) {
    try {
      // Source: images use their own file; videos use the poster frame.
      const src = m.type === 'video'
        ? (m.posterUrl ? diskFromUrl(m.posterUrl) : null)
        : diskFromUrl(m.url);

      if (!src || !fs.existsSync(src)) {
        skipped++;
        console.log(`  – skip (no source file): ${m.url}`);
        continue;
      }

      const slug = slugFromUrl(m.url);
      const base = path.basename(m.url).replace(/\.[^.]+$/, '');
      const thumbName = `${base}-t.webp`;
      await store.makeThumb(src, path.join(store.UPLOAD_ROOT, slug, thumbName));

      m.thumbUrl = `${store.URL_PREFIX}/${slug}/${thumbName}`;
      await m.save();
      done++;
    } catch (e) {
      failed++;
      console.log(`  ✗ ${m.url}: ${e.message}`);
    }
  }

  console.log(`\n✓ Done. Thumbnails created: ${done}, skipped: ${skipped}` + (failed ? `, ${failed} failed` : ''));
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('✗ Backfill failed:', err.message);
  try { await mongoose.disconnect(); } catch { /* ignore */ }
  process.exit(1);
});
