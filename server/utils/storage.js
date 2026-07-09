/**
 * Storage abstraction for admin-managed media.
 *
 *   • cloudinary — Cloudinary media storage + CDN, for production on an ephemeral
 *                  host. Active when CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /
 *                  CLOUDINARY_API_SECRET are all set.
 *   • disk       — the host filesystem under UPLOAD_BASE (local dev / persistent disk).
 *
 * Keys are paths relative to the uploads root, WITH an extension, e.g.
 * "gallery/office/ab12.webp" or "backgrounds/home-ab12.webp". put()/publicUrl()
 * return a FULL public URL stored directly in Mongo and used as-is by the client
 * (absolute URLs pass through; "/uploads/..." is prefixed with the API host by
 * the client's mediaUrl()).
 *
 * publicUrl(key) is DETERMINISTIC (no version segment) so importDefaults can look
 * up an existing record by the same URL it would store.
 */
const fs = require('fs');
const path = require('path');

const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

const CLD = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

const useCloud = Boolean(CLD.cloudName && CLD.apiKey && CLD.apiSecret);

const anyCloud = CLD.cloudName || CLD.apiKey || CLD.apiSecret;
if (!useCloud && anyCloud) {
  console.warn('[storage] Cloudinary is only partially configured — using disk. Set ALL of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
}

const mode = () => (useCloud ? 'cloudinary' : 'disk');

// One-line boot log so it's obvious which backend is active (esp. in local dev).
console.log(`[storage] media backend: ${mode()}${useCloud ? ` (cloud: ${CLD.cloudName})` : ''}`);

// Lazily-configured Cloudinary v2 SDK (only touched in cloudinary mode).
let _cld = null;
const cld = () => {
  if (_cld) return _cld;
  _cld = require('cloudinary').v2;
  _cld.config({ cloud_name: CLD.cloudName, api_key: CLD.apiKey, api_secret: CLD.apiSecret, secure: true });
  return _cld;
};

// Videos need Cloudinary's 'video' resource type (streaming, range requests);
// everything else is an 'image'.
const isVideoKey = (key) => /\.(mp4|webm|mov)$/i.test(key);
const resourceType = (key) => (isVideoKey(key) ? 'video' : 'image');
// Cloudinary public_id excludes the extension; the delivery URL re-appends it.
const publicId = (key) => key.replace(/\.[^./]+$/, '');
const extOf = (key) => path.extname(key).slice(1);

const diskPath = (key) => path.join(UPLOAD_BASE, key);

const publicUrl = (key) =>
  (useCloud
    ? `https://res.cloudinary.com/${CLD.cloudName}/${resourceType(key)}/upload/${publicId(key)}.${extOf(key)}`
    : `/uploads/${key}`);

const keyFromUrl = (url) => {
  if (!url) return '';
  // Cloudinary: .../<image|video|raw>/upload/[v123/]<public_id>.<ext>
  const m = url.match(/\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+)$/);
  if (m) return m[1];
  return url.replace(/^\/?uploads\//, '');
};

// Upload a Buffer to Cloudinary via a stream (promisified).
const cloudUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cld().uploader.upload_stream(options, (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(buffer);
  });

const put = async (key, buffer, contentType) => {
  if (useCloud) {
    const resource_type = /^video\//.test(contentType || '') ? 'video' : 'image';
    await cloudUpload(buffer, { public_id: publicId(key), resource_type, overwrite: true, invalidate: true });
  } else {
    const dest = diskPath(key);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
  }
  return publicUrl(key);
};

const del = async (key) => {
  if (!key) return;
  if (useCloud) {
    try {
      await cld().uploader.destroy(publicId(key), { resource_type: resourceType(key), invalidate: true });
    } catch { /* already gone */ }
  } else {
    fs.rmSync(diskPath(key), { force: true });
  }
};

const delPrefix = async (prefix) => {
  if (useCloud) {
    // Cloudinary deletes by public_id prefix, per resource type. A section can
    // hold both images and videos, so clear both.
    for (const resource_type of ['image', 'video']) {
      try { await cld().api.delete_resources_by_prefix(prefix, { resource_type }); }
      catch { /* nothing of this type / already gone */ }
    }
  } else {
    fs.rmSync(diskPath(prefix), { recursive: true, force: true });
  }
};

const exists = async (key) => {
  if (useCloud) {
    try { await cld().api.resource(publicId(key), { resource_type: resourceType(key) }); return true; }
    catch { return false; }
  }
  return fs.existsSync(diskPath(key));
};

module.exports = { mode, put, del, delPrefix, exists, publicUrl, keyFromUrl, UPLOAD_BASE };
