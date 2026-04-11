import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import siteConfig from '../../../config/siteConfig';

const CTABanner = () => {
  return (
    <section className="section cta-banner" style={{ background: 'var(--navy-gradient)', color: 'var(--white)', textAlign: 'center' }}>
      <div className="container">
        <h2 className="section-title" style={{ color: 'var(--white)', marginBottom: '20px' }}>Ready to Book?</h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '40px', color: 'rgba(255,255,255,0.9)' }}>Get your free, no-obligation quote today and experience the Prestiva difference.</p>
        <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1rem' }}>Get a Free Quote</Link>
          <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
            <FaPhoneAlt /> Call Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
