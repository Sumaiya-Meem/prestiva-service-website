import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaLeaf, FaClock, FaCheckCircle } from 'react-icons/fa';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';
import ContactLine from '../components/sections/ContactLine';
import heroImg from '../assets/images/landscaping_hero.webp';
import BeforeAfterGallery from '../components/sections/home/BeforeAfterGallery';

const LandscapingPage = () => {
  const landscapingCat = siteConfig.serviceCategories.find((c) => c.slug === 'landscaping');
  const services = landscapingCat ? landscapingCat.services : [];

  return (
    <div className="landscaping-page">
      <Seo
        title="Landscaping, Turf Laying & Irrigation Adelaide & Sydney | Prestiva"
        description="Lawn mowing, garden clean-ups, hedge trimming, mulching, turf laying, irrigation and full garden maintenance across Adelaide & Sydney. Get a free landscaping quote today."
        path="/landscaping"
      />
      {/* Hero */}
      <section className="hero-section subpage-hero" style={{ backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.4), rgba(10, 22, 40, 0.4)), url(${heroImg})` }}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Landscaping & Garden Services — {siteConfig.locationText}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">Get Landscaping Quote</Link>
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
              <div key={i} className="service-card" style={{ padding: '25px', textAlign: 'center', backgroundColor: 'var(--off-white)', borderRadius: '12px', opacity: s.comingSoon ? 0.7 : 1 }}>
                <FaLeaf color={s.comingSoon ? '#9aa4b0' : '#27c281'} style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{s.name}</h4>
                {s.comingSoon && <span className="svc-badge" style={{ marginTop: '8px', display: 'inline-block' }}>Coming Soon</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section bg-navy" style={{ color: '#fff' }}>
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>Why Choose {siteConfig.businessNameShort}?</h2>
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
      <section className="section gardening-pricing">
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 className="section-title">Transparent Gardening Pricing</h2>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--medium-gray)', maxWidth: '620px', margin: '0 auto 55px' }}>
            Clear, upfront starting prices — no hidden fees. Your exact quote is always free and tailored to your garden.
          </p>

          <div className="pricing-grid">
            {/* Lawn Mowing */}
            <div className="pricing-card">
              <span className="plan-tier">Essentials</span>
              <h3 className="plan-title">{siteConfig.pricing.landscaping.mowing.label}</h3>
              <div className="plan-price">
                <span className="plan-from">from</span>
                <span className="price">{siteConfig.pricing.landscaping.mowing.price}</span>
                <span className="unit">/visit</span>
              </div>
              <ul className="plan-features">
                <li><FaCheckCircle className="plan-check" /> Mowing, edging &amp; line trimming</li>
                <li><FaCheckCircle className="plan-check" /> Clippings cleared &amp; removed</li>
                <li><FaCheckCircle className="plan-check" /> Paths &amp; driveway blown down</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>Book a Mow</Link>
            </div>

            {/* Full Garden Maintenance — featured */}
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <span className="plan-tier">Most Complete</span>
              <h3 className="plan-title">{siteConfig.pricing.landscaping.maintenance.label}</h3>
              <div className="plan-price">
                <span className="plan-from">from</span>
                <span className="price">{siteConfig.pricing.landscaping.maintenance.price}</span>
                <span className="unit">/visit</span>
              </div>
              <ul className="plan-features">
                <li><FaCheckCircle className="plan-check" /> Everything in Essentials</li>
                <li><FaCheckCircle className="plan-check" /> Weeding, hedging &amp; pruning</li>
                <li><FaCheckCircle className="plan-check" /> Mulching &amp; garden bed tidy-up</li>
                <li><FaCheckCircle className="plan-check" /> All green waste removed</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>Book Maintenance</Link>
            </div>

            {/* Pressure Washing */}
            <div className="pricing-card">
              <span className="plan-tier">Restore</span>
              <h3 className="plan-title">{siteConfig.pricing.landscaping.pressure.label}</h3>
              <div className="plan-price">
                <span className="plan-from">from</span>
                <span className="price">{siteConfig.pricing.landscaping.pressure.price}</span>
                <span className="unit">/job</span>
              </div>
              <ul className="plan-features">
                <li><FaCheckCircle className="plan-check" /> Driveways, patios &amp; pavers</li>
                <li><FaCheckCircle className="plan-check" /> Exterior walls &amp; fencing</li>
                <li><FaCheckCircle className="plan-check" /> Mould &amp; grime removed</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>Get a Quote</Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--medium-gray)', fontSize: '0.86rem', marginTop: '35px' }}>
            * Starting estimates. Final pricing is confirmed in your free, no-obligation quote.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Book a Landscaping Service</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Ready to transform your outdoor space?</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">Get Landscaping Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>Call Now</a>
          </div>
          <ContactLine />
        </div>
      </section>
    </div>
  );
};

export default LandscapingPage;
