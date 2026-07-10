import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Building2, Utensils, HardHat, BriefcaseMedical, ShoppingBag, Warehouse, Building, FileText } from 'lucide-react';
import siteConfig from '../config/siteConfig';
import { getContent } from '../config/content';
import Seo from '../components/utils/Seo';
import ContactLine from '../components/sections/ContactLine';
import { pageBgUrl } from '../config/pageBackgrounds';

// Icons stay in code, matched to industries by position.
const INDUSTRY_ICONS = [
  <Building2 />, <Utensils />, <HardHat />, <BriefcaseMedical />,
  <ShoppingBag />, <Warehouse />, <Building />, <FileText />,
];

const CommercialPage = () => {
  const heroImg = pageBgUrl('commercial');
  const industries = getContent('commercial.industries.items');

  return (
    <div className="commercial-page">
      <Seo
        title="Commercial Cleaning Adelaide & Sydney | Offices, Strata & Builders | Prestiva"
        description="Professional commercial cleaning for offices, restaurants, medical, retail, warehouses, strata and after-builders. Fully insured contract cleaning across Adelaide & Sydney. Get a free quote."
        path="/commercial"
      />
      {/* Hero Section */}
      <section className="hero-section subpage-hero" style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.7)), url(${heroImg})` }}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{getContent('commercial.hero.title')}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">{getContent('commercial.hero.quoteButton')}</Link>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
                <Phone /> {getContent('commercial.hero.callButton')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Clean For */}
      <section className="section industries-section">
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">{getContent('commercial.industries.heading')}</h2>
            <p className="section-subtitle">{getContent('commercial.industries.subheading')}</p>
          </div>
          <div className="industries-grid responsive-grid-4">
            {industries.map((name, index) => (
              <div key={index} className="industry-box" style={{ textAlign: 'center', padding: '30px', backgroundColor: 'var(--off-white)', borderRadius: '15px', transition: 'var(--transition-smooth)' }}>
                <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '15px' }}>{INDUSTRY_ICONS[index] || <Building2 />}</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section bg-navy" style={{ color: 'var(--white)' }}>
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>{getContent('commercial.included.heading')}</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>{getContent('commercial.included.subheading')}</p>
          </div>
          <div className="checklist-grid responsive-grid-2">
            <div>
              <h3 style={{ color: 'var(--accent)', marginBottom: '20px' }}>{getContent('commercial.included.col1Title')}</h3>
              <ul className="spotlight-list">
                {getContent('commercial.included.col1Items').map((item, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>✓ {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ color: 'var(--accent)', marginBottom: '20px' }}>{getContent('commercial.included.col2Title')}</h3>
              <ul className="spotlight-list">
                {getContent('commercial.included.col2Items').map((item, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>✓ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section commercial-pricing">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>{getContent('commercial.pricing.heading')}</h2>
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
          <h2 className="section-title" style={{ color: 'var(--white)' }}>{getContent('commercial.cta.heading')}</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>{getContent('commercial.cta.text')}</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">{getContent('commercial.cta.primaryButton')}</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>{getContent('commercial.cta.callButton')}</a>
          </div>
          <ContactLine />
        </div>
      </section>
    </div>
  );
};

export default CommercialPage;
