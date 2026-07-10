import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';
import { getContent } from '../../../config/content';

const CTABanner = () => {
  return (
    <section className="section cta-banner" style={{ background: 'var(--navy-gradient)', color: 'var(--white)', textAlign: 'center' }}>
      <div className="container">
        <h2 className="section-title" style={{ color: 'var(--white)', marginBottom: '20px' }}>{getContent('home.cta.heading')}</h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'rgba(255,255,255,0.9)' }}>{getContent('home.cta.subtitle')}</p>
        <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1rem' }}>{getContent('home.cta.primaryButton')}</Link>
          <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
            <Phone /> {getContent('home.cta.callButton')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
