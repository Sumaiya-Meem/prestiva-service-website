const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { dbReady } = require('../config/db');
const Settings = require('../models/Settings');

/**
 * Per-page hero/background images.
 *
 * The image bytes live on disk under /uploads/backgrounds/ (served statically),
 * and the resulting URL is stored in the site Settings overrides under
 * `pageBackgrounds.<page>`. Because the public site already loads /api/settings
 * before first render, a saved background shows up on the page automatically —
 * no separate endpoint or reload wiring needed.
 */
const FIXED_KEY = 'site';
const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const UPLOAD_DIR = path.join(UPLOAD_BASE, 'backgrounds');
const URL_PREFIX = '/uploads/backgrounds';

// Pages whose hero background can be managed. Keep in sync with the client's
// config/pageBackgrounds.js list.
const PAGES = [
  'home', 'about', 'commercial', 'residential', 'landscaping',
  'cleaning', 'property-maintenance', 'gallery', 'contact',
];

const ensureDir = () => fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const removeByUrl = (url) => {
  if (!url || !url.startsWith(`${URL_PREFIX}/`)) return;
  fs.rmSync(path.join(UPLOAD_DIR, url.split('/').pop()), { force: true });
};

const currentBg = async (page) => {
  const doc = await Settings.findOne({ key: FIXED_KEY }).lean();
  return (doc && doc.overrides && doc.overrides.pageBackgrounds && doc.overrides.pageBackgrounds[page]) || '';
};

/**
 * Admin: upload / replace a page's background image.
 * POST /api/backgrounds/:page   (multipart field "file")
 */
exports.upload = async (req, res) => {
  if (!dbReady()) return res.status(503).json({ success: false, message: 'Database not configured.' });
  const { page } = req.params;
  if (!PAGES.includes(page)) return res.status(400).json({ success: false, message: 'Unknown page.' });
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded.' });
  if (!/^image\//.test(req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'Only image files are allowed.' });
  }

  try {
    ensureDir();
    const prev = await currentBg(page);

    // Compress to a wide hero-friendly WebP.
    const id = crypto.randomBytes(6).toString('hex');
    const filename = `${page}-${id}.webp`;
    const optimized = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toBuffer();
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), optimized);

    const url = `${URL_PREFIX}/${filename}`;
    await Settings.findOneAndUpdate(
      { key: FIXED_KEY },
      { $set: { [`overrides.pageBackgrounds.${page}`]: url } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    if (prev && prev !== url) removeByUrl(prev); // delete the old file after a successful save
    return res.status(201).json({ success: true, page, url });
  } catch (err) {
    console.error('[backgrounds] upload error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not save background.' });
  }
};

/**
 * Admin: remove a page's custom background (reverts to the built-in default).
 * DELETE /api/backgrounds/:page
 */
exports.remove = async (req, res) => {
  if (!dbReady()) return res.status(503).json({ success: false, message: 'Database not configured.' });
  const { page } = req.params;
  if (!PAGES.includes(page)) return res.status(400).json({ success: false, message: 'Unknown page.' });

  try {
    const prev = await currentBg(page);
    await Settings.findOneAndUpdate(
      { key: FIXED_KEY },
      { $unset: { [`overrides.pageBackgrounds.${page}`]: '' } }
    );
    removeByUrl(prev);
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[backgrounds] remove error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not remove background.' });
  }
};

exports.PAGES = PAGES;
