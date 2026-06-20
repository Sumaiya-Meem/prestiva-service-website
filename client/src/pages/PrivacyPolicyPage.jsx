import React from 'react';
import siteConfig from '../config/siteConfig';
import Seo from '../components/utils/Seo';

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-page">
      <Seo
        title="Privacy Policy | Prestiva Property Services"
        description="How Prestiva Property Services collects, uses and protects the personal information you provide through our website and quote forms."
        path="/privacy"
      />

      <section className="section subpage-hero bg-navy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '28vh' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{ color: '#fff' }}>Privacy Policy</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="legal-content">
            <p>
              {siteConfig.businessName} ("we", "us", "our") respects your privacy and is committed to
              protecting the personal information you share with us. This policy explains what we collect
              and how we use it.
            </p>

            <h3>Information we collect</h3>
            <p>
              When you submit our quote or contact form, we collect the details you provide — such as your
              name, phone number, email address, service required, and the suburb or location of the job.
            </p>

            <h3>How we use your information</h3>
            <ul>
              <li>To respond to your enquiry and provide a quote.</li>
              <li>To arrange and deliver the services you request.</li>
              <li>To contact you about your booking or related services.</li>
            </ul>

            <h3>Sharing &amp; third parties</h3>
            <p>
              We do not sell your personal information. Form submissions are delivered to us by email using a
              secure email provider. Our location picker uses OpenStreetMap/Nominatim and map tiles to help you
              identify the job address. We only share information where necessary to deliver our services or as
              required by law.
            </p>

            <h3>Data retention</h3>
            <p>
              We keep enquiry details only as long as needed to respond to you and to provide our services,
              after which they are removed unless we are required to retain them.
            </p>

            <h3>Your choices</h3>
            <p>
              You can request access to, correction of, or deletion of the personal information we hold about
              you at any time by contacting us using the details below.
            </p>

            <h3>Contact us</h3>
            <p>
              Phone: <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a><br />
              Email: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br />
              Service areas: {siteConfig.locationText}
            </p>

            <p style={{ color: 'var(--medium-gray)', fontSize: '0.9rem', marginTop: '30px' }}>
              This policy may be updated from time to time. Please check this page for the latest version.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
