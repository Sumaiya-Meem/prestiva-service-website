import React from 'react';
import { Link } from 'react-router-dom';
import spotlightImg from '../../../assets/images/commercial_spotlight.png';

const CommercialSpotlight = () => {
  return (
    <section className="section commercial-spotlight">
      <div className="container">
        <div className="spotlight-grid">
          <div className="spotlight-content">
            <h4 className="text-gold" style={{ marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Commercial Cleaning</h4>
            <h2 className="section-title" style={{ marginBottom: '25px' }}>Professional Commercial Cleaning You Can Count On</h2>
            <p style={{ marginBottom: '30px', color: 'var(--medium-gray)' }}>
              From boutique offices to large-scale warehouses, Prestiva delivers bespoke cleaning solutions that reflect the standard of your business. We understand that a clean environment is essential for productivity and client impressions.
            </p>
            <ul className="spotlight-list" style={{ marginBottom: '40px' }}>
              <li style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>✓</span>
                <div><strong>Flexible Scheduling:</strong> After-hours and weekend cleaning available.</div>
              </li>
              <li style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>✓</span>
                <div><strong>Customised Plans:</strong> Solutions tailored to your industry and space.</div>
              </li>
              <li style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>✓</span>
                <div><strong>Consistent Quality:</strong> Dedicated account management and regular inspections.</div>
              </li>
            </ul>
            <Link to="/commercial" className="btn btn-primary">Commercial Services</Link>
          </div>
          <div className="spotlight-image-container">
            <img src={spotlightImg} alt="Commercial Cleaning Spotlight" className="spotlight-img" />
            <div className="image-accent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommercialSpotlight;
