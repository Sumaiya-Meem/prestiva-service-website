import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import siteConfig from '../../../config/siteConfig';
import heroImg from '../../../assets/images/hero_commercial.png';

const HeroSection = () => {
  return (
    <section className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.7)), url(${heroImg})` }}>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Trusted Commercial Cleaning & Property Services
          </h1>
          <p className="hero-subtitle">
            {siteConfig.businessName} delivers professional commercial cleaning, residential cleaning, and landscaping — {siteConfig.tagline.toLowerCase()}
          </p>
          <div className="hero-btns">
            <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
              <FaPhoneAlt /> Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
