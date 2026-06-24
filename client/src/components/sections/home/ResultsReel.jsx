import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

// Compressed result clips (with poster frames) — see /gallery for the full set.
import v1 from '../../../assets/gallery/results/1.mp4';
import v2 from '../../../assets/gallery/results/2.mp4';
import v3 from '../../../assets/gallery/results/3.mp4';
import v4 from '../../../assets/gallery/results/4.mp4';
import p1 from '../../../assets/gallery/results/1.jpg';
import p2 from '../../../assets/gallery/results/2.jpg';
import p3 from '../../../assets/gallery/results/3.jpg';
import p4 from '../../../assets/gallery/results/4.jpg';

const CLIPS = [
  { src: v1, poster: p1 },
  { src: v2, poster: p2 },
  { src: v3, poster: p3 },
  { src: v4, poster: p4 },
];

// Each card stays a lightweight poster until the user opts in to play —
// no video bytes are downloaded on page load.
const ResultClip = ({ clip }) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <figure className="result-clip">
        <video src={clip.src} poster={clip.poster} controls autoPlay playsInline />
      </figure>
    );
  }

  return (
    <figure className="result-clip">
      <button type="button" className="result-clip__play" onClick={() => setPlaying(true)} aria-label="Play cleaning result video">
        <img src={clip.poster} alt="Prestiva cleaning result" loading="lazy" decoding="async" />
        <span className="result-clip__icon"><FaPlay /></span>
      </button>
    </figure>
  );
};

const ResultsReel = () => {
  return (
    <section className="section results-reel">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title">See the Results</h2>
          <p className="section-subtitle">Real footage from our recent jobs — tap to play.</p>
        </div>

        <div className="results-grid">
          {CLIPS.map((clip, i) => (
            <ResultClip key={i} clip={clip} />
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
