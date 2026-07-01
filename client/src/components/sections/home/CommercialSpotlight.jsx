import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import spotlightImg from '../../../assets/gallery/office/5.webp';

const points = [
  'Office & retail cleaning',
  'Builders & after-construction cleaning',
  'After-hours availability',
  'Insured team',
  'Flexible maintenance plans',
  'Professional equipment',
];

const CommercialSpotlight = () => {
  return (
    <section className="section commercial-spotlight">
      <div className="container">
        <div className="spotlight-grid">
          <div className="spotlight-content">
            <h4 className="text-gold" style={{ marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Commercial &amp; Builders</h4>
            <h2 className="section-title" style={{ marginBottom: '20px' }}>Commercial Cleaning Specialists</h2>
            <p style={{ marginBottom: '28px', color: 'var(--medium-gray)' }}>
              Prestiva Property Services provides reliable commercial cleaning for offices, retail spaces,
              construction sites and business premises. We offer once-off, after-hours and regular maintenance
              cleaning tailored to each site.
            </p>
            <ul className="spotlight-checklist">
              {points.map((p) => (
                <li key={p}><CheckCircle2 className="spotlight-check" /> {p}</li>
              ))}
            </ul>
            <Link to="/commercial" className="btn btn-primary" style={{ marginTop: '34px' }}>Commercial Services</Link>
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
