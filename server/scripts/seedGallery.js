/**
 * One-time gallery migration/seed.
 *
 * Imports the images & videos that currently ship as bundled assets in
 * client/src/assets/gallery/** into MongoDB + the server's /uploads folder, so
 * the public site keeps showing all existing media once it starts reading from
 * the API — and every item becomes manageable (removable) from the admin.
 *
 * Safe to re-run: each file maps to a deterministic filename, and items that
 * already exist are skipped (no duplicates).
 *
 * Usage:
 *   cd server && node scripts/seedGallery.js
 *   cd server && node scripts/seedGallery.js "C:/path/to/some/gallery"   (custom source)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const sharp = require('sharp');

dotenv.config();

const GallerySection = require('../models/GallerySection');
const Media = require('../models/Media');
const store = require('../utils/galleryStore');

// folder slug -> display tag
const TAGS = {
  office: 'Office Cleaning',
  commercial: 'Commercial Cleaning',
  builders: 'Builders Cleaning',
  'end-of-lease': 'End of Lease',
  airbnb: 'Airbnb Cleaning',
  'real-estate': 'Real Estate Cleaning',
  pressure: 'Pressure Washing',
  property: 'Property Maintenance',
  window: 'Window Cleaning',
  carpet: 'Carpet Cleaning',
  results: 'Cleaning Results',
  landscaping: 'Landscaping',
};

const SRC =
  process.argv[2] ||
  process.env.GALLERY_SRC ||
  path.join(__dirname, '..', '..', 'client', 'src', 'assets', 'gallery');

const URL_PREFIX = store.URL_PREFIX;
const UPLOAD_ROOT = store.UPLOAD_ROOT;

// Deterministic short id from the source path → idempotent re-runs.
const idFor = (rel) => crypto.createHash('md5').update(rel).digest('hex').slice(0, 16);

const titleCase = (slug) =>
  slug.replace(/(^|-)([a-z])/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase()).trim();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('✗ MONGODB_URI not set in server/.env — cannot seed.');
    process.exit(1);
  }
  if (!fs.existsSync(SRC)) {
    console.error(`✗ Source gallery folder not found: ${SRC}`);
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, socketTimeoutMS: 60000 });
  console.log('✓ Connected to MongoDB\n  Source:', SRC, '\n');

  const folders = fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let addedImages = 0;
  let addedVideos = 0;
  let restored = 0; // record already existed but files were missing on disk → re-written
  let skipped = 0;
  let failed = 0;

  // Create a media record, retrying on transient DB errors (Atlas M0 can be
  // slow to wake and briefly drop writes).
  const createWithRetry = async (doc, label) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { return await Media.create(doc); }
      catch (e) {
        if (attempt === 3) throw e;
        console.log(`    … retry ${attempt} (${label}): ${e.message}`);
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  };

  for (const slug of folders) {
    const dir = path.join(SRC, slug);
    const files = fs.readdirSync(dir).sort();

    // Ensure the section exists.
    let section = await GallerySection.findOne({ slug });
    if (!section) {
      const order = await GallerySection.estimatedDocumentCount();
      section = await GallerySection.create({
        slug,
        tag: TAGS[slug] || titleCase(slug),
        order,
      });
    }

    const destDir = path.join(UPLOAD_ROOT, slug);
    fs.mkdirSync(destDir, { recursive: true });

    let order = await Media.countDocuments({ section: section._id });

    // Any image NOT named like a sibling video's poster is a standalone image.
    const videoBaseNames = new Set(
      files.filter((f) => /\.(mp4|webm|mov)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, ''))
    );

    let secAdded = 0, secRestored = 0, secSkipped = 0, secFailed = 0;

    for (const f of files) {
      const abs = path.join(dir, f);
      const ext = path.extname(f).toLowerCase();
      const base = f.replace(/\.[^.]+$/, '');
      const rel = `${slug}/${f}`;
      const id = idFor(rel);

      // Each file is isolated: a single failure is logged and skipped so the
      // rest of the import still completes (re-run later to fill any gaps).
      // Skip only when BOTH the record AND its file already exist — so running
      // on a fresh server (records in the shared DB, files missing on disk)
      // still writes the files.
      try {
        // ── Video ──
        if (/\.(mp4|webm|mov)$/i.test(f)) {
          const url = `${URL_PREFIX}/${slug}/${id}${ext}`;
          const videoDest = path.join(destDir, `${id}${ext}`);
          const existing = await Media.findOne({ url });
          if (existing && fs.existsSync(videoDest)) { skipped++; secSkipped++; continue; }

          fs.copyFileSync(abs, videoDest);

          let posterUrl = '';
          let thumbUrl = '';
          const poster = files.find(
            (p) => p.replace(/\.[^.]+$/, '') === base && /\.(jpg|jpeg|png)$/i.test(p)
          );
          if (poster) {
            const pExt = path.extname(poster).toLowerCase();
            const posterSrc = path.join(dir, poster);
            fs.copyFileSync(posterSrc, path.join(destDir, `${id}${pExt}`));
            posterUrl = `${URL_PREFIX}/${slug}/${id}${pExt}`;
            await store.makeThumb(posterSrc, path.join(destDir, `${id}-t.webp`));
            thumbUrl = `${URL_PREFIX}/${slug}/${id}-t.webp`;
          }

          if (existing) {
            // Files were missing → now restored. Backfill any empty fields.
            const patch = {};
            if (!existing.posterUrl && posterUrl) patch.posterUrl = posterUrl;
            if (!existing.thumbUrl && thumbUrl) patch.thumbUrl = thumbUrl;
            if (Object.keys(patch).length) { Object.assign(existing, patch); await existing.save(); }
            restored++; secRestored++;
          } else {
            await createWithRetry(
              { section: section._id, type: 'video', url, posterUrl, thumbUrl, bytes: fs.statSync(abs).size, order: order++ },
              rel
            );
            addedVideos++; secAdded++;
          }
          continue;
        }

        // ── Image (skip files that are a video's poster) ──
        if (/\.(webp|jpg|jpeg|png)$/i.test(f)) {
          if (videoBaseNames.has(base)) continue; // it's a poster, handled above
          const url = `${URL_PREFIX}/${slug}/${id}.webp`;
          const imgDest = path.join(destDir, `${id}.webp`);
          const thumbDest = path.join(destDir, `${id}-t.webp`);
          const existing = await Media.findOne({ url });
          if (existing && fs.existsSync(imgDest) && fs.existsSync(thumbDest)) { skipped++; secSkipped++; continue; }

          const pipeline = sharp(abs).rotate();
          const meta = await pipeline.metadata();
          const out = await pipeline
            .resize({ width: store.IMAGE_WIDTH, withoutEnlargement: true })
            .webp({ quality: store.WEBP_QUALITY, effort: 6 })
            .toBuffer();
          fs.writeFileSync(imgDest, out);
          await store.makeThumb(abs, thumbDest);

          const thumbUrl = `${URL_PREFIX}/${slug}/${id}-t.webp`;
          if (existing) {
            if (!existing.thumbUrl) { existing.thumbUrl = thumbUrl; await existing.save(); }
            restored++; secRestored++;
          } else {
            await createWithRetry(
              {
                section: section._id, type: 'image', url, thumbUrl,
                width: meta.width || null, height: meta.height || null,
                bytes: out.length, order: order++,
              },
              rel
            );
            addedImages++; secAdded++;
          }
        }
      } catch (e) {
        failed++; secFailed++;
        console.log(`  ✗ ${slug}/${f}: ${e.message}`);
      }
    }

    console.log(
      `  ${section.tag.padEnd(22)} +${secAdded} added` +
      (secRestored ? `, ${secRestored} files restored` : '') +
      `, ${secSkipped} skipped` +
      (secFailed ? `, ${secFailed} FAILED` : '')
    );
  }

  console.log(
    `\n✓ Done. Imported ${addedImages} image(s), ${addedVideos} video(s).` +
    (restored ? ` Restored ${restored} missing file(s) for existing records.` : '') +
    ` Skipped ${skipped} already-present.` +
    (failed ? ` ${failed} FAILED — re-run to retry them.` : '')
  );
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('✗ Seed failed:', err.message);
  try { await mongoose.disconnect(); } catch { /* ignore */ }
  process.exit(1);
});
