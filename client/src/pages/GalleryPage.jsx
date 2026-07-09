import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { Phone, ZoomIn, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';
import ContactLine from '../components/sections/ContactLine';
import { fetchGalleryCached, mediaUrl } from '../services/adminApi';
import { bundledItems, bundledImageFor, bundledVideoFor } from '../config/bundledGallery';
import { heroBgStyle } from '../config/pageBackgrounds';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Flatten the API's sections → a flat list of media items, videos first so the
// most engaging content leads, then grouped by section tag.
const toItems = (sections) => {
  const items = [];
  const seen = {}; // slug -> count so far, to rotate through bundled fallbacks
  for (const s of sections || []) {
    for (const m of s.media || []) {
      const slug = s.slug;
      const i = (seen[slug] = (seen[slug] || 0) + 1) - 1;
      const vf = m.type === 'video' ? bundledVideoFor(slug, i) : null;
      const fallbackImg = bundledImageFor(slug, i);
      items.push({
        id: m.id,
        src: mediaUrl(m.url),
        thumb: m.thumbUrl ? mediaUrl(m.thumbUrl) : undefined, // small tile image
        poster: m.posterUrl ? mediaUrl(m.posterUrl) : undefined,
        tag: s.tag,
        slug,
        type: m.type,
        // Bundled stand-ins, used only if the server file 404s (ephemeral disk):
        // fallbackSrc matches the element (video → clip, image → photo);
        // fallbackPoster is always an image (for the poster/thumbnail <img>).
        fallbackSrc: vf ? vf.src : fallbackImg,
        fallbackPoster: vf && vf.poster ? vf.poster : fallbackImg,
      });
    }
  }
  return items.sort((a, b) =>
    a.type !== b.type ? (a.type === 'video' ? -1 : 1) : a.tag.localeCompare(b.tag)
  );
};

/** onError handler: swap a broken <img>/<video> to a bundled fallback (once). */
const swapToFallback = (fallback) => (e) => {
  const el = e.currentTarget;
  if (!fallback || el.dataset.fb) return; // nothing to use, or already swapped
  el.dataset.fb = '1';
  el.src = fallback;
  if (typeof el.load === 'function') el.load(); // <video> needs a reload to pick up the new src
};

const GalleryPage = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [gridView, setGridView] = useState(false);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  // Load media from the admin-managed API. If the page was opened via a
  // /gallery?cat=… link, pre-select that category once the data arrives.
  useEffect(() => {
    let alive = true;
    fetchGalleryCached()
      .then((data) => {
        if (!alive) return;
        const list = toItems(data.sections);
        const finalList = list.length ? list : bundledItems(); // fall back if DB empty
        setAllItems(finalList);
        if (catParam && finalList.some((i) => i.tag === catParam)) setFilter(catParam);
      })
      .catch(() => { if (alive) setAllItems(bundledItems()); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // catParam is read once on mount; changing it via navigation remounts the route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = useMemo(
    () => ['All', ...Array.from(new Set(allItems.map((i) => i.tag)))],
    [allItems]
  );

  const items = useMemo(
    () => (filter === 'All' ? allItems : allItems.filter((i) => i.tag === filter)),
    [filter, allItems]
  );

  // Changing category also closes any open lightbox (whose index no longer applies).
  const changeFilter = (f) => {
    setFilter(f);
    setLightbox(null);
  };

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

  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollTo({ left: 0 });
  }, [filter]);

  useEffect(() => {
    if (prefersReducedMotion() || items.length === 0) return;
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

  const renderTile = (item, index, extraClass = '') => (
    <figure
      key={item.id || item.src}
      className={`gallery-tile${extraClass ? ` ${extraClass}` : ''}`}
      onClick={() => open(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(index)}
      aria-label={`View ${item.tag} ${item.type === 'video' ? 'video' : 'photo'}`}
    >
      {item.type === 'video' && !item.thumb && !item.poster ? (
        <video src={item.src} preload="metadata" muted playsInline onError={swapToFallback(item.fallbackSrc)} />
      ) : (
        <img
          // Tile shows the lightweight thumbnail; the full image loads only in
          // the lightbox. Falls back to poster (videos) or full image if absent.
          src={item.thumb || (item.type === 'video' ? item.poster : item.src)}
          alt={`${item.tag} — Prestiva`}
          loading="lazy"
          decoding="async"
          onError={swapToFallback(item.fallbackPoster)}
        />
      )}
      <span className="gallery-tile__zoom">{item.type === 'video' ? <Play fill="currentColor" /> : <ZoomIn />}</span>
      <figcaption className="gallery-tile__caption">
        <span className="gallery-tile__tag">{item.tag}</span>
      </figcaption>
    </figure>
  );

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
      <section className="section subpage-hero bg-navy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', ...heroBgStyle('gallery') }}>
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
            <p className="section-subtitle">{gridView ? 'Showing every item' : 'Browse by category — slide to see more'}</p>
          </div>

          {loading ? (
            <div className="section-subtitle" style={{ textAlign: 'center' }}>Loading gallery…</div>
          ) : allItems.length === 0 ? (
            <div className="section-subtitle" style={{ textAlign: 'center' }}>
              Our gallery is being updated — please check back soon.
            </div>
          ) : (
            <>
              <div className="gallery-filters">
                {filters.map((f) => (
                  <button key={f} className={`gallery-filter${filter === f ? ' active' : ''}`} onClick={() => changeFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>

              {gridView ? (
                <div className="gallery-grid">
                  {items.map((item, index) => renderTile(item, index))}
                </div>
              ) : (
                <div
                  className="gallery-carousel"
                  onMouseEnter={() => { pausedRef.current = true; }}
                  onMouseLeave={() => { pausedRef.current = false; }}
                >
                  <button className="carousel-arrow carousel-arrow--prev" onClick={() => slide(-1)} aria-label="Previous">
                    <ChevronLeft />
                  </button>

                  <div className="carousel-track" ref={trackRef}>
                    {items.map((item, index) => renderTile(item, index, 'carousel-slide'))}
                  </div>

                  <button className="carousel-arrow carousel-arrow--next" onClick={() => slide(1)} aria-label="Next">
                    <ChevronRight />
                  </button>
                </div>
              )}

              <button
                className="gallery-viewall"
                onClick={() => setGridView((v) => !v)}
                aria-pressed={gridView}
              >
                {gridView ? '← Back to Slider' : `View All (${items.length})`}
              </button>
            </>
          )}
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
              <Phone /> Call Now
            </a>
          </div>
          <ContactLine />
        </div>
      </section>

      {/* Lightbox — portalled to body */}
      {lightbox !== null && items[lightbox] && createPortal(
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
          <button className="lightbox__btn lightbox__close" onClick={close} aria-label="Close"><X /></button>
          <button className="lightbox__btn lightbox__prev" onClick={(e) => { e.stopPropagation(); stepLb(-1); }} aria-label="Previous"><ChevronLeft /></button>
          <figure className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            {items[lightbox].type === 'video' ? (
              <video src={items[lightbox].src} poster={items[lightbox].poster} controls autoPlay loop playsInline onError={swapToFallback(items[lightbox].fallbackSrc)} />
            ) : (
              <img src={items[lightbox].src} alt={items[lightbox].tag} onError={swapToFallback(items[lightbox].fallbackSrc)} />
            )}
            <figcaption className="lightbox__caption">
              <span className="gallery-tile__tag">{items[lightbox].tag}</span>
            </figcaption>
          </figure>
          <button className="lightbox__btn lightbox__next" onClick={(e) => { e.stopPropagation(); stepLb(1); }} aria-label="Next"><ChevronRight /></button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GalleryPage;
