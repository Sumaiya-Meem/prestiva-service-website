import React from 'react';
import siteConfig from '../config/siteConfig';
import { getContent } from '../config/content';
import Seo from '../components/utils/Seo';
import RichText from '../components/utils/RichText';

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
          <h1 className="hero-title" style={{ color: '#fff' }}>{getContent('terms.title')}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="legal-content">
            <RichText as="p" html={getContent('terms.intro')} />

            <h3>{getContent('terms.s1.heading')}</h3>
            <RichText as="p" html={getContent('terms.s1.body')} />

            <h3>{getContent('terms.s2.heading')}</h3>
            <RichText as="p" html={getContent('terms.s2.body')} />

            <h3>{getContent('terms.s3.heading')}</h3>
            <RichText as="p" html={getContent('terms.s3.body')} />

            <h3>{getContent('terms.s4.heading')}</h3>
            <RichText as="p" html={getContent('terms.s4.body')} />

            <h3>{getContent('terms.s5.heading')}</h3>
            <RichText as="p" html={getContent('terms.s5.body')} />

            <h3>{getContent('terms.s6.heading')}</h3>
            <RichText as="p" html={getContent('terms.s6.body')} />

            <h3>{getContent('terms.contactHeading')}</h3>
            <p>
              Phone: <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a><br />
              Email: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br />
              Service areas: {siteConfig.locationText}
            </p>

            <p style={{ color: 'var(--medium-gray)', fontSize: '0.9rem', marginTop: '30px' }}>
              {getContent('terms.footer')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
