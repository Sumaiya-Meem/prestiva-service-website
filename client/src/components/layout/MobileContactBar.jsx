import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, FileText } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

/**
 * Sticky bottom contact bar shown on mobile devices only.
 * Two premium actions: "Call Now" (tel:) and "Get a Free Quote" (/contact).
 */
const MobileContactBar = () => {
  return (
    <div className="mobile-contact-bar">
      <a href={`tel:${siteConfig.phoneRaw}`} className="mobile-contact-bar__btn mobile-contact-bar__call">
        <Phone /> Call Now
      </a>
      <Link to="/contact" className="mobile-contact-bar__btn mobile-contact-bar__quote">
        <FileText /> Get a Free Quote
      </Link>
    </div>
  );
};

export default MobileContactBar;
