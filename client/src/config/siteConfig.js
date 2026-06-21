/**
 * ============================================
 * PRESTIVA SITE CONFIGURATION
 * ============================================
 * Edit this file to update business details
 * across the entire website in one place.
 * ============================================
 */

const siteConfig = {
  // ── Business Identity ──
  businessName: "Prestiva Property Services",
  businessNameShort: "Prestiva",
  tagline: "Reliable results, every time.",
  motto: "Your Partner in Property Excellence",

  // ── Contact Details ──
  phone: "0403 540 227",
  phoneRaw: "0403540227",          // used in tel: links (no spaces)
  email: "admin@prestiva.com.au",
  whatsapp: "0403 540 227",
  whatsappRaw: "61403540227",      // international format for wa.me links

  // ── Locations ──
  locations: ["Adelaide", "Sydney"],
  locationText: "Adelaide & Sydney",
  serviceAreasDetailed: [
    {
      city: "Adelaide",
      region: "Greater Adelaide Metropolitan Area",
      suburbs: "CBD • Northern Suburbs • Southern Suburbs • Eastern Suburbs • Western Suburbs"
    },
    {
      city: "Sydney",
      suburbs: "CBD, Inner West, Eastern Suburbs, North Shore & Greater Sydney"
    }
  ],

  // ── Business Hours ──
  operatingHours: "7 Days a Week",

  // ── Social Media Links ──
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#"
  },

  // ── API / Backend URL ──
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",

  // ── Pricing (easy to update) ──
  pricing: {
    commercial: {
      office: { label: "Office Cleaning", price: "$35", unit: "/hour" },
      restaurant: { label: "Restaurant Cleaning", price: "$40", unit: "/hour" },
      afterBuilders: { label: "After Builders Cleaning", price: "$45", unit: "/hour" },
      strata: { label: "Strata & Contract", price: "Custom Quote", unit: "" }
    },
    residential: [
      { bed: "1 Bedroom", price: "$120" },
      { bed: "2 Bedroom", price: "$150" },
      { bed: "3 Bedroom", price: "$180" },
      { bed: "4 Bedroom", price: "$220" },
      { bed: "5 Bedroom", price: "$260" }
    ],
    landscaping: {
      mowing: { label: "Lawn Mowing", price: "$60" },
      cleanup: { label: "Garden Clean-up", price: "$120" },
      maintenance: { label: "Full Garden Maintenance", price: "$180" },
      pressure: { label: "Pressure Washing", price: "$100" }
    }
  },

  // ── Trust Stats ──
  trustStats: {
    propertiesServiced: "500+",
    googleRating: "5-Star",
    insurance: "Fully Insured",
    availability: "7 Days"
  },

  // ── Service Taxonomy (single source of truth for nav, pages & forms) ──
  serviceCategories: [
    {
      slug: "property-maintenance",
      title: "Property Maintenance",
      path: "/property-maintenance",
      fromPrice: "$65",
      blurb: "Reliable upkeep to keep every property in top condition.",
      services: [
        { name: "General Property Maintenance" },
        { name: "Garden & Lawn Care" },
        { name: "Gutter Cleaning" },
        { name: "Site Clean-Ups" },
        { name: "Green Waste Removal" },
        { name: "Lawn Mowing" },
        { name: "Weeding & Edging" },
        { name: "Pressure Cleaning" }
      ]
    },
    {
      slug: "landscaping",
      title: "Landscaping",
      path: "/landscaping",
      fromPrice: "$99",
      blurb: "Transforming outdoor spaces with turf, irrigation and design.",
      services: [
        { name: "Turf Laying" },
        { name: "Irrigation" },
        { name: "Soil Preparation" },
        { name: "Lawn Repair" },
        { name: "Garden Clean-Up" },
        { name: "Mulching" },
        { name: "Outdoor Area Preparation" },
        { name: "Fencing", comingSoon: true },
        { name: "Retaining Walls", comingSoon: true }
      ]
    },
    {
      slug: "cleaning",
      title: "Cleaning Services",
      path: "/cleaning",
      fromPrice: "$120",
      blurb: "Spotless results for homes, offices and everything in between.",
      services: [
        { name: "Commercial Cleaning", to: "/commercial" },
        { name: "Builders Cleaning" },
        { name: "After-Construction Cleaning" },
        { name: "End-of-Lease Cleaning", to: "/residential" },
        { name: "Carpet Cleaning" },
        { name: "Window Cleaning" },
        { name: "Deep Cleaning" },
        { name: "Office Cleaning" }
      ]
    }
  ],

  // ── Services Dropdown Options (for contact form) — kept as a flat fallback ──
  serviceOptions: [
    { value: "commercial", label: "Commercial Cleaning" },
    { value: "residential", label: "Residential Cleaning" },
    { value: "landscaping", label: "Landscaping & Gardening" },
    { value: "end-of-lease", label: "End of Lease Cleaning" },
    { value: "deep-clean", label: "Deep Cleaning" },
    { value: "other", label: "Other" }
  ],

  // ── Announcement Bar Messages ──
  announcements: [
    "🛠️ Property Maintenance Specialists",
    "🌿 Landscaping & Turf",
    "🏢 Commercial & Builders Cleaning",
    "✅ Fully Insured & Police Checked",
    "⭐ 5-Star Google Rated",
    "⏰ 7 Days a Week",
    "📞 Call us at 0403 540 227",
    "📧 Email us at admin@prestiva.com.au"
  ]
};

export default siteConfig;
