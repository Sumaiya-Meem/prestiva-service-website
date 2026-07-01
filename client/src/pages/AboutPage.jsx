import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/utils/Seo';
import { Phone, ShieldCheck, UserCheck, Award, Star, Leaf, Wrench, Handshake } from 'lucide-react';
import siteConfig from '../config/siteConfig';
import { heroBgStyle } from '../config/pageBackgrounds';

const AboutPage = () => {
  const values = [
    { icon: <ShieldCheck />, title: "Reliability", desc: "We show up on time and deliver consistent results you can depend on." },
    { icon: <Wrench />, title: "Quality Workmanship", desc: "Every job is approached with care and finished to the highest standard." },
    { icon: <Leaf />, title: "Eco-Conscious", desc: "We use sustainable products that are safe for you and the environment." },
    { icon: <Handshake />, title: "Customer First", desc: "Our service is built around your specific needs and long-term satisfaction." }
  ];

  const badges = [
    { icon: <ShieldCheck />, label: "Fully Insured" },
    { icon: <UserCheck />, label: "Police Checked" },
    { icon: <Award />, label: "Guarantee" },
    { icon: <Star fill="currentColor" />, label: "5-Star Rated" }
  ];

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
            <h1 className="hero-title">Your Partner in Property Excellence</h1>
            <p className="hero-subtitle">Serving {siteConfig.locationText} with pride and professional care.</p>
            <div className="hero-btns cta-btns">
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section our-story">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Our Story</h2>
          <div style={{ color: 'var(--medium-gray)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '20px' }}>
              {siteConfig.businessName} was founded on a clear standard — to deliver a level of reliability, detail, and professionalism that clients can consistently depend on.
            </p>
            <p style={{ marginBottom: '20px' }}>
              After seeing how often services were rushed, inconsistent, or lacking accountability, we set out to build something different. A service where every job is approached with care, every space is treated with respect, and every client receives the attention they deserve.
            </p>
            <p style={{ marginBottom: '20px' }}>
              From a small, hands-on operation, {siteConfig.businessNameShort} has grown into a trusted provider working with businesses, property managers, and homeowners across {siteConfig.locationText}. What remains unchanged is our commitment to quality, consistency, and doing the job properly — not just quickly.
            </p>
            <p>
              We believe a well-maintained space reflects the people behind it. That’s why we focus not only on results, but on delivering a service experience that is professional, dependable, and built for long-term relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-navy" style={{ color: '#fff' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px', color: 'var(--primary-gold)' }}>Our Values</h2>
          <div className="responsive-grid-4">
            {values.map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>{v.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', color: '#fff' }}>{v.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section trust-badges-section">
        <div className="container">
          <div className="trust-badges">
            {badges.map((b, i) => (
              <div key={i} className="trust-badge">
                <div className="trust-badge__icon">{b.icon}</div>
                <h4 className="trust-badge__label">{b.label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Ready to Get Started?</h2>
          <p style={{ color: '#fff', marginBottom: '30px' }}>Contact our friendly team for a free consultation.</p>
          <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>Call Now</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
