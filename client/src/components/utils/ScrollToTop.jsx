import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    // If there's a hash (e.g. /#pricing), scroll to that section instead of the top
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // let the page render, then smooth-scroll to the section
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
