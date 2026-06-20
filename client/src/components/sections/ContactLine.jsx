import React from 'react';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import siteConfig from '../../config/siteConfig';

/**
 * Inline "Call / Email" contact details, intended for the navy CTA banners
 * on service pages so the phone number and email are always displayed clearly.
 */
const ContactLine = ({ light = true }) => {
  const color = light ? '#fff' : 'var(--primary-navy)';
  return (
    <div className="contact-line" style={{ color }}>
      <a href={`tel:${siteConfig.phoneRaw}`} className="contact-line__item" style={{ color }}>
        <FaPhoneAlt color="var(--primary-gold)" /> {siteConfig.phone}
      </a>
      <a href={`mailto:${siteConfig.email}`} className="contact-line__item" style={{ color }}>
        <FaEnvelope color="var(--primary-gold)" /> {siteConfig.email}
      </a>
    </div>
  );
};

export default ContactLine;
