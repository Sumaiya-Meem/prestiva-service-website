import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaClock, FaCheckCircle, FaCrosshairs, FaCloudUploadAlt } from 'react-icons/fa';
import axios from 'axios';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Quote-form service options + their starting prices
const QUOTE_SERVICES = [
  // Property Maintenance
  { name: 'Property Maintenance', price: 'From $65' },
  { name: 'Lawn & Garden Care', price: 'From $65' },
  { name: 'Gutter Cleaning', price: 'From $65' },
  { name: 'Pressure Cleaning', price: 'From $65' },
  // Landscaping
  { name: 'Turf Laying', price: 'From $99' },
  { name: 'Irrigation', price: 'From $99' },
  // Cleaning Services
  { name: 'Commercial Cleaning', price: 'From $35/hour' },
  { name: 'Builders / After-Construction Cleaning', price: 'From $120' },
  { name: 'End-of-Lease Cleaning', price: 'From $120' },
  { name: 'Other' },
];
const SERVICE_PRICE_MAP = Object.fromEntries(QUOTE_SERVICES.filter((s) => s.price).map((s) => [s.name, s.price]));
const PROPERTY_TYPES = ['Residential / Home', 'Commercial / Office', 'Retail', 'Real Estate', 'Construction Site', 'Strata', 'Other'];

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    service: '',
    propertyType: '',
    preferredDate: '',
    suburb: '',
    message: '',
    website: '', // honeypot — must stay empty
    mapLat: null,
    mapLng: null
  });
  const [photos, setPhotos] = useState([]);

  // Pre-select the service if arriving from a pricing button (/contact?service=...)
  useEffect(() => {
    const s = searchParams.get('service');
    if (s && QUOTE_SERVICES.some((opt) => opt.name === s)) {
      setFormData((prev) => ({ ...prev, service: s }));
    }
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultLocation = { lat: -34.9285, lng: 138.6007 }; // Default to Adelaide approx

  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [mapCenter, setMapCenter] = useState([defaultLocation.lat, defaultLocation.lng]);
  const [markerPos, setMarkerPos] = useState(defaultLocation);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Turn a map point into a full street address and fill the (still-editable) field.
  const reverseGeocode = async (lat, lon) => {
    setIsResolvingAddress(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`
      );
      const fullAddress = res?.data?.display_name || '';
      setFormData(prev => ({
        ...prev,
        suburb: fullAddress || prev.suburb,
        mapLat: lat,
        mapLng: lon
      }));
    } catch (err) {
      console.error("Geocoding failed", err);
      setFormData(prev => ({ ...prev, mapLat: lat, mapLng: lon }));
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setMarkerPos({ lat, lng });
          reverseGeocode(lat, lng);
          setIsGeolocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not access your location. Please ensure location permissions are granted in your browser settings.");
          setIsGeolocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const LocationSelector = () => {
    const map = useMap();
    useMapEvents({
      click(e) {
        setMarkerPos(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    
    // Sync map center if it's explicitly set by 'Use Current Location'
    useEffect(() => {
      if (mapCenter) {
        map.flyTo(mapCenter, 14); // flyTo provides a smooth pan
      }
    }, [mapCenter, map]);

    return markerPos ? <Marker position={markerPos} /> : null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6);
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v === null ? '' : v));
      photos.forEach((file) => data.append('photos', file));

      const response = await axios.post(`${siteConfig.apiBaseUrl}/api/contact`, data);
      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({
          fullName: '', phone: '', email: '', service: '', propertyType: '',
          preferredDate: '', suburb: '', message: '', website: '', mapLat: null, mapLng: null,
        });
        setPhotos([]);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-dismiss the confirmation/error toast after a few seconds
  useEffect(() => {
    if (!submitStatus) return;
    const timer = setTimeout(() => setSubmitStatus(null), submitStatus === 'success' ? 6000 : 8000);
    return () => clearTimeout(timer);
  }, [submitStatus]);

  const servicePrice = SERVICE_PRICE_MAP[formData.service];

  return (
    <div className="contact-page">
      {/* Confirmation / error snackbar — portalled to <body> so it's pinned to the
          viewport (the page wrapper's lingering transform would otherwise trap it). */}
      {submitStatus && createPortal(
        <div className={`form-toast form-toast--${submitStatus}`} role="status" aria-live="polite">
          {submitStatus === 'success' ? (
            <>
              <FaCheckCircle className="form-toast__icon" />
              <div><strong>Thank you.</strong> Your quote request has been received. Our team will contact you shortly.</div>
            </>
          ) : (
            <>
              <span className="form-toast__icon" aria-hidden="true">⚠️</span>
              <div><strong>Oops!</strong> Something went wrong. Please try again or call <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a>.</div>
            </>
          )}
          <button type="button" className="form-toast__close" onClick={() => setSubmitStatus(null)} aria-label="Dismiss">&times;</button>
        </div>,
        document.body
      )}
      <Seo
        title="Contact Us & Get a Free Quote | Prestiva Property Services"
        description="Request a free, no-obligation quote for cleaning, landscaping, turf or irrigation. Call 0403 540 227 or email admin@prestiva.com.au. Serving Adelaide & Sydney, 7 days a week."
        path="/contact"
      />
      {/* Hero / Header */}
      <section className="section subpage-hero bg-navy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{ color: '#fff' }}>Get in Touch with Prestiva</h1>
          <p className="contact-hero-subtitle">
            Professional support. Fast response. Reliable service.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-container">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="section-title" style={{ marginBottom: '40px' }}>Contact Options</h2>

              <div style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--off-white)', borderRadius: '50%', color: 'var(--primary-gold)' }}><FaPhoneAlt fontSize="1.5rem" /></div>
                  <div>
                    <h4 style={{ marginBottom: '5px' }}>Call Us</h4>
                    <a href={`tel:${siteConfig.phoneRaw}`} style={{ fontWeight: '700', fontSize: '1.2rem' }}>{siteConfig.phone}</a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--off-white)', borderRadius: '50%', color: 'var(--primary-gold)' }}><FaEnvelope fontSize="1.5rem" /></div>
                  <div>
                    <h4 style={{ marginBottom: '5px' }}>Email Us</h4>
                    <a href={`mailto:${siteConfig.email}`} style={{ fontWeight: '700', fontSize: '1.2rem' }}>{siteConfig.email}</a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                  <div style={{ padding: '15px', backgroundColor: 'var(--off-white)', borderRadius: '50%', color: 'var(--primary-gold)' }}><FaWhatsapp fontSize="1.5rem" /></div>
                  <div>
                    <h4 style={{ marginBottom: '5px' }}>SMS / WhatsApp</h4>
                    <a href={`https://wa.me/${siteConfig.whatsappRaw}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: '700', fontSize: '1.2rem' }}>{siteConfig.whatsapp}</a>
                  </div>
                </div>
              </div>

              <div style={{ padding: '40px', backgroundColor: 'var(--off-white)', borderRadius: '20px' }}>
                <h3 style={{ marginBottom: '25px' }}>Business Details</h3>
                <ul style={{ listStyle: 'none', color: 'var(--medium-gray)' }}>
                  <li style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                    <FaMapMarkerAlt color="var(--primary-gold)" /> <span><strong>Service Areas:</strong> {siteConfig.locationText}</span>
                  </li>
                  <li style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                    <FaClock color="var(--primary-gold)" /> <span><strong>Operating Hours:</strong> {siteConfig.operatingHours}</span>
                  </li>
                  <li style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                    <FaPhoneAlt color="var(--primary-gold)" /> <span><strong>Phone:</strong> {siteConfig.phone}</span>
                  </li>
                  <li style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <FaEnvelope color="var(--primary-gold)" /> <span><strong>Email:</strong> {siteConfig.email}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container" style={{ padding: '50px', backgroundColor: 'var(--surface)', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <h2 className="section-title" style={{ marginBottom: '10px', fontSize: '2rem' }}>Request a Free Quote</h2>
              <p style={{ marginBottom: '30px', color: 'var(--medium-gray)' }}>Fill in your details and we'll get back to you within 2 hours.</p>

              <form onSubmit={handleSubmit}>
                {/* Honeypot: hidden from users, catches spam bots */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                />
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label htmlFor="cf-fullName" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Name *</label>
                    <input id="cf-fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} required autoComplete="name"
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-phone" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone Number *</label>
                    <input id="cf-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required autoComplete="tel"
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="0400 000 000" />
                  </div>
                </div>

                <div className="contact-form-grid" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label htmlFor="cf-email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email Address *</label>
                    <input id="cf-email" type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email"
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="john@example.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-service" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Service Required *</label>
                    <select id="cf-service" name="service" value={formData.service} onChange={handleChange} required
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', backgroundColor: 'var(--surface)', color: 'var(--dark-text)' }}>
                      <option value="">Select Service</option>
                      {QUOTE_SERVICES.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    {servicePrice && (
                      <div className="service-price-note">
                        <span>Starting price</span>
                        <strong>{servicePrice}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="contact-form-grid" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label htmlFor="cf-propertyType" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Property Type</label>
                    <select id="cf-propertyType" name="propertyType" value={formData.propertyType} onChange={handleChange}
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', backgroundColor: 'var(--surface)', color: 'var(--dark-text)' }}>
                      <option value="">Select Property Type</option>
                      {PROPERTY_TYPES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-preferredDate" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Preferred Date</label>
                    <input id="cf-preferredDate" type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange}
                      style={{ width: '100%', padding: '13px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', backgroundColor: 'var(--surface)', color: 'var(--dark-text)' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="cf-suburb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontWeight: '600' }}>
                    <span>Address / Location *</span>
                    <button type="button" onClick={handleLocateMe} disabled={isGeolocating} aria-label="Use Current Location"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--off-white)', border: '1px solid var(--light-gray)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <FaCrosshairs /> {isGeolocating ? 'Locating...' : 'Use Current Location'}
                    </button>
                  </label>

                  <p style={{ fontSize: '0.82rem', color: 'var(--medium-gray)', margin: '0 0 10px' }}>
                    Tap the map to drop a pin (or use your current location) — the full address fills in automatically, and you can still edit it below.
                  </p>

                  <div style={{ height: '300px', marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--light-gray)', position: 'relative', zIndex: 1, backgroundColor: '#f0f0f0' }}>
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        attribution="&copy; Google Maps"
                      />
                      <LocationSelector />
                    </MapContainer>
                  </div>

                  {isResolvingAddress && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', margin: '0 0 8px', fontWeight: 600 }}>
                      📍 Detecting address…
                    </p>
                  )}

                  <textarea id="cf-suburb" name="suburb" value={formData.suburb} onChange={handleChange} required rows="2" autoComplete="street-address"
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', resize: 'vertical' }}
                    placeholder="Select a point on the map, use your location, or type your full address here" />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="cf-message" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Details (optional)</label>
                  <textarea id="cf-message" name="message" value={formData.message} onChange={handleChange} rows="4"
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Tell us about the job — size, access, frequency, special requests…"></textarea>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Upload Photos (optional)</label>
                  <label className="upload-box">
                    <FaCloudUploadAlt />
                    <span>{photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''} selected` : 'Tap to add photos of the job (up to 6)'}</span>
                    <input type="file" name="photos" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}
                  style={{ width: '100%', padding: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
                  {isSubmitting ? 'Sending…' : 'Submit Quote Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-navy" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>Speak with Our Team Today</h2>
          <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', padding: '15px 40px' }}>
            <FaPhoneAlt /> Call {siteConfig.businessNameShort} Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
