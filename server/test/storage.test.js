const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Force disk mode with a throwaway UPLOAD_DIR BEFORE requiring the module
// (storage.js reads env at load time).
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'prestiva-storage-test-'));
process.env.UPLOAD_DIR = TMP;
for (const k of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_BASE']) delete process.env[k];

const storage = require('../utils/storage');

test('mode() is disk when R2 env is absent', () => {
  assert.strictEqual(storage.mode(), 'disk');
});

test('publicUrl() returns a relative /uploads path in disk mode', () => {
  assert.strictEqual(storage.publicUrl('gallery/office/x.webp'), '/uploads/gallery/office/x.webp');
});

test('keyFromUrl() strips /uploads/ from a relative disk URL', () => {
  assert.strictEqual(storage.keyFromUrl('/uploads/gallery/office/x.webp'), 'gallery/office/x.webp');
});

test('keyFromUrl() extracts the key from an absolute Cloudinary URL', () => {
  assert.strictEqual(
    storage.keyFromUrl('https://res.cloudinary.com/demo/image/upload/gallery/office/x.webp'),
    'gallery/office/x.webp'
  );
});

test('put/exists/del round-trip on disk', async () => {
  const url = await storage.put('gallery/test/a.webp', Buffer.from('hi'), 'image/webp');
  assert.strictEqual(url, '/uploads/gallery/test/a.webp');
  assert.strictEqual(fs.readFileSync(path.join(TMP, 'gallery/test/a.webp'), 'utf8'), 'hi');
  assert.strictEqual(await storage.exists('gallery/test/a.webp'), true);
  await storage.del('gallery/test/a.webp');
  assert.strictEqual(await storage.exists('gallery/test/a.webp'), false);
});

test('delPrefix() removes a whole section on disk', async () => {
  await storage.put('gallery/sec/1.webp', Buffer.from('1'), 'image/webp');
  await storage.put('gallery/sec/2.webp', Buffer.from('2'), 'image/webp');
  await storage.delPrefix('gallery/sec/');
  assert.strictEqual(await storage.exists('gallery/sec/1.webp'), false);
  assert.strictEqual(await storage.exists('gallery/sec/2.webp'), false);
});
