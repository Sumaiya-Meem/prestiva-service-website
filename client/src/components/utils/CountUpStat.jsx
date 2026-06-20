import React, { useEffect, useRef, useState } from 'react';

/**
 * Animates the leading number of a stat string (e.g. "500+", "5-Star", "7 Days")
 * counting up from 0 when it scrolls into view. Non-numeric values ("Fully
 * Insured") render unchanged. Respects prefers-reduced-motion.
 */
const CountUpStat = ({ value, duration = 1600 }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => {
    const m = String(value).match(/^(\D*)(\d+)(.*)$/);
    if (!m) return value;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return value;
    return `${m[1]}0${m[3]}`;
  });

  useEffect(() => {
    const m = String(value).match(/^(\D*)(\d+)(.*)$/);
    if (!m) {
      setDisplay(value);
      return;
    }
    const prefix = m[1];
    const target = parseInt(m[2], 10);
    const suffix = m[3];

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    setDisplay(`${prefix}0${suffix}`);
    const el = ref.current;
    let raf;
    let obs;
    let done = false;

    const run = () => {
      if (done) return;
      done = true;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setDisplay(`${prefix}${Math.round(eased * target)}${suffix}`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (el && 'IntersectionObserver' in window) {
      obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(); obs.disconnect(); } }),
        { threshold: 0.4 }
      );
      obs.observe(el);
    } else {
      run();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (obs) obs.disconnect();
    };
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
};

export default CountUpStat;
