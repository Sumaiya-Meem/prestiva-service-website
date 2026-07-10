/** Editable content, grouped by page/section. Each field's `default` is the
 *  current on-site text — the single source of truth for the editor + fallback. */
export const CONTENT_GROUPS = [
  {
    id: 'home-hero', title: 'Homepage — Hero',
    fields: [
      { key: 'home.hero.title', label: 'Headline', type: 'text',
        default: 'Premium Property Maintenance, Landscaping & Cleaning in Adelaide' },
      { key: 'home.hero.subtitle', label: 'Subtitle', type: 'richtext',
        default: 'Reliable, fully insured services for commercial sites, builders, real estate, homes and outdoor spaces.' },
      { key: 'home.hero.ctaPrimary', label: 'Primary button text', type: 'text',
        default: 'Get a Free Quote' },
      { key: 'home.hero.trust', label: 'Trust badges', type: 'list', itemType: 'text',
        default: ['Fully Insured', 'Police Checked', 'Adelaide Based', 'Commercial & Residential'] },
    ],
  },
  {
    id: 'home-faq', title: 'Homepage — FAQ',
    fields: [
      { key: 'faq.heading', label: 'Section heading', type: 'text',
        default: 'Frequently Asked Questions' },
      { key: 'faq.subheading', label: 'Sub-heading', type: 'text',
        default: 'Everything you need to know about our services' },
      { key: 'faq.items', label: 'Questions & answers', type: 'listObject',
        itemFields: [
          { key: 'question', label: 'Question', type: 'text' },
          { key: 'answer', label: 'Answer', type: 'richtext' },
        ],
        default: [
          { question: 'What areas do you service?',
            answer: 'We currently provide professional cleaning and landscaping services across Adelaide and Sydney and their surrounding suburbs.' },
          { question: 'Are your team members insured and police-checked?',
            answer: 'Yes, our team members are professionally selected and committed to providing safe, reliable and high-quality service.' },
          { question: 'Do I need to be home for the service?',
            answer: "It's entirely up to you. Many of our clients provide access instructions or keys for when they are at work. We ensure your property is secure at all times." },
          { question: 'What is your satisfaction guarantee?',
            answer: 'We pride ourselves on quality. If you are not completely satisfied with our service, please contact us within 24 hours and we will return to rectify the issue at no extra cost.' },
          { question: 'Do you bring your own cleaning supplies?',
            answer: "Yes, we bring all necessary eco-friendly cleaning products and professional-grade equipment. If you have specific products you'd like us to use, just let us know!" },
        ] },
    ],
  },
  {
    id: 'home-why', title: 'Homepage — Why Choose',
    fields: [
      { key: 'home.why.heading', label: 'Section heading', type: 'text', default: 'Why Choose Prestiva?' },
      { key: 'home.why.subheading', label: 'Sub-heading', type: 'text', default: 'A higher standard of service in every space we touch' },
      { key: 'home.why.items', label: 'Reasons', type: 'listObject',
        itemFields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'text', label: 'Text', type: 'richtext' },
        ],
        default: [
          { title: 'Police-checked & Fully Insured', text: 'Every team member is vetted and covered, giving you total peace of mind.' },
          { title: 'Eco-friendly Products', text: 'We use sustainable, non-toxic products that are safe for your family, staff, and pets.' },
          { title: 'Upfront Pricing', text: 'No hidden costs. We provide clear, transparent quotes before any work begins.' },
          { title: 'Same-day Bookings', text: 'Need it done fast? We offer flexible scheduling and urgent cleaning services.' },
          { title: 'Satisfaction Guarantee', text: "If you're not 100% happy with the results, we'll make it right — guaranteed." },
        ] },
    ],
  },
  {
    id: 'home-reviews', title: 'Homepage — Reviews',
    fields: [
      { key: 'home.reviews.heading', label: 'Section heading', type: 'text', default: 'What Our Clients Say' },
      { key: 'home.reviews.subheading', label: 'Sub-heading', type: 'text', default: 'Real feedback from satisfied property owners' },
      { key: 'home.reviews.items', label: 'Reviews', type: 'listObject',
        itemFields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role / location', type: 'text' },
          { key: 'rating', label: 'Rating (1-5)', type: 'text' },
          { key: 'text', label: 'Review', type: 'textarea' },
        ],
        default: [
          { name: 'David H.', role: 'Property Manager, Adelaide', rating: 5, text: 'Prestiva has been managing our office cleaning for over a year. Their attention to detail is unmatched, and they are incredibly reliable. Highly recommend!' },
          { name: 'Sarah L.', role: 'Homeowner, Sydney', rating: 5, text: 'Booked an end-of-lease clean and was blown away. I got my full bond back without a single issue. The team was professional and friendly.' },
          { name: 'Mark T.', role: 'Restaurant Owner', rating: 5, text: 'Consistency is key in my business, and Prestiva delivers every time. Our kitchen and dining area look pristine every morning.' },
          { name: 'Jess M.', role: 'Airbnb Host, Adelaide', rating: 5, text: 'Fast turnarounds between guests and a spotless result every single time. My listing reviews have never been better since switching to Prestiva.' },
          { name: 'Tony R.', role: 'Builder, Sydney', rating: 5, text: 'Their after-construction clean got our site handover-ready ahead of schedule. Thorough, careful and great to deal with on busy projects.' },
          { name: 'Priya S.', role: 'Homeowner, Adelaide Hills', rating: 5, text: 'They mow, weed and keep our gardens immaculate. Same friendly crew each visit and the green waste is always taken away. Couldn’t be happier.' },
        ] },
    ],
  },
  {
    id: 'home-addons', title: 'Homepage — Add-On Services',
    fields: [
      { key: 'home.addons.heading', label: 'Section heading', type: 'text', default: 'Add-On Services' },
      { key: 'home.addons.subheading', label: 'Sub-heading', type: 'text', default: 'Customise your cleaning with these extra services' },
      { key: 'home.addons.items', label: 'Add-on names', type: 'list', itemType: 'text',
        default: ['Oven Clean', 'Window Clean', 'Carpet Steam', 'Fridge Clean', 'Balcony Clean', 'Blind Clean', 'Wall Washing', 'Garage Tidy', 'Pressure Wash', 'Mulching'] },
    ],
  },
  {
    id: 'home-checklist', title: 'Homepage — Cleaning Checklist',
    fields: [
      { key: 'home.checklist.heading', label: 'Section heading', type: 'text', default: 'What’s Included in Every Clean' },
      { key: 'home.checklist.subheading', label: 'Sub-heading', type: 'text', default: 'Our comprehensive checklist ensures no corner is missed' },
      { key: 'home.checklist.kitchen', label: 'Kitchen items', type: 'list', itemType: 'text',
        default: ['Benchtop and splashback cleaned', 'Sinks and taps sanitised and polished', 'Stovetop thoroughly cleaned', 'Exterior of oven and rangehood cleaned', 'Exterior of cupboards and drawers wiped', 'Microwave cleaned inside and out'] },
      { key: 'home.checklist.bathrooms', label: 'Bathrooms items', type: 'list', itemType: 'text',
        default: ['Shower, bathtub and tiles scrubbed', 'Toilets sanitised and cleaned', 'Vantiy and mirrors polished', 'Sinks and taps sanitised', 'Cabinets wiped down', 'Towel rails and light switches cleaned'] },
      { key: 'home.checklist.bedrooms', label: 'Bedrooms items', type: 'list', itemType: 'text',
        default: ['All surfaces dusted and wiped', 'Mirrors and glass surfaces cleaned', 'Window sills and tracks wiped', 'Light switches and door handles cleaned', 'Skirting boards dusted', 'Carpets vacuumed or floors mopped'] },
      { key: 'home.checklist.living', label: 'Living areas items', type: 'list', itemType: 'text',
        default: ['General dusting of all surfaces', 'Electronics dusted carefully', 'Coffee tables and dining areas cleaned', 'Upholstery vacuumed', 'Floor areas thoroughly cleaned', 'Internal cobwebs removed'] },
    ],
  },
  {
    id: 'home-commercial', title: 'Homepage — Commercial Spotlight',
    fields: [
      { key: 'home.commercial.eyebrow', label: 'Eyebrow label', type: 'text', default: 'Commercial & Builders' },
      { key: 'home.commercial.heading', label: 'Heading', type: 'text', default: 'Commercial Cleaning Specialists' },
      { key: 'home.commercial.body', label: 'Body paragraph', type: 'richtext',
        default: 'Prestiva Property Services provides reliable commercial cleaning for offices, retail spaces, construction sites and business premises. We offer once-off, after-hours and regular maintenance cleaning tailored to each site.' },
      { key: 'home.commercial.points', label: 'Points', type: 'list', itemType: 'text',
        default: ['Office & retail cleaning', 'Builders & after-construction cleaning', 'After-hours availability', 'Insured team', 'Flexible maintenance plans', 'Professional equipment'] },
      { key: 'home.commercial.button', label: 'Button text', type: 'text', default: 'Commercial Services' },
    ],
  },
  {
    id: 'home-pricing', title: 'Homepage — Pricing',
    fields: [
      { key: 'home.pricing.heading', label: 'Section heading', type: 'text', default: 'Simple, Transparent Pricing' },
      { key: 'home.pricing.subheading', label: 'Sub-heading', type: 'text', default: 'Premium quality service with no hidden costs' },
      { key: 'home.pricing.p1.title', label: 'Plan 1 — title', type: 'text', default: 'Property Maintenance' },
      { key: 'home.pricing.p1.price', label: 'Plan 1 — price', type: 'text', default: 'From $65' },
      { key: 'home.pricing.p1.unit', label: 'Plan 1 — unit', type: 'text', default: '/service' },
      { key: 'home.pricing.p1.features', label: 'Plan 1 — features', type: 'list', itemType: 'text',
        default: ['Lawn mowing', 'Weeding & edging', 'Gutter cleaning', 'Pressure cleaning', 'Green waste removal', 'Site clean-ups'] },
      { key: 'home.pricing.p1.button', label: 'Plan 1 — button', type: 'text', default: 'Get Maintenance Quote' },
      { key: 'home.pricing.p2.title', label: 'Plan 2 — title', type: 'text', default: 'Landscaping' },
      { key: 'home.pricing.p2.price', label: 'Plan 2 — price', type: 'text', default: 'From $99' },
      { key: 'home.pricing.p2.unit', label: 'Plan 2 — unit', type: 'text', default: '/service' },
      { key: 'home.pricing.p2.features', label: 'Plan 2 — features', type: 'list', itemType: 'text',
        default: ['Turf laying', 'Irrigation', 'Soil preparation', 'Lawn repair', 'Garden clean-up', 'Outdoor area preparation'] },
      { key: 'home.pricing.p2.button', label: 'Plan 2 — button', type: 'text', default: 'Get Landscaping Quote' },
      { key: 'home.pricing.p3.title', label: 'Plan 3 — title', type: 'text', default: 'Cleaning Services' },
      { key: 'home.pricing.p3.price', label: 'Plan 3 — price', type: 'text', default: 'From $120' },
      { key: 'home.pricing.p3.unit', label: 'Plan 3 — unit', type: 'text', default: '/service' },
      { key: 'home.pricing.p3.features', label: 'Plan 3 — features', type: 'list', itemType: 'text',
        default: ['End-of-lease cleaning', 'Builders cleaning', 'After-construction cleaning', 'Deep cleaning', 'Carpet cleaning', 'Window cleaning'] },
      { key: 'home.pricing.p3.button', label: 'Plan 3 — button', type: 'text', default: 'Get Cleaning Quote' },
      { key: 'home.pricing.p4.title', label: 'Plan 4 — title', type: 'text', default: 'Commercial Cleaning' },
      { key: 'home.pricing.p4.price', label: 'Plan 4 — price', type: 'text', default: 'From $35' },
      { key: 'home.pricing.p4.unit', label: 'Plan 4 — unit', type: 'text', default: '/hour' },
      { key: 'home.pricing.p4.features', label: 'Plan 4 — features', type: 'list', itemType: 'text',
        default: ['Office cleaning', 'Retail cleaning', 'After-hours cleaning', 'Regular maintenance plans', 'Fully insured team', 'Police checked staff'] },
      { key: 'home.pricing.p4.button', label: 'Plan 4 — button', type: 'text', default: 'Get Commercial Quote' },
    ],
  },
  {
    id: 'home-results', title: 'Homepage — Results Reel',
    fields: [
      { key: 'home.results.heading', label: 'Section heading', type: 'text', default: 'See the Results' },
      { key: 'home.results.subheading', label: 'Sub-heading', type: 'text', default: 'Real footage from our recent jobs — tap to play.' },
      { key: 'home.results.button', label: 'Button text', type: 'text', default: 'View Full Gallery' },
    ],
  },
];

/** Flattened key → default, for the content store. */
export const CONTENT_DEFAULTS = Object.fromEntries(
  CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.default]))
);
