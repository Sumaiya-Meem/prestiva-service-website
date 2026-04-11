import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaBuilding, FaUtensils, FaHardHat, FaMedkit, FaShoppingBag, FaWarehouse, FaCity, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import siteConfig from '../config/siteConfig';
import heroImg from '../assets/images/commercial_hero.png';

const CommercialPage = () => {
  const industries = [
    { icon: <FaBuilding />, name: "Offices" },
    { icon: <FaUtensils />, name: "Restaurants" },
    { icon: <FaHardHat />, name: "After Builders" },
    { icon: <FaMedkit />, name: "Medical" },
    { icon: <FaShoppingBag />, name: "Retail" },
    { icon: <FaWarehouse />, name: "Warehouses" },
    { icon: <FaCity />, name: "Strata" },
    { icon: <FaFileAlt />, name: "Contract Cleaning" }
  ];

  return (
    <div className="commercial-page">
      {/* Hero Section */}
      <section className="hero-section subpage-hero" style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.7)), url(${heroImg})` }}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Professional Commercial Cleaning — {siteConfig.locationText}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">Get a Commercial Quote</Link>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
                <FaPhoneAlt /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Clean For */}
      <section className="section industries-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Who We Clean For</h2>
            <p className="section-subtitle">Expert cleaning solutions across diverse industries</p>
          </div>
          <div className="industries-grid responsive-grid-4">
            {industries.map((item, index) => (
              <div key={index} className="industry-box" style={{ textAlign: 'center', padding: '30px', backgroundColor: 'var(--off-white)', borderRadius: '15px', transition: 'var(--transition-smooth)' }}>
                <div style={{ fontSize: '2.5rem', color: 'var(--primary-gold)', marginBottom: '15px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section bg-navy" style={{ color: 'var(--white)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>What's Included</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Detailed cleaning for every area of your business</p>
          </div>
          <div className="checklist-grid responsive-grid-2">
            <div>
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '20px' }}>Office & Working Areas</h3>
              <ul className="spotlight-list">
                <li style={{ marginBottom: '12px' }}>✓ Dusting & sanitising all desks & surfaces</li>
                <li style={{ marginBottom: '12px' }}>✓ Emptying bins & replacing liners</li>
                <li style={{ marginBottom: '12px' }}>✓ Cleaning glass partitions & internal windows</li>
                <li style={{ marginBottom: '12px' }}>✓ Vacuuming all carpets & mopping hard floors</li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '20px' }}>Kitchens & Bathrooms</h3>
              <ul className="spotlight-list">
                <li style={{ marginBottom: '12px' }}>✓ Deep clean of all bathroom fixtures</li>
                <li style={{ marginBottom: '12px' }}>✓ Refilling soap & paper dispensers</li>
                <li style={{ marginBottom: '12px' }}>✓ Sanitising kitchen benchtops & sinks</li>
                <li style={{ marginBottom: '12px' }}>✓ Cleaning exterior of appliances & cupboards</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section commercial-pricing">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>Commercial Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Office Cleaning</h3>
              <p className="price">From {siteConfig.pricing.commercial.office.price}<span>{siteConfig.pricing.commercial.office.unit}</span></p>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>Get Quote</Link>
            </div>
            <div className="pricing-card">
              <h3>Restaurant Cleaning</h3>
              <p className="price">From {siteConfig.pricing.commercial.restaurant.price}<span>{siteConfig.pricing.commercial.restaurant.unit}</span></p>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>Get Quote</Link>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Contract</div>
              <h3>Strata & Custom</h3>
              <p className="price">{siteConfig.pricing.commercial.strata.price}</p>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>Request Quote</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section cta-banner bg-navy">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ color: 'var(--white)' }}>Request a Commercial Quote</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Speak with our contract cleaning specialists today.</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">Get a Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>Call Now</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommercialPage;
