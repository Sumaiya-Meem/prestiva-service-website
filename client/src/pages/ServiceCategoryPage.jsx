import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaCheckCircle, FaArrowRight, FaClock } from 'react-icons/fa';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';
import ContactLine from '../components/sections/ContactLine';

import cleaningHero from '../assets/gallery/office/2.webp';
import maintenanceHero from '../assets/gallery/property/1.webp';
import landscapingHero from '../assets/images/landscaping_hero.webp';

const heroBySlug = {
  cleaning: cleaningHero,
  'property-maintenance': maintenanceHero,
  landscaping: landscapingHero,
};

const ServiceCategoryPage = ({ slug }) => {
  const cat = siteConfig.serviceCategories.find((c) => c.slug === slug);
  if (!cat) return null;

  const hero = heroBySlug[slug] || cleaningHero;
  const serviceNames = cat.services.map((s) => s.name).join(', ');

  return (
    <div className="service-category-page">
      <Seo
        title={`${cat.title} — ${siteConfig.locationText} | ${siteConfig.businessNameShort}`}
        description={`${cat.blurb} ${cat.title} in ${siteConfig.locationText}: ${serviceNames}. Fully insured. Get a free quote — call ${siteConfig.phone}.`}
        path={cat.path}
      />

      {/* Hero */}
      <section
        className="hero-section subpage-hero"
        style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.72), rgba(10, 22, 40, 0.72)), url(${hero})` }}
      >
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{cat.title} — {siteConfig.locationText}</h1>
            <p className="hero-subtitle">{cat.blurb}</p>
            {cat.fromPrice && (
              <p className="hero-price">Starting from <span>{cat.fromPrice}</span></p>
            )}
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
                <FaPhoneAlt /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section">
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle">Professional {cat.title.toLowerCase()} across {siteConfig.locationText}</p>
          </div>

          <div className="svc-grid">
            {cat.services.map((s) => {
              const inner = (
                <>
                  <span className="svc-card__icon">
                    {s.comingSoon ? <FaClock /> : <FaCheckCircle />}
                  </span>
                  <h3 className="svc-card__name">{s.name}</h3>
                  {s.comingSoon && <span className="svc-badge">Coming Soon</span>}
                  {s.to && <span className="svc-card__more">Learn more <FaArrowRight /></span>}
                  {!s.to && !s.comingSoon && <span className="svc-card__more">Get a quote <FaArrowRight /></span>}
                </>
              );

              if (s.comingSoon) {
                return <div key={s.name} className="svc-card svc-card--soon">{inner}</div>;
              }
              return (
                <Link key={s.name} to={s.to || '/contact'} className="svc-card">
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Get a Free {cat.title} Quote</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Tell us what you need — we'll tailor a no-obligation quote.</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>Call Now</a>
          </div>
          <ContactLine />
        </div>
      </section>
    </div>
  );
};

export default ServiceCategoryPage;
