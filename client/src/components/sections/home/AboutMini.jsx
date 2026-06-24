import React from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../../../config/siteConfig';

const AboutMini = () => {
  return (
    <section className="section about-mini">
      <div className="container">
        <div className="about-mini-grid" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="about-mini-content">
            <h4 className="text-gold" style={{ marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Local & Reliable</h4>
            <h2 className="section-title" style={{ marginBottom: '25px' }}>A Local Team You Can Trust</h2>
            <p style={{ marginBottom: '30px', color: 'var(--medium-gray)' }}>
              {siteConfig.businessName} was founded on a clear standard — to deliver a level of reliability, detail, and professionalism that clients can consistently depend on. We are a family-owned business serving {siteConfig.locationText} with pride.
            </p>
            <p style={{ marginBottom: '40px', color: 'var(--medium-gray)' }}>
              Whether it's your home, office, or garden, we treat every space with the respect it deserves. Our team is fully insured, police-checked, and committed to your satisfaction.
            </p>
            <Link to="/about" className="btn btn-outline" style={{ color: 'var(--primary-navy)', borderColor: 'var(--primary-navy)' }}>Learn Our Story</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMini;
