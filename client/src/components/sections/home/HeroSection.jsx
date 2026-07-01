import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';
import { pageBgUrl } from '../../../config/pageBackgrounds';

const trustItems = ['Fully Insured', 'Police Checked', 'Adelaide Based', 'Commercial & Residential'];

const HeroSection = () => {
  const heroImg = pageBgUrl('home');
  return (
    <section className="hero-section hero-home">
      <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }} />
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Premium Property Maintenance, Landscaping &amp; Cleaning in Adelaide
          </h1>
          <p className="hero-motto">{siteConfig.motto}</p>
          <p className="hero-subtitle">
            Reliable, fully insured services for commercial sites, builders, real estate, homes and outdoor spaces.
          </p>
          <div className="hero-btns">
            <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
              <Phone /> Call {siteConfig.phone}
            </a>
          </div>

          <ul className="hero-trust">
            {trustItems.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
