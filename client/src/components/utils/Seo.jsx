import React from 'react';

/**
 * Per-page SEO tags. React 19 automatically hoists <title>/<meta>/<link>
 * rendered anywhere in the tree into <head>, so no extra library is needed.
 */
const SITE_URL = 'https://www.prestiva.com.au';

const Seo = ({ title, description, path = '' }) => {
  const url = `${SITE_URL}${path}`;
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
};

export default Seo;
