import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import siteConfig from '../../config/siteConfig';
import footerLogo from '../../assets/logos/prestiva-logo-stacked-navy-gold.svg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-badge" aria-label={`${siteConfig.businessName} home`}>
              <img src={footerLogo} alt={`${siteConfig.businessName} Logo`} loading="lazy" decoding="async" />
            </Link>
            <p style={{ marginTop: '20px', color: '#6C757D' }}>
              Your trusted partner for professional commercial cleaning, residential cleaning, and landscaping services. {siteConfig.tagline}
            </p>
            <div className="social-links" style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              <a href={siteConfig.social.facebook} className="social-link"><FaFacebook /></a>
              <a href={siteConfig.social.instagram} className="social-link"><FaInstagram /></a>
              <a href={siteConfig.social.linkedin} className="social-link"><FaLinkedin /></a>
            </div>
          </div>

          <div className="footer-nav">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/contact">Get a Quote</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              {siteConfig.serviceCategories.map((cat) => (
                <li key={cat.slug}><Link to={cat.path}>{cat.title}</Link></li>
              ))}
              <li><Link to="/contact">Get a Quote</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-title">Contact Us</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <FaPhoneAlt color="#D4A853" /> <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <FaEnvelope color="#D4A853" /> <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <FaMapMarkerAlt color="#D4A853" /> {siteConfig.locationText}
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
