import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/utils/Seo';
import { Phone, ShieldCheck, UserCheck, Award, Star, Leaf, Wrench, Handshake } from 'lucide-react';
import siteConfig from '../config/siteConfig';
import { getContent } from '../config/content';
import RichText from '../components/utils/RichText';
import { heroBgStyle } from '../config/pageBackgrounds';

// Icons stay in code, matched to items by position.
const VALUE_ICONS = [<ShieldCheck />, <Wrench />, <Leaf />, <Handshake />];
const BADGE_ICONS = [<ShieldCheck />, <UserCheck />, <Award />, <Star fill="currentColor" />];

const AboutPage = () => {
  const values = getContent('about.values.items');
  const badges = getContent('about.badges');

  return (
    <div className="about-page">
      <Seo
        title="About Us | Prestiva Property Services — Adelaide & Sydney"
        description="Prestiva Property Services is a fully insured, police-checked team delivering reliable cleaning, landscaping and property services across Adelaide & Sydney. Reliable results, every time."
        path="/about"
      />
      {/* Hero */}
      <section className="hero-section subpage-hero bg-navy" style={heroBgStyle('about')}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{getContent('about.hero.title')}</h1>
            <p className="hero-subtitle">{getContent('about.hero.subtitle')}</p>
            <div className="hero-btns cta-btns">
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone /> {getContent('about.hero.button')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section our-story">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>{getContent('about.story.heading')}</h2>
          <div style={{ color: 'var(--medium-gray)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            <RichText as="p" style={{ marginBottom: '20px' }} html={getContent('about.story.p1')} />
            <RichText as="p" style={{ marginBottom: '20px' }} html={getContent('about.story.p2')} />
            <RichText as="p" style={{ marginBottom: '20px' }} html={getContent('about.story.p3')} />
            <RichText as="p" html={getContent('about.story.p4')} />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-navy" style={{ color: '#fff' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px', color: 'var(--primary-gold)' }}>{getContent('about.values.heading')}</h2>
          <div className="responsive-grid-4">
            {values.map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>{VALUE_ICONS[i] || <ShieldCheck />}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', color: '#fff' }}>{v.title}</h3>
                <RichText as="p" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }} html={v.desc} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section trust-badges-section">
        <div className="container">
          <div className="trust-badges">
            {badges.map((label, i) => (
              <div key={i} className="trust-badge">
                <div className="trust-badge__icon">{BADGE_ICONS[i] || <ShieldCheck />}</div>
                <h4 className="trust-badge__label">{label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>{getContent('about.cta.heading')}</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>{getContent('about.cta.text')}</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">{getContent('about.cta.primaryButton')}</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>{getContent('about.cta.callButton')}</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
