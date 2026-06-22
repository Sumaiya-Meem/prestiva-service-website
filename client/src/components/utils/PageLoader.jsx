import React from 'react';

/**
 * Lightweight fallback shown while a lazy-loaded route chunk is fetched.
 * Kept minimal so it doesn't pull in any extra dependencies.
 */
const PageLoader = () => (
  <div className="page-loader" role="status" aria-live="polite" aria-label="Loading">
    <span className="page-loader__spinner" />
  </div>
);

export default PageLoader;
