import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhoneAlt, FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn,
  FaCommentDots, FaTimes, FaFileInvoiceDollar,
} from 'react-icons/fa';
import siteConfig from '../../config/siteConfig';

/**
 * A single floating action button that expands into a speed-dial menu:
 * Get a Free Quote, Call Now, WhatsApp, Facebook, Instagram, LinkedIn.
 * Fully responsive.
 */
const FloatingActions = () => {
  const [open, setOpen] = useState(false);

  const waText = encodeURIComponent(
    `Hi ${siteConfig.businessNameShort}, I'd like a free quote for your services.`
  );

  const actions = [
    { key: 'quote', label: 'Get a Free Quote', to: '/contact', internal: true, icon: <FaFileInvoiceDollar />, cls: 'fab-quote' },
    { key: 'call', label: 'Call Now', href: `tel:${siteConfig.phoneRaw}`, icon: <FaPhoneAlt />, cls: 'fab-call' },
    { key: 'wa', label: 'WhatsApp', href: `https://wa.me/${siteConfig.whatsappRaw}?text=${waText}`, icon: <FaWhatsapp />, cls: 'fab-wa' },
    { key: 'fb', label: 'Facebook', href: siteConfig.social.facebook, icon: <FaFacebookF />, cls: 'fab-fb' },
    { key: 'ig', label: 'Instagram', href: siteConfig.social.instagram, icon: <FaInstagram />, cls: 'fab-ig' },
    { key: 'li', label: 'LinkedIn', href: siteConfig.social.linkedin, icon: <FaLinkedinIn />, cls: 'fab-li' },
  ];

  const close = () => setOpen(false);

  return (
    <>
      {open && <div className="fab__overlay" onClick={close} aria-hidden="true" />}

      <div className={`fab ${open ? 'fab--open' : ''}`}>
        <ul className="fab__menu">
          {actions.map((a, i) => {
            const external = a.href && a.href.startsWith('http');
            const inner = (
              <>
                {a.icon}
                <span className="fab__tooltip">{a.label}</span>
              </>
            );
            return (
              <li key={a.key} className="fab__item" style={{ transitionDelay: `${open ? i * 45 : 0}ms` }}>
                {a.internal ? (
                  <Link to={a.to} className={`fab__action ${a.cls}`} aria-label={a.label} tabIndex={open ? 0 : -1} onClick={close}>
                    {inner}
                  </Link>
                ) : (
                  <a
                    href={a.href}
                    className={`fab__action ${a.cls}`}
                    aria-label={a.label}
                    tabIndex={open ? 0 : -1}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onClick={close}
                  >
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="fab__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close contact menu' : 'Open contact menu'}
        >
          <span className="fab__toggle-icon">{open ? <FaTimes /> : <FaCommentDots />}</span>
        </button>
      </div>
    </>
  );
};

export default FloatingActions;
