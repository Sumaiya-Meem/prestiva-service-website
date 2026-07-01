import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { fetchGalleryCached, mediaUrl } from '../../../services/adminApi';

// Bundled fallback clips (with poster frames) — used if the API has no videos
// yet (e.g. before the gallery is seeded), so the homepage is never empty.
import v1 from '../../../assets/gallery/results/1.mp4';
import v2 from '../../../assets/gallery/results/2.mp4';
import v3 from '../../../assets/gallery/results/3.mp4';
import v4 from '../../../assets/gallery/results/4.mp4';
import p1 from '../../../assets/gallery/results/1.jpg';
import p2 from '../../../assets/gallery/results/2.jpg';
import p3 from '../../../assets/gallery/results/3.jpg';
import p4 from '../../../assets/gallery/results/4.jpg';

const FALLBACK_CLIPS = [
  { src: v1, poster: p1 },
  { src: v2, poster: p2 },
  { src: v3, poster: p3 },
  { src: v4, poster: p4 },
];

// Pull videos from the admin-managed gallery, preferring the "results" section.
const videosFromSections = (sections) => {
  const all = [];
  let preferred = [];
  for (const s of sections || []) {
    const vids = (s.media || [])
      .filter((m) => m.type === 'video')
      .map((m) => ({
        src: mediaUrl(m.url),
        poster: m.posterUrl ? mediaUrl(m.posterUrl) : '',
        thumb: m.thumbUrl ? mediaUrl(m.thumbUrl) : '',
      }));
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
        <video src={clip.src} poster={clip.poster || undefined} controls autoPlay playsInline />
      </figure>
    );
  }

  return (
    <figure className="result-clip">
      <button type="button" className="result-clip__play" onClick={() => setPlaying(true)} aria-label="Play cleaning result video">
        {clip.thumb || clip.poster ? (
          <img src={clip.thumb || clip.poster} alt="Prestiva cleaning result" loading="lazy" decoding="async" />
        ) : (
          <video src={clip.src} preload="metadata" muted playsInline />
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
