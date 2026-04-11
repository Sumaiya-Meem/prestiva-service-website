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

  // ── Contact Details ──
  phone: "0400 000 000",
  phoneRaw: "0400000000",          // used in tel: links (no spaces)
  email: "info@prestiva.com.au",
  whatsapp: "0400 000 000",

  // ── Locations ──
  locations: ["Adelaide", "Sydney"],
  locationText: "Adelaide & Sydney",
  serviceAreasDetailed: [
    {
      city: "Adelaide",
      suburbs: "CBD, North, South, East & West Suburbs"
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

  // ── Services Dropdown Options (for contact form) ──
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
    "🏢 Commercial Cleaning Specialists",
    "🏠 Residential Cleaning",
    "🌿 Landscaping & Gardening",
    "✅ Fully Insured & Police Checked",
    "⭐ 5-Star Google Rated",
    "⏰ 7 Days a Week"
  ]
};

export default siteConfig;
