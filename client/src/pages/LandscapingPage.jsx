import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Leaf, Clock, CheckCircle2 } from 'lucide-react';
import siteConfig from '../config/siteConfig';
import { getContent } from '../config/content';
import Seo from '../components/utils/Seo';
import RichText from '../components/utils/RichText';
import ContactLine from '../components/sections/ContactLine';
import { pageBgUrl } from '../config/pageBackgrounds';
import BeforeAfterGallery from '../components/sections/home/BeforeAfterGallery';

// Icons stay in code, matched to why-cards by position.
const WHY_ICONS = [<Clock />, <Leaf />, <CheckCircle2 />];

const LandscapingPage = () => {
  const landscapingCat = siteConfig.serviceCategories.find((c) => c.slug === 'landscaping');
  const services = landscapingCat ? landscapingCat.services : [];
  const heroImg = pageBgUrl('landscaping');
  const whyCards = getContent('landscaping.why.items');

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
            <h1 className="hero-title">{getContent('landscaping.hero.title')}</h1>
            <div className="hero-btns cta-btns">
              <Link to="/contact" className="btn btn-primary">{getContent('landscaping.hero.quoteButton')}</Link>
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
                <Phone /> {getContent('landscaping.hero.callButton')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>{getContent('landscaping.services.heading')}</h2>
          <div className="services-grid responsive-grid-5">
            {services.map((s, i) => (
              <div key={i} className="service-card" style={{ padding: '25px', textAlign: 'center', backgroundColor: 'var(--off-white)', borderRadius: '12px', opacity: s.comingSoon ? 0.7 : 1 }}>
                <Leaf color={s.comingSoon ? '#9aa4b0' : '#27c281'} style={{ marginBottom: '10px' }} />
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
            <h2 className="section-title" style={{ color: 'var(--white)' }}>{getContent('landscaping.why.heading')}</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>{getContent('landscaping.why.subheading')}</p>
          </div>
          <div className="responsive-grid-3">
            {whyCards.map((card, i) => (
              <div key={i} className="why-card">
                <div className="why-icon">{WHY_ICONS[i] || <CheckCircle2 />}</div>
                <h3>{card.title}</h3>
                <RichText as="p" html={card.text} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After */}
      <BeforeAfterGallery />

      {/* Pricing */}
      <section className="section gardening-pricing">
        <div className="container">
          <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 className="section-title">{getContent('landscaping.pricing.heading')}</h2>
          </div>
          <RichText as="p" style={{ textAlign: 'center', color: 'var(--medium-gray)', maxWidth: '620px', margin: '0 auto 55px' }} html={getContent('landscaping.pricing.intro')} />

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
                <li><CheckCircle2 className="plan-check" /> Mowing, edging &amp; line trimming</li>
                <li><CheckCircle2 className="plan-check" /> Clippings cleared &amp; removed</li>
                <li><CheckCircle2 className="plan-check" /> Paths &amp; driveway blown down</li>
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
                <li><CheckCircle2 className="plan-check" /> Everything in Essentials</li>
                <li><CheckCircle2 className="plan-check" /> Weeding, hedging &amp; pruning</li>
                <li><CheckCircle2 className="plan-check" /> Mulching &amp; garden bed tidy-up</li>
                <li><CheckCircle2 className="plan-check" /> All green waste removed</li>
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
                <li><CheckCircle2 className="plan-check" /> Driveways, patios &amp; pavers</li>
                <li><CheckCircle2 className="plan-check" /> Exterior walls &amp; fencing</li>
                <li><CheckCircle2 className="plan-check" /> Mould &amp; grime removed</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>Get a Quote</Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--medium-gray)', fontSize: '0.86rem', marginTop: '35px' }}>
            {getContent('landscaping.pricing.footnote')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>{getContent('landscaping.cta.heading')}</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>{getContent('landscaping.cta.text')}</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">{getContent('landscaping.cta.primaryButton')}</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>{getContent('landscaping.cta.callButton')}</a>
          </div>
          <ContactLine />
        </div>
      </section>
    </div>
  );
};

export default LandscapingPage;
