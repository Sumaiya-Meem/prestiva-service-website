import React from 'react';
import { HardHat, Handshake, Store, UserRound, Home, Building2 } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';

const clients = [
  { icon: <HardHat />, label: 'Builders & Contractors' },
  { icon: <Handshake />, label: 'Real Estate Agents' },
  { icon: <Store />, label: 'Offices & Retail Stores' },
  { icon: <UserRound />, label: 'Property Managers' },
  { icon: <Home />, label: 'Homeowners' },
  { icon: <Building2 />, label: 'Commercial Sites' },
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
