import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import siteConfig from '../config/siteConfig';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    service: '',
    suburb: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${siteConfig.apiBaseUrl}/api/contact`, formData);
      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          service: '',
          suburb: '',
          message: ''
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero / Header */}
      <section className="section subpage-hero bg-navy">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{ color: '#fff' }}>Get in Touch with {siteConfig.businessNameShort}</h1>
          <p className="hero-subtitle">
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
                    <p style={{ fontWeight: '700', fontSize: '1.2rem' }}>{siteConfig.whatsapp}</p>
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
            <div className="contact-form-container" style={{ padding: '50px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <h2 className="section-title" style={{ marginBottom: '10px', fontSize: '2rem' }}>Request a Free Quote</h2>
              <p style={{ marginBottom: '30px', color: 'var(--medium-gray)' }}>Fill in your details and we'll get back to you within 2 hours.</p>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div style={{ padding: '20px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaCheckCircle /> <strong>Thank you!</strong> Your quote request has been sent. We'll contact you shortly.
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '10px', marginBottom: '25px' }}>
                  <strong>Oops!</strong> Something went wrong. Please try again or call us directly at <a href={`tel:${siteConfig.phoneRaw}`} style={{ fontWeight: '700' }}>{siteConfig.phone}</a>.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone Number *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="0400 000 000" />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="john@example.com" />
                </div>

                <div className="contact-form-grid" style={{ marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Service Required *</label>
                    <select name="service" value={formData.service} onChange={handleChange} required
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                      <option value="">Select Service</option>
                      {siteConfig.serviceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Suburb / Location *</label>
                    <input type="text" name="suburb" value={formData.suburb} onChange={handleChange} required
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} placeholder="e.g. Adelaide Hills" />
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Message (optional)</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows="4"
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--light-gray)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Tell us about your cleaning needs..."></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}
                  style={{ width: '100%', padding: '16px', fontSize: '1.05rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? 'Sending...' : 'Get a Free Quote'}
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
