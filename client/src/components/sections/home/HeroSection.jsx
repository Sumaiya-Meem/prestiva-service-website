import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import siteConfig from '../../../config/siteConfig';
import heroImg from '../../../assets/gallery/office/4.webp';

const HeroSection = () => {
  return (
    <section className="hero-section hero-home">
      <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }} />
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Cleaning, Landscaping &amp; Property Maintenance You Can Trust
          </h1>
          <p className="hero-subtitle">
            {siteConfig.businessName} delivers professional cleaning, landscaping, turf and property
            services — {siteConfig.tagline.toLowerCase()}
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
