import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reveals any element marked with `data-reveal` as it scrolls into view
 * (IntersectionObserver — works in all browsers). Re-scans on route change.
 */
const RevealManager = () => {
  const location = useLocation();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]:not(.is-revealed)'));
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [location.pathname]);

  return null;
};

export default RevealManager;
