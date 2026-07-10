import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Phone, Mail, Menu, X, Bell, ChevronDown, Search } from 'lucide-react';
import siteConfig from '../../config/siteConfig';
import { fetchNavPages } from '../../services/adminApi';
import ThemeToggle from '../utils/ThemeToggle';
import SearchModal from './SearchModal';
import logo from '../../assets/logos/prestiva-logo-horizontal-navy-gold.webp';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { label: 'Services', mega: true },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customNav, setCustomNav] = useState([]);
  const location = useLocation();

  // Pull marketing-built pages flagged "show in menu". Fault-tolerant — on any
  // failure the menu simply shows no extra links.
  useEffect(() => {
    let alive = true;
    fetchNavPages()
      .then((d) => alive && setCustomNav(d.pages || []))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Scroll lock + Escape while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  const renderItem = (item) => {
    if (!item.mega) {
      return (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          onClick={closeMenu}
        >
          {item.label}
        </NavLink>
      );
    }

    const isOpen = openDropdown === 'Services';
    return (
      <div
        key="Services"
        className={`nav-dropdown nav-mega${isOpen ? ' open' : ''}`}
        onMouseEnter={() => setOpenDropdown('Services')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          className="nav-link nav-dropdown__toggle"
          onClick={() => setOpenDropdown(isOpen ? null : 'Services')}
          aria-expanded={isOpen}
        >
          {item.label} <ChevronDown className="nav-dropdown__chevron" />
        </button>
        <div className={`nav-mega__menu${isOpen ? ' open' : ''}`}>
          {siteConfig.serviceCategories.map((cat) => (
            <div key={cat.slug} className="nav-mega__col">
              <Link to={cat.path} className="nav-mega__title" onClick={closeMenu}>{cat.title}</Link>
              <ul className="nav-mega__list">
                {cat.services.map((s) =>
                  s.comingSoon ? (
                    <li key={s.name}>
                      <span className="nav-mega__link nav-mega__link--soon">
                        {s.name} <span className="nav-mega__soon">Coming Soon</span>
                      </span>
                    </li>
                  ) : (
                    <li key={s.name}>
                      <Link to={s.to || cat.path} className="nav-mega__link" onClick={closeMenu}>
                        {s.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt={`${siteConfig.businessName} Logo`} style={{ maxHeight: '64px', width: 'auto' }} />
        </Link>

        <div
          className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {navItems.map(renderItem)}

          {/* Marketing-built pages flagged to show in the menu */}
          {customNav.map((p) => (
            <NavLink
              key={`custom-${p.slug}`}
              to={`/${p.slug}`}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {p.navLabel || p.title}
            </NavLink>
          ))}

          {/* Contact details + CTA inside the mobile slide-out menu */}
          <div className="mobile-menu-contact">
            <a href={`tel:${siteConfig.phoneRaw}`} className="mobile-menu-contact-link">
              <Phone /> {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="mobile-menu-contact-link">
              <Mail /> {siteConfig.email}
            </a>
            <Link to="/contact" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={closeMenu}>Get a Free Quote</Link>
          </div>
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search />
          </button>
          <Link to="/contact" className="btn btn-primary">
            <Bell className="cta-bell" /> Get a Free Quote
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className={`mobile-nav-toggle ${isMobileMenuOpen ? 'toggled' : ''}`}
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
