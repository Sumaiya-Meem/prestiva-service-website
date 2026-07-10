import React from 'react';
import siteConfig from '../../config/siteConfig';
import { resolveSeo } from '../../utils/resolveSeo';

/**
 * Per-page SEO tags. React 19 automatically hoists <title>/<meta>/<link>
 * rendered anywhere in the tree into <head>, so no extra library is needed.
 *
 * Pass `schema` (an object or array of schema.org objects) to add page-specific
 * structured data (e.g. a Service). The site-wide LocalBusiness node is always
 * included so search engines get business info on every page.
 */
const SITE_URL = 'https://www.prestiva.com.au';

const localBusinessSchema = {
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: siteConfig.businessName,
  url: SITE_URL,
  image: `${SITE_URL}/logo-icon.svg`,
  telephone: `+61${siteConfig.phoneRaw.replace(/^0/, '')}`,
  email: siteConfig.email,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Adelaide',
    addressRegion: 'SA',
    addressCountry: 'AU',
  },
  areaServed: siteConfig.locations.map((name) => ({ '@type': 'City', name })),
  sameAs: [
    siteConfig.social.facebook,
    siteConfig.social.instagram,
    siteConfig.social.tiktok,
  ].filter((u) => u && u !== '#'),
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '07:00',
    closes: '19:00',
  },
};

const Seo = ({ title, description, path = '', schema, noindex: noindexProp }) => {
  const url = `${SITE_URL}${path}`;

  // Admin overrides (from the "SEO" tab) win; a blank override falls back to the
  // page's built-in default, so a page can never render a blank title/description.
  const { title: seoTitle, description: seoDescription, noindex: overrideNoindex } =
    resolveSeo(siteConfig.seo?.[path], { title, description });

  // Dynamic (page-builder) pages pass noindex directly; fixed pages use the SEO-tab override.
  const noindex = noindexProp ?? overrideNoindex;

  // Build a single @graph so all nodes share one script tag.
  const extra = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [localBusinessSchema, ...extra],
  };

  return (
    <>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
    </>
  );
};

export default Seo;
