import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { MapPin, Phone, Mail } from 'lucide-react';
import siteConfig from '../../config/siteConfig';
import footerLogo from '../../assets/logos/prestiva-logo-stacked-navy-gold.webp';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-badge" aria-label={`${siteConfig.businessName} home`}>
              <img src={footerLogo} alt={`${siteConfig.businessName} Logo`} loading="lazy" decoding="async" />
            </Link>
            <p className="footer-motto">{siteConfig.motto}</p>
            <p style={{ marginTop: '8px', color: '#9aa6b2', fontWeight: 600 }}>
              {siteConfig.serviceCategories.map((cat, i) => (
                <React.Fragment key={cat.slug}>
                  {i > 0 && <>&nbsp;|&nbsp;</>}
                  {cat.title.replace(' Services', '')}
                </React.Fragment>
              ))}
            </p>
            <div className="social-links" style={{ display: 'flex', gap: '15px', marginTop: '24px' }}>
              <a href={siteConfig.social.facebook} className="social-link" aria-label="Prestiva on Facebook" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href={siteConfig.social.instagram} className="social-link" aria-label="Prestiva on Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href={siteConfig.social.tiktok} className="social-link" aria-label="Prestiva on TikTok" target="_blank" rel="noopener noreferrer"><SiTiktok /></a>
            </div>
          </div>

          <div className="footer-nav">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact">Get a Free Quote</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              {siteConfig.serviceCategories.map((cat) => (
                <li key={cat.slug}><Link to={cat.path}>{cat.title}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-title">Contact Us</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <MapPin color="#D4A853" /> Adelaide, South Australia
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone color="#D4A853" /> <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail color="#D4A853" /> <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {siteConfig.businessName}. All Rights Reserved. Fully Insured &amp; Police Checked.</p>
          <p style={{ marginTop: '8px' }}>
            <Link to="/privacy" style={{ color: 'var(--primary-gold)' }}>Privacy Policy</Link>
            <span style={{ margin: '0 10px', opacity: 0.4 }}>|</span>
            <Link to="/terms" style={{ color: 'var(--primary-gold)' }}>Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
