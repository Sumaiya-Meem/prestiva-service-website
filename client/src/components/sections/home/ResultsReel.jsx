import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { fetchGalleryCached, mediaUrl } from '../../../services/adminApi';
import { bundledResultsClips, bundledVideoFor, bundledImageFor } from '../../../config/bundledGallery';

// Bundled fallback clips (with poster frames) — shipped in the build and served
// by the CDN, so the homepage is never empty (API has no videos yet) and never
// shows broken media (a server file went missing from the ephemeral disk).
const FALLBACK_CLIPS = bundledResultsClips();

/** onError: swap a broken <img>/<video> to a bundled fallback (once). */
const swapToFallback = (fallback) => (e) => {
  const el = e.currentTarget;
  if (!fallback || el.dataset.fb) return; // nothing to use, or already swapped
  el.dataset.fb = '1';
  el.src = fallback;
  if (typeof el.load === 'function') el.load(); // <video> needs a reload to pick up the new src
};

// Pull videos from the admin-managed gallery, preferring the "results" section.
const videosFromSections = (sections) => {
  const all = [];
  let preferred = [];
  for (const s of sections || []) {
    const vids = (s.media || [])
      .filter((m) => m.type === 'video')
      .map((m, i) => {
        const vf = bundledVideoFor(s.slug, i);
        return {
          src: mediaUrl(m.url),
          poster: m.posterUrl ? mediaUrl(m.posterUrl) : '',
          thumb: m.thumbUrl ? mediaUrl(m.thumbUrl) : '',
          // Bundled stand-ins used only if the server file 404s (ephemeral disk).
          fallbackSrc: vf ? vf.src : '',
          fallbackPoster: vf && vf.poster ? vf.poster : bundledImageFor(s.slug, i),
        };
      });
    if (s.slug === 'results') preferred = vids;
    all.push(...vids);
  }
  const chosen = preferred.length ? preferred : all;
  return chosen.slice(0, 6);
};

// Each card stays a lightweight poster until the user opts in to play.
const ResultClip = ({ clip }) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <figure className="result-clip">
        <video src={clip.src} poster={clip.poster || undefined} controls autoPlay playsInline onError={swapToFallback(clip.fallbackSrc)} />
      </figure>
    );
  }

  return (
    <figure className="result-clip">
      <button type="button" className="result-clip__play" onClick={() => setPlaying(true)} aria-label="Play cleaning result video">
        {clip.thumb || clip.poster ? (
          <img src={clip.thumb || clip.poster} alt="Prestiva cleaning result" loading="lazy" decoding="async" onError={swapToFallback(clip.fallbackPoster)} />
        ) : (
          <video src={clip.src} preload="metadata" muted playsInline onError={swapToFallback(clip.fallbackSrc)} />
        )}
        <span className="result-clip__icon"><Play fill="currentColor" /></span>
      </button>
    </figure>
  );
};

const ResultsReel = () => {
  const [clips, setClips] = useState(FALLBACK_CLIPS);

  useEffect(() => {
    let alive = true;
    fetchGalleryCached()
      .then((data) => {
        if (!alive) return;
        const vids = videosFromSections(data.sections);
        if (vids.length) setClips(vids); // otherwise keep the bundled fallback
      })
      .catch(() => { /* keep fallback */ });
    return () => { alive = false; };
  }, []);

  return (
    <section className="section results-reel">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title">See the Results</h2>
          <p className="section-subtitle">Real footage from our recent jobs — tap to play.</p>
        </div>

        <div className="results-grid">
          {clips.map((clip, i) => (
            <ResultClip key={clip.src || i} clip={clip} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/gallery" className="btn btn-primary">View Full Gallery</Link>
        </div>
      </div>
    </section>
  );
};

export default ResultsReel;
