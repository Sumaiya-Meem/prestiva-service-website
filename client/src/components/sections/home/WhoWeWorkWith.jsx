import React from 'react';
import { FaHardHat, FaHandshake, FaStore, FaUserTie, FaHome, FaCity } from 'react-icons/fa';
import siteConfig from '../../../config/siteConfig';

const clients = [
  { icon: <FaHardHat />, label: 'Builders & Contractors' },
  { icon: <FaHandshake />, label: 'Real Estate Agents' },
  { icon: <FaStore />, label: 'Offices & Retail Stores' },
  { icon: <FaUserTie />, label: 'Property Managers' },
  { icon: <FaHome />, label: 'Homeowners' },
  { icon: <FaCity />, label: 'Commercial Sites' },
];

const WhoWeWorkWith = () => (
  <section className="section who-we-work">
    <div className="container">
      <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 className="section-title">Who We Work With</h2>
        <p className="section-subtitle">Trusted by businesses, trades and homeowners across {siteConfig.locationText}</p>
      </div>
      <div className="who-grid">
        {clients.map((c) => (
          <div key={c.label} className="who-card">
            <span className="who-icon">{c.icon}</span>
            <span className="who-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhoWeWorkWith;
