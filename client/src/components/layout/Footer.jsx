import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import siteConfig from '../../config/siteConfig';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ color: '#fff', marginBottom: '20px' }}>
              {siteConfig.businessNameShort.toUpperCase()}<span style={{ color: '#D4A853' }}>.</span>
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
              <li><Link to="/commercial">All Services</Link></li>
              <li><Link to="/contact">Get a Quote</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              <li><Link to="/commercial">Commercial Cleaning</Link></li>
              <li><Link to="/residential">Residential Cleaning</Link></li>
              <li><Link to="/landscaping">Landscaping</Link></li>
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
          <p>&copy; {new Date().getFullYear()} {siteConfig.businessName}. All Rights Reserved. Fully Insured & Police Checked.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
