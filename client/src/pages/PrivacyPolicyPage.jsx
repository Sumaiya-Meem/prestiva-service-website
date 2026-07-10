import React from 'react';
import siteConfig from '../config/siteConfig';
import { getContent } from '../config/content';
import Seo from '../components/utils/Seo';
import RichText from '../components/utils/RichText';

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
          <h1 className="hero-title" style={{ color: '#fff' }}>{getContent('privacy.title')}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="legal-content">
            <RichText as="p" html={getContent('privacy.intro')} />

            <h3>{getContent('privacy.s1.heading')}</h3>
            <RichText as="p" html={getContent('privacy.s1.body')} />

            <h3>{getContent('privacy.s2.heading')}</h3>
            <ul>
              {getContent('privacy.s2.items').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>{getContent('privacy.s3.heading')}</h3>
            <RichText as="p" html={getContent('privacy.s3.body')} />

            <h3>{getContent('privacy.s4.heading')}</h3>
            <RichText as="p" html={getContent('privacy.s4.body')} />

            <h3>{getContent('privacy.s5.heading')}</h3>
            <RichText as="p" html={getContent('privacy.s5.body')} />

            <h3>{getContent('privacy.contactHeading')}</h3>
            <p>
              Phone: <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a><br />
              Email: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br />
              Service areas: {siteConfig.locationText}
            </p>

            <p style={{ color: 'var(--medium-gray)', fontSize: '0.9rem', marginTop: '30px' }}>
              {getContent('privacy.footer')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
