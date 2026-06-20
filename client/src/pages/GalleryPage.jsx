import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { FaPhoneAlt, FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';
import ContactLine from '../components/sections/ContactLine';

// Real job photos, optimized to WebP.
const modules = import.meta.glob('../assets/gallery/**/*.webp', { eager: true, query: '?url', import: 'default' });

const FOLDER_META = {
  office: { tag: 'Office Cleaning' },
  builders: { tag: 'Builders Cleaning' },
  'end-of-lease': { tag: 'End of Lease' },
  airbnb: { tag: 'Airbnb Cleaning' },
  'real-estate': { tag: 'Real Estate Cleaning' },
  pressure: { tag: 'Pressure Washing' },
  property: { tag: 'Property Maintenance' },
};

const ALL_ITEMS = Object.entries(modules)
  .map(([p, url]) => {
    const slug = p.split('/').slice(-2, -1)[0];
    const meta = FOLDER_META[slug] || { tag: 'Our Work' };
    return { img: url, tag: meta.tag };
  })
  .sort((a, b) => a.tag.localeCompare(b.tag));

const FILTERS = ['All', ...Array.from(new Set(ALL_ITEMS.map((i) => i.tag)))];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GalleryPage = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const [filter, setFilter] = useState(() => (catParam && FILTERS.includes(catParam) ? catParam : 'All'));
  const [lightbox, setLightbox] = useState(null);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  // Keep the filter in sync if the ?cat= param changes
  useEffect(() => {
    if (catParam && FILTERS.includes(catParam)) setFilter(catParam);
  }, [catParam]);

  const items = useMemo(
    () => (filter === 'All' ? ALL_ITEMS : ALL_ITEMS.filter((i) => i.tag === filter)),
    [filter]
  );

  // ── Carousel sliding ──
  const slide = useCallback((dir) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.querySelector('.carousel-slide');
    const step = first ? first.offsetWidth + 18 : track.clientWidth * 0.8;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    const atStart = track.scrollLeft <= 5;
    if (dir > 0 && atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  // Reset scroll when the category changes
  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollTo({ left: 0 });
  }, [filter]);

  // Autoplay (pauses on hover / when lightbox open / reduced-motion)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => {
      if (!pausedRef.current && lightbox === null) slide(1);
    }, 1000);
    return () => clearInterval(id);
  }, [slide, lightbox, items.length]);

  // ── Lightbox ──
  const open = (i) => setLightbox(i);
  const close = useCallback(() => setLightbox(null), []);
  const stepLb = useCallback(
    (dir) => setLightbox((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => setLightbox(null), [filter]);

  useEffect(() => {
    if (lightbox === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') stepLb(1);
      if (e.key === 'ArrowLeft') stepLb(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, close, stepLb]);

  return (
    <div className="gallery-page">
      <Seo
        title="Our Work Gallery | Prestiva Property Services"
        description="Real photos of our cleaning, builders, end-of-lease, pressure washing and property maintenance work across Adelaide & Sydney."
        path="/gallery"
      />

      {/* Hero */}
      <section className="section subpage-hero bg-navy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{ color: '#fff' }}>Our Work Gallery</h1>
          <p className="contact-hero-subtitle">Real results from real jobs by {siteConfig.businessName}.</p>
          <div style={{ marginTop: '30px' }}>
            <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
          </div>
        </div>
      </section>

      {/* Filterable sliding carousel */}
      <section className="section">
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 className="section-title">Recent Work</h2>
            <p className="section-subtitle">Browse by category — slide to see more</p>
          </div>

          <div className="gallery-filters">
            {FILTERS.map((f) => (
              <button key={f} className={`gallery-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div
            className="gallery-carousel"
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
          >
            <button className="carousel-arrow carousel-arrow--prev" onClick={() => slide(-1)} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <div className="carousel-track" ref={trackRef}>
              {items.map((item, index) => (
                <figure
                  key={item.img}
                  className="carousel-slide gallery-tile"
                  onClick={() => open(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(index)}
                  aria-label={`View ${item.tag} photo`}
                >
                  <img src={item.img} alt={`${item.tag} — Prestiva`} loading="lazy" decoding="async" />
                  <span className="gallery-tile__zoom"><FaSearchPlus /></span>
                  <figcaption className="gallery-tile__caption">
                    <span className="gallery-tile__tag">{item.tag}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <button className="carousel-arrow carousel-arrow--next" onClick={() => slide(1)} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Like What You See?</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Let us deliver the same results for your property.</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
              <FaPhoneAlt /> Call Now
            </a>
          </div>
          <ContactLine />
        </div>
      </section>

      {/* Lightbox — portalled to body */}
      {lightbox !== null && items[lightbox] && createPortal(
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
          <button className="lightbox__btn lightbox__close" onClick={close} aria-label="Close"><FaTimes /></button>
          <button className="lightbox__btn lightbox__prev" onClick={(e) => { e.stopPropagation(); stepLb(-1); }} aria-label="Previous"><FaChevronLeft /></button>
          <figure className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <img src={items[lightbox].img} alt={items[lightbox].tag} />
            <figcaption className="lightbox__caption">
              <span className="gallery-tile__tag">{items[lightbox].tag}</span>
            </figcaption>
          </figure>
          <button className="lightbox__btn lightbox__next" onClick={(e) => { e.stopPropagation(); stepLb(1); }} aria-label="Next"><FaChevronRight /></button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GalleryPage;
