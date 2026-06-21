/**
 * ============================================
 * IMAGE COMPRESSION
 * ============================================
 * Optimizes the images in src/assets using sharp.
 *
 *  • PNG / JPG / JPEG  →  generates an optimized sibling .webp
 *  • Standalone .webp  →  re-encoded in place (only kept if smaller)
 *
 * Run with:  npm run compress:images
 *
 * Source images (.png/.jpg) are left untouched as masters; the app
 * imports the .webp versions. Re-run any time you add new images.
 * ============================================
 */

import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join, extname, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets');

// Tunables
const WEBP_QUALITY = 80;   // 0-100; 80 is a strong size/quality balance
const MAX_WIDTH = 1920;    // downscale anything wider; never upscales

const RASTER = new Set(['.png', '.jpg', '.jpeg']);

/** Recursively collect every file under a directory. */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = join(dir, e.name);
      return e.isDirectory() ? walk(full) : Promise.resolve([full]);
    })
  );
  return files.flat();
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function main() {
  const files = await walk(ASSETS_DIR);
  let savedBytes = 0;
  let processed = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const dir = dirname(file);
    const name = basename(file, ext);

    const pipeline = (input) =>
      sharp(input)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY });

    try {
      if (RASTER.has(ext)) {
        // PNG/JPG → sibling .webp
        const out = join(dir, `${name}.webp`);
        const before = (await stat(file)).size;
        await pipeline(file).toFile(out);
        const after = (await stat(out)).size;
        savedBytes += before - after;
        processed += 1;
        console.log(`✓ ${name}${ext} → ${name}.webp   ${kb(before)} → ${kb(after)}`);
      } else if (ext === '.webp') {
        // Skip webp that were just generated from a raster master this run
        const hasMaster = files.some(
          (f) => dirname(f) === dir && basename(f, extname(f)) === name && RASTER.has(extname(f).toLowerCase())
        );
        if (hasMaster) continue;

        // Standalone webp → re-encode to a temp, keep only if smaller
        const before = (await stat(file)).size;
        const tmp = join(dir, `${name}.tmp.webp`);
        await pipeline(file).toFile(tmp);
        const after = (await stat(tmp)).size;
        if (after < before) {
          await rename(tmp, file);
          savedBytes += before - after;
          console.log(`✓ ${name}.webp (re-encoded)   ${kb(before)} → ${kb(after)}`);
        } else {
          await unlink(tmp);
        }
        processed += 1;
      }
    } catch (err) {
      console.error(`✗ Failed on ${file}:`, err.message);
    }
  }

  console.log(`\nDone. Processed ${processed} images, saved ${kb(savedBytes)} total.`);
}

main();
