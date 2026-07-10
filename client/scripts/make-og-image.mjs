// One-off: build a 1200×630 JPG social-share image (og:image) from an on-brand
// gallery photo. Social scrapers (Facebook/WhatsApp/LinkedIn) need a raster image
// at an absolute URL — an SVG logo won't render. Safe to delete after running.
// Run: node scripts/make-og-image.mjs   (swap SRC for a nicer photo if needed)
import sharp from 'sharp';

const SRC = 'src/assets/gallery/airbnb/1.webp';
const OUT = 'public/og-image.jpg';

await sharp(SRC)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT} — ${meta.width}x${meta.height}, ${meta.format}`);
