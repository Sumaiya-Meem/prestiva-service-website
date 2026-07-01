import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';
import useCarousel from '../../utils/useCarousel';

// All photos per category, loaded from the gallery folders.
const modules = import.meta.glob('../../../assets/gallery/**/*.webp', { eager: true, query: '?url', import: 'default' });

const ORDER = ['property', 'pressure', 'office', 'builders', 'end-of-lease', 'real-estate', 'airbnb'];
const TAGS = {
  office: 'Office Cleaning',
  builders: 'Builders Cleaning',
  'end-of-lease': 'End of Lease',
  'real-estate': 'Real Estate Cleaning',
  airbnb: 'Airbnb Cleaning',
  pressure: 'Pressure Washing',
  property: 'Property Maintenance',
};

const byFolder = {};
Object.entries(modules)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([p, url]) => {
    const slug = p.split('/').slice(-2, -1)[0];
    (byFolder[slug] = byFolder[slug] || []).push(url);
  });

const categories = ORDER.filter((slug) => byFolder[slug] && byFolder[slug].length).map((slug) => ({
  slug,
  tag: TAGS[slug],
  images: byFolder[slug].slice(0, 4),
}));

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CategoryCard = ({ tag, images, to, index }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduceMotion() || images.length <= 1) return;
    const interval = 3000 + (index % 3) * 700; // desync the cards
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), interval);
    return () => clearInterval(id);
  }, [images.length, index]);

  return (
    <Link to={to} className="cat-card" aria-label={`View ${tag} photos`}>
      <div className="cat-card__imgs">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? `${tag} — Prestiva` : ''}
            className={`cat-card__img${i === idx ? ' is-active' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
      <span className="cat-card__overlay">
        <span className="cat-card__tag">{tag}</span>
        <span className="cat-card__view">View gallery <ArrowRight /></span>
      </span>
    </Link>
  );
};

const BeforeAfterGallery = () => {
  const { trackRef, slide, pause, resume } = useCarousel({ gap: 22, interval: 4600 });

  return (
    <section className="section before-after-gallery">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title">Our Recent Work</h2>
          <p className="section-subtitle">Real results from real jobs across {siteConfig.locationText}</p>
        </div>

        <div className="cat-carousel" onMouseEnter={pause} onMouseLeave={resume}>
          <button className="carousel-arrow carousel-arrow--prev" onClick={() => slide(-1)} aria-label="Previous">
            <ChevronLeft />
          </button>

          <div className="cat-track" ref={trackRef}>
            {categories.map((c, i) => (
              <CategoryCard
                key={c.slug}
                index={i}
                tag={c.tag}
                images={c.images}
                to={`/gallery?cat=${encodeURIComponent(c.tag)}`}
              />
            ))}
          </div>

          <button className="carousel-arrow carousel-arrow--next" onClick={() => slide(1)} aria-label="Next">
            <ChevronRight />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/gallery" className="btn btn-outline">View Full Gallery</Link>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterGallery;
