import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaCheckCircle, FaStar, FaShieldAlt } from 'react-icons/fa';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';
import ContactLine from '../components/sections/ContactLine';
import heroImg from '../assets/gallery/end-of-lease/2.webp';

const ResidentialPage = () => {
  const [activeTab, setActiveTab] = useState('kitchen');

  const services = [
    { title: "House Cleaning", desc: "Regular maintenance for a spotless home." },
    { title: "End of Lease", desc: "Professional cleaning for a full bond refund." },
    { title: "Deep Clean", desc: "Thorough sanitisation for a fresh start." },
    { title: "Move In/Out", desc: "Seamless cleaning for your transition." },
    { title: "Carpet Steam", desc: "Removal of stains and allergens." },
    { title: "Spring Clean", desc: "Reviving your home for the new season." }
  ];

  const checklistData = {
    kitchen: ["Oven Exterior", "Stovetop", "Countertops", "Sinks & Taps", "Cupboard Faces"],
    living: ["Dusting", "Vacuuming", "Glass Surfaces", "Skirting Boards", "Door Handles"],
    bathrooms: ["Showers", "Vanity", "Toilets", "Mirrors", "Towel Rails"],
    balcony: ["Sweeping", "Railing Wipe", "Glass Door Tracks", "General Tidy"]
  };

  return (
    <div className="residential-page">
      <Seo
        title="Residential & End-of-Lease Cleaning Adelaide & Sydney | Prestiva"
        description="House cleaning, end-of-lease bond cleaning, deep cleans, move in/out and carpet steam cleaning across Adelaide & Sydney. Fully insured & police-checked. Get a free quote — 0403 540 227."
        path="/residential"
      />
      {/* Hero */}
      <section className="hero-section subpage-hero" style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.6), rgba(10, 22, 40, 0.6)), url(${heroImg})` }}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Professional Home Cleaning — {siteConfig.locationText}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">Get a Home Clean Quote</Link>
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
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Our Home Cleaning Services</h2>
          <div className="services-grid responsive-grid-3">
            {services.map((s, i) => (
              <div key={i} className="service-card" style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--off-white)', borderRadius: '15px' }}>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary-navy)' }}>{s.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--medium-gray)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bond Back Guarantee */}
      <section className="section bg-navy" style={{ color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 className="section-title" style={{ color: 'var(--primary-gold)', marginBottom: '20px' }}>100% Bond Back Guarantee</h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Moving out? Leave the hard work to us. Our End of Lease cleaning service is designed to meet the strict standards of real estate agents and landlords.</p>
              <ul className="spotlight-list">
                <li style={{ marginBottom: '10px' }}>✓ 72-Hour re-clean guarantee</li>
                <li style={{ marginBottom: '10px' }}>✓ Agency-approved checklist</li>
                <li style={{ marginBottom: '10px' }}>✓ Professional equipment used</li>
              </ul>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px solid var(--primary-gold)' }}>
              <FaShieldAlt style={{ fontSize: '4rem', color: 'var(--primary-gold)', marginBottom: '20px' }} />
              <h3>Fully Guaranteed</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="section cleaning-checklist">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Room-by-Room Checklist</h2>
          <div className="checklist-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
            {Object.keys(checklistData).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {checklistData[activeTab].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', backgroundColor: 'var(--surface)', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <FaCheckCircle color="var(--primary-gold)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Transparent Home Pricing</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', borderRadius: '20px', overflowX: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-navy)', color: '#fff', textAlign: 'left' }}>
                  <th style={{ padding: '20px' }}>Home Size</th>
                  <th style={{ padding: '20px' }}>Standard Clean</th>
                </tr>
              </thead>
              <tbody>
                {siteConfig.pricing.residential.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--light-gray)' }}>
                    <td style={{ padding: '20px', fontWeight: '600' }}>{row.bed}</td>
                    <td style={{ padding: '20px', color: 'var(--primary-gold)', fontWeight: '800' }}>from {row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Book a Home Clean</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Ready to enjoy a sparkling clean home?</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">Book Now</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>Call Now</a>
          </div>
          <ContactLine />
        </div>
      </section>
    </div>
  );
};

export default ResidentialPage;
