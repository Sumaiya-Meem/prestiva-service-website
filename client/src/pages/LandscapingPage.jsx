import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaLeaf, FaClock, FaCheckCircle } from 'react-icons/fa';
import siteConfig from '../config/siteConfig';
import heroImg from '../assets/images/landscaping_hero.png';
import BeforeAfterGallery from '../components/sections/home/BeforeAfterGallery';

const LandscapingPage = () => {
  const services = [
    "Lawn Mowing", "Hedge Trimming", "Weeding", "Tree Pruning", 
    "Garden Clean-Ups", "Mulching", "Planting", "Pressure Washing", 
    "Irrigation", "Maintenance Packages"
  ];

  return (
    <div className="landscaping-page">
      {/* Hero */}
      <section className="hero-section subpage-hero" style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.4), rgba(10, 22, 40, 0.4)), url(${heroImg})` }}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Landscaping & Garden Services — {siteConfig.locationText}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">Get a Garden Quote</Link>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
                <FaPhoneAlt /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Our Garden Services</h2>
          <div className="services-grid responsive-grid-5">
            {services.map((s, i) => (
              <div key={i} className="service-card" style={{ padding: '25px', textAlign: 'center', backgroundColor: 'var(--off-white)', borderRadius: '12px' }}>
                <FaLeaf color="var(--primary-gold)" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{s}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section bg-navy" style={{ color: '#fff' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ color: 'var(--primary-gold)' }}>Why Choose {siteConfig.businessNameShort}?</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Reliable outdoor maintenance for your property</p>
          </div>
          <div className="responsive-grid-3">
            <div className="why-card">
              <div className="why-icon"><FaClock /></div>
              <h3>Same Crew</h3>
              <p>We send the same team to your property for consistent results every time.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><FaLeaf /></div>
              <h3>Green Removal</h3>
              <p>We include full green waste removal in every booking, leaving your site pristine.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><FaCheckCircle /></div>
              <h3>One-off or Regular</h3>
              <p>Whether you need a quick clean-up or monthly maintenance, we've got you covered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After */}
      <BeforeAfterGallery />

      {/* Pricing */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>Transparent Gardening Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>{siteConfig.pricing.landscaping.mowing.label}</h3>
              <p className="price">From {siteConfig.pricing.landscaping.mowing.price}</p>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>Book Mow</Link>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Value</div>
              <h3>{siteConfig.pricing.landscaping.cleanup.label}</h3>
              <p className="price">From {siteConfig.pricing.landscaping.cleanup.price}</p>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>Book Clean-up</Link>
            </div>
            <div className="pricing-card">
              <h3>{siteConfig.pricing.landscaping.pressure.label}</h3>
              <p className="price">From {siteConfig.pricing.landscaping.pressure.price}</p>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>Book Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Book a Garden Service</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Ready to transform your outdoor space?</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">Book Now</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>Call Now</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandscapingPage;
