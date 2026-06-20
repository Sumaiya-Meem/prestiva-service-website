import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import siteConfig from '../../../config/siteConfig';

const ServiceAreas = () => {
  return (
    <section className="section service-areas">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">We Come to You</h2>
          <p className="section-subtitle">Serving major metropolitan areas across Australia</p>
        </div>

        <div className="areas-grid" style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {siteConfig.serviceAreasDetailed.map((area, index) => (
            <div key={index} className="area-card" style={{ flex: '1', maxWidth: '400px', padding: '40px', backgroundColor: 'var(--surface)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div className="area-icon" style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '20px' }}><FaMapMarkerAlt /></div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{area.city}</h3>
              <p style={{ color: 'var(--medium-gray)' }}>{area.suburbs}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceAreas;
