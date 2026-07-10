import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import spotlightImg from '../../../assets/gallery/office/5.webp';
import { getContent } from '../../../config/content';
import RichText from '../../utils/RichText';

const CommercialSpotlight = () => {
  const points = getContent('home.commercial.points');
  return (
    <section className="section commercial-spotlight">
      <div className="container">
        <div className="spotlight-grid">
          <div className="spotlight-content">
            <h4 className="text-gold" style={{ marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>{getContent('home.commercial.eyebrow')}</h4>
            <h2 className="section-title" style={{ marginBottom: '20px' }}>{getContent('home.commercial.heading')}</h2>
            <RichText as="p" style={{ marginBottom: '28px', color: 'var(--medium-gray)' }} html={getContent('home.commercial.body')} />
            <ul className="spotlight-checklist">
              {points.map((p) => (
                <li key={p}><CheckCircle2 className="spotlight-check" /> {p}</li>
              ))}
            </ul>
            <Link to="/commercial" className="btn btn-primary" style={{ marginTop: '34px' }}>{getContent('home.commercial.button')}</Link>
          </div>
          <div className="spotlight-image-container">
            <img src={spotlightImg} alt="Commercial cleaning by Prestiva" className="spotlight-img" loading="lazy" decoding="async" />
            <div className="image-accent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommercialSpotlight;
