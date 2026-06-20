import React from 'react';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <Seo
        title="Terms of Service | Prestiva Property Services"
        description="The terms under which Prestiva Property Services provides cleaning, landscaping and property services, including quotes, bookings, payment and cancellations."
        path="/terms"
      />

      <section className="section subpage-hero bg-navy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '28vh' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{ color: '#fff' }}>Terms of Service</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="legal-content">
            <p>
              These terms apply to services provided by {siteConfig.businessName} ("we", "us", "our").
              By requesting a quote or booking a service, you agree to the terms below.
            </p>

            <h3>Quotes &amp; bookings</h3>
            <p>
              Quotes are provided free of charge and are based on the information you supply. Final pricing
              may be adjusted if the actual scope of work differs from what was described. A booking is
              confirmed once we agree a date and the scope of work with you.
            </p>

            <h3>Service standards</h3>
            <p>
              We aim to deliver every job to a high, professional standard. If you are not satisfied with any
              part of the work, please contact us within 24 hours so we can make it right.
            </p>

            <h3>Access &amp; safety</h3>
            <p>
              You agree to provide safe and reasonable access to the property and to advise us of any hazards,
              pets, alarms or special requirements before the service.
            </p>

            <h3>Payment</h3>
            <p>
              Payment is due on completion of the service unless otherwise agreed in writing. Recurring or
              contract work may be invoiced on agreed terms.
            </p>

            <h3>Cancellations &amp; rescheduling</h3>
            <p>
              Please give us at least 24 hours' notice to cancel or reschedule a booking so we can offer the
              slot to another customer.
            </p>

            <h3>Liability &amp; insurance</h3>
            <p>
              We are fully insured. To the extent permitted by law, our liability is limited to re-performing
              the service or the cost of the service. Nothing in these terms excludes rights you have under
              the Australian Consumer Law.
            </p>

            <h3>Contact us</h3>
            <p>
              Phone: <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a><br />
              Email: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br />
              Service areas: {siteConfig.locationText}
            </p>

            <p style={{ color: 'var(--medium-gray)', fontSize: '0.9rem', marginTop: '30px' }}>
              These terms may be updated from time to time. Please check this page for the latest version.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
