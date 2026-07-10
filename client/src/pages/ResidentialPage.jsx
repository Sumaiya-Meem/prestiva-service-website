import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, CheckCircle2, ShieldCheck } from 'lucide-react';
import siteConfig from '../config/siteConfig';
import { getContent } from '../config/content';
import Seo from '../components/utils/Seo';
import RichText from '../components/utils/RichText';
import ContactLine from '../components/sections/ContactLine';
import { pageBgUrl } from '../config/pageBackgrounds';

const ResidentialPage = () => {
  const [activeTab, setActiveTab] = useState('kitchen');
  const heroImg = pageBgUrl('residential');

  const services = getContent('residential.services.items');

  const checklistData = {
    kitchen: getContent('residential.checklist.kitchen'),
    living: getContent('residential.checklist.living'),
    bathrooms: getContent('residential.checklist.bathrooms'),
    balcony: getContent('residential.checklist.balcony'),
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
            <h1 className="hero-title">{getContent('residential.hero.title')}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">{getContent('residential.hero.quoteButton')}</Link>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
                <Phone /> {getContent('residential.hero.callButton')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>{getContent('residential.services.heading')}</h2>
          <div className="services-grid responsive-grid-3">
            {services.map((s, i) => (
              <div key={i} className="service-card" style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--off-white)', borderRadius: '15px' }}>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary-navy)' }}>{s.title}</h4>
                <RichText as="p" style={{ fontSize: '0.9rem', color: 'var(--medium-gray)' }} html={s.desc} />
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
              <h2 className="section-title" style={{ color: 'var(--primary-gold)', marginBottom: '20px' }}>{getContent('residential.bond.heading')}</h2>
              <RichText as="p" style={{ fontSize: '1.2rem', marginBottom: '20px' }} html={getContent('residential.bond.body')} />
              <ul className="spotlight-list">
                {getContent('residential.bond.items').map((item, i) => (
                  <li key={i} style={{ marginBottom: '10px' }}>✓ {item}</li>
                ))}
              </ul>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px solid var(--primary-gold)' }}>
              <ShieldCheck style={{ fontSize: '4rem', color: 'var(--primary-gold)', marginBottom: '20px' }} />
              <h3>{getContent('residential.bond.cardTitle')}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="section cleaning-checklist">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>{getContent('residential.checklist.heading')}</h2>
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
                <CheckCircle2 color="var(--primary-gold)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>{getContent('residential.pricing.heading')}</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', borderRadius: '20px', overflowX: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--brand-navy)', color: '#fff', textAlign: 'left' }}>
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
          <h2 className="section-title" style={{ color: '#fff' }}>{getContent('residential.cta.heading')}</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>{getContent('residential.cta.text')}</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">{getContent('residential.cta.primaryButton')}</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>{getContent('residential.cta.callButton')}</a>
          </div>
          <ContactLine />
        </div>
      </section>
    </div>
  );
};

export default ResidentialPage;
