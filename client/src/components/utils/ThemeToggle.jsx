import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const getInitialTheme = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  return 'light';
};

/**
 * Dark / light theme toggle. Persists to localStorage and updates the
 * <html data-theme> attribute (which drives all theming via CSS variables).
 */
const ThemeToggle = ({ className = '' }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      /* ignore */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1622' : '#0A1628');
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-tip={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeToggle;
