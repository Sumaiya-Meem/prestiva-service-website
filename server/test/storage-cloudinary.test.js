const test = require('node:test');
const assert = require('node:assert');

// Set Cloudinary env BEFORE requiring the module so it initialises in cloudinary
// mode. (Node runs each test FILE in its own process, so this is isolated from
// the disk-mode tests.) These tests exercise only the pure URL helpers — the
// Cloudinary SDK is never configured/called, so no network access happens.
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = 'key123';
process.env.CLOUDINARY_API_SECRET = 'secret123';

const storage = require('../utils/storage');

test('mode() is cloudinary when the three vars are set', () => {
  assert.strictEqual(storage.mode(), 'cloudinary');
});

test('publicUrl() builds an image delivery URL (no version segment)', () => {
  assert.strictEqual(
    storage.publicUrl('gallery/office/x.webp'),
    'https://res.cloudinary.com/demo-cloud/image/upload/gallery/office/x.webp'
  );
});

test('publicUrl() builds a video delivery URL', () => {
  assert.strictEqual(
    storage.publicUrl('gallery/results/clip.mp4'),
    'https://res.cloudinary.com/demo-cloud/video/upload/gallery/results/clip.mp4'
  );
});

test('keyFromUrl() reverses publicUrl() for images and videos', () => {
  for (const key of ['gallery/office/x.webp', 'gallery/results/clip.mp4', 'backgrounds/home-ab.webp']) {
    assert.strictEqual(storage.keyFromUrl(storage.publicUrl(key)), key);
  }
});

test('keyFromUrl() tolerates a Cloudinary version segment', () => {
  assert.strictEqual(
    storage.keyFromUrl('https://res.cloudinary.com/demo-cloud/image/upload/v1699999999/gallery/office/x.webp'),
    'gallery/office/x.webp'
  );
});
