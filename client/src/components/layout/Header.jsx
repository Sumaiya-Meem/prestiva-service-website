import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaBars, FaTimes } from 'react-icons/fa';
import siteConfig from '../../config/siteConfig';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          {siteConfig.businessNameShort.toUpperCase()}<span>.</span>
        </Link>

        <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link to="/commercial" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Commercial Cleaning</Link>
          <Link to="/residential" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Residential Cleaning</Link>
          <Link to="/landscaping" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Landscaping</Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
        </nav>

        <div className="header-actions">
          <a href={`tel:${siteConfig.phoneRaw}`} className="phone-link">
            <FaPhoneAlt /> {siteConfig.phone}
          </a>
          <Link to="/contact" className="btn btn-primary">Get a Free Quote</Link>
          <div className={`mobile-nav-toggle ${isMobileMenuOpen ? 'toggled' : ''}`} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
