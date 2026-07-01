import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Home } from 'lucide-react';
import siteConfig from '../config/siteConfig';

const NotFoundPage = () => {
  return (
    <>
      <title>Page Not Found | Prestiva Property Services</title>
      <meta name="robots" content="noindex" />
      <section className="section bg-navy" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container">
        <p style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--primary-gold)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>404</p>
        <h1 className="section-title" style={{ color: '#fff', marginBottom: '15px' }}>Page Not Found</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '520px', margin: '0 auto 35px' }}>
          The page you're looking for doesn't exist or has moved. Let's get you back on track.
        </p>
        <div className="cta-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Home /> Back to Home
          </Link>
          <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
            <Phone /> Call {siteConfig.phone}
          </a>
        </div>
      </div>
    </section>
    </>
  );
};

export default NotFoundPage;
