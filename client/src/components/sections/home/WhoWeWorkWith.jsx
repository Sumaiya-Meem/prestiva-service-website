import React from 'react';
import { HardHat, Handshake, Store, UserRound, Home, Building2 } from 'lucide-react';
import { getContent } from '../../../config/content';

// Icons stay in code, matched to client types by position (extras fall back to a building).
const ICONS = [<HardHat />, <Handshake />, <Store />, <UserRound />, <Home />, <Building2 />];

const WhoWeWorkWith = () => {
  const clients = getContent('home.who.items');
  return (
    <section className="section who-we-work">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">{getContent('home.who.heading')}</h2>
          <p className="section-subtitle">{getContent('home.who.subheading')}</p>
        </div>
        <div className="who-grid">
          {clients.map((label, index) => (
            <div key={index} className="who-card">
              <span className="who-icon">{ICONS[index] || <Building2 />}</span>
              <span className="who-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeWorkWith;
