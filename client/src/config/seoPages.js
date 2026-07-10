/**
 * Pages whose SEO title / description can be edited from the admin "SEO" tab.
 *
 * `defaultTitle` / `defaultDescription` mirror the built-in values each page
 * passes to <Seo>. They are used by the SEO panel for placeholders and the
 * live Google preview; the live site still uses the page's own prop as the
 * true runtime default (an override always wins — see resolveSeo).
 *
 * Service-category pages build their SEO dynamically at runtime, so they are
 * flagged `dynamic: true` and the panel shows a generic placeholder for them.
 */
export const SEO_PAGES = [
  {
    path: '/', name: 'Home',
    defaultTitle: 'Premium Property Maintenance, Landscaping & Cleaning in Adelaide | Prestiva',
    defaultDescription: 'Your Partner in Property Excellence. Property maintenance, landscaping and turf, plus commercial & builders cleaning across Adelaide. Fully insured, police checked. Get a free quote — call 0403 540 227.',
  },
  {
    path: '/about', name: 'About',
    defaultTitle: 'About Us | Prestiva Property Services — Adelaide & Sydney',
    defaultDescription: 'Prestiva Property Services is a fully insured, police-checked team delivering reliable cleaning, landscaping and property services across Adelaide & Sydney. Reliable results, every time.',
  },
  {
    path: '/cleaning', name: 'Cleaning', dynamic: true,
    defaultTitle: '', defaultDescription: '',
  },
  {
    path: '/landscaping', name: 'Landscaping',
    defaultTitle: 'Landscaping, Turf Laying & Irrigation Adelaide & Sydney | Prestiva',
    defaultDescription: 'Lawn mowing, garden clean-ups, hedge trimming, mulching, turf laying, irrigation and full garden maintenance across Adelaide & Sydney. Get a free landscaping quote today.',
  },
  {
    path: '/property-maintenance', name: 'Property Maintenance', dynamic: true,
    defaultTitle: '', defaultDescription: '',
  },
  {
    path: '/commercial', name: 'Commercial',
    defaultTitle: 'Commercial Cleaning Adelaide & Sydney | Offices, Strata & Builders | Prestiva',
    defaultDescription: 'Professional commercial cleaning for offices, restaurants, medical, retail, warehouses, strata and after-builders. Fully insured contract cleaning across Adelaide & Sydney. Get a free quote.',
  },
  {
    path: '/residential', name: 'Residential',
    defaultTitle: 'Residential & End-of-Lease Cleaning Adelaide & Sydney | Prestiva',
    defaultDescription: 'House cleaning, end-of-lease bond cleaning, deep cleans, move in/out and carpet steam cleaning across Adelaide & Sydney. Fully insured & police-checked. Get a free quote — 0403 540 227.',
  },
  {
    path: '/gallery', name: 'Gallery',
    defaultTitle: 'Our Work Gallery | Prestiva Property Services',
    defaultDescription: 'Real photos of our cleaning, builders, end-of-lease, pressure washing and property maintenance work across Adelaide & Sydney.',
  },
  {
    path: '/contact', name: 'Contact',
    defaultTitle: 'Contact Us & Get a Free Quote | Prestiva Property Services',
    defaultDescription: 'Request a free, no-obligation quote for cleaning, landscaping, turf or irrigation. Call 0403 540 227 or email admin@prestiva.com.au. Serving Adelaide & Sydney, 7 days a week.',
  },
  {
    path: '/privacy', name: 'Privacy Policy',
    defaultTitle: 'Privacy Policy | Prestiva Property Services',
    defaultDescription: 'How Prestiva Property Services collects, uses and protects the personal information you provide through our website and quote forms.',
  },
  {
    path: '/terms', name: 'Terms of Service',
    defaultTitle: 'Terms of Service | Prestiva Property Services',
    defaultDescription: 'The terms under which Prestiva Property Services provides cleaning, landscaping and property services, including quotes, bookings, payment and cancellations.',
  },
];
