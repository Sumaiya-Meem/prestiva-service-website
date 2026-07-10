const { dbReady } = require('../config/db');
const Page = require('../models/Page');
const { slugify, isReservedSlug } = require('../utils/slug');

const notConfigured = (res) =>
  res.status(503).json({ success: false, message: 'Database not configured.' });

/** Normalise + validate a slug; returns { slug } or { error }. */
const cleanSlug = (raw) => {
  const slug = slugify(raw);
  if (isReservedSlug(slug)) return { error: 'That web address is reserved — choose another.' };
  return { slug };
};

// Public: a single published page.
exports.getBySlug = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[pages] getBySlug error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not load page.' });
  }
};

// Public: published pages flagged for the nav menu (minimal fields).
// Fault-tolerant — returns an empty list on any problem so the header never breaks.
exports.listNav = async (req, res) => {
  if (!dbReady()) return res.json({ success: true, pages: [] });
  try {
    const pages = await Page.find({ status: 'published', showInNav: true })
      .select('slug title navLabel')
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ success: true, pages });
  } catch (err) {
    console.error('[pages] listNav error:', err.message);
    return res.json({ success: true, pages: [] });
  }
};

// Admin: every page (incl. drafts).
exports.listAll = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  const pages = await Page.find().sort({ updatedAt: -1 }).lean();
  return res.json({ success: true, pages });
};

exports.create = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  const body = (req.body && req.body.page) || {};
  const { slug, error } = cleanSlug(body.slug || body.title);
  if (error) return res.status(400).json({ success: false, message: error });
  try {
    const exists = await Page.findOne({ slug }).lean();
    if (exists) return res.status(409).json({ success: false, message: 'That web address is already used.' });
    const page = await Page.create({ ...body, slug });
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[pages] create error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not create page.' });
  }
};

exports.update = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  const body = (req.body && req.body.page) || {};
  const patch = { ...body };
  if (body.slug !== undefined) {
    const { slug, error } = cleanSlug(body.slug);
    if (error) return res.status(400).json({ success: false, message: error });
    const clash = await Page.findOne({ slug, _id: { $ne: req.params.id } }).lean();
    if (clash) return res.status(409).json({ success: false, message: 'That web address is already used.' });
    patch.slug = slug;
  }
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, patch, { new: true }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found.' });
    return res.json({ success: true, page });
  } catch (err) {
    console.error('[pages] update error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not save page.' });
  }
};

exports.remove = async (req, res) => {
  if (!dbReady()) return notConfigured(res);
  try {
    await Page.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('[pages] remove error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not delete page.' });
  }
};
