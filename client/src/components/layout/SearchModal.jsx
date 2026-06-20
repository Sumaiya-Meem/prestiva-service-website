import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowRight } from 'react-icons/fa';

// Searchable pages / services
const PAGES = [
  { title: 'Home', path: '/', desc: 'Welcome to Prestiva Property Services', keywords: 'home start' },
  { title: 'About Us', path: '/about', desc: 'Who we are — insured & police-checked', keywords: 'about team insured police checked values' },
  { title: 'Cleaning Services', path: '/cleaning', desc: 'Commercial, office, end-of-lease, carpet, window, deep', keywords: 'cleaning commercial office builders after construction real estate airbnb end of lease bond carpet window deep' },
  { title: 'Landscaping', path: '/landscaping', desc: 'Turf laying, irrigation, soil prep & lawn repair', keywords: 'landscaping turf laying irrigation soil preparation lawn repair garden clean up outdoor fencing retaining walls' },
  { title: 'Property Maintenance', path: '/property-maintenance', desc: 'Gutters, mowing, green waste, pressure cleaning', keywords: 'property maintenance garden lawn care gutter cleaning site clean ups green waste removal mowing weeding edging pressure cleaning' },
  { title: 'Commercial Cleaning', path: '/commercial', desc: 'Offices, strata, medical, after-builders', keywords: 'commercial office restaurant medical retail warehouse strata after builders contract' },
  { title: 'Residential & End-of-Lease Cleaning', path: '/residential', desc: 'Homes, deep cleans & bond cleaning', keywords: 'residential house home end of lease bond deep clean move in out carpet steam spring' },
  { title: 'Gallery', path: '/gallery', desc: 'See our work', keywords: 'gallery photos before after results portfolio' },
  { title: 'Get a Free Quote', path: '/contact', desc: 'Contact us — free, no-obligation quote', keywords: 'contact quote phone email enquiry book free' },
];

const SearchModal = ({ open, onClose }) => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      document.body.style.overflow = 'hidden';
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    document.body.style.overflow = '';
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return PAGES;
    return PAGES.filter((p) => `${p.title} ${p.desc} ${p.keywords}`.toLowerCase().includes(term));
  }, [q]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && results[0]) go(results[0].path);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Site search">
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <FaSearch className="search-input-icon" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services & pages…"
            className="search-input"
            aria-label="Search"
          />
          <button className="search-close" onClick={onClose} aria-label="Close search"><FaTimes /></button>
        </div>

        <ul className="search-results">
          {results.length === 0 && (
            <li className="search-empty">No matches. Try “cleaning”, “lawn”, or “quote”.</li>
          )}
          {results.map((r) => (
            <li key={r.path}>
              <button className="search-result" onClick={() => go(r.path)}>
                <span>
                  <span className="search-result__title">{r.title}</span>
                  <span className="search-result__desc">{r.desc}</span>
                </span>
                <FaArrowRight className="search-result__arrow" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchModal;
