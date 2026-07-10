import React from 'react';
import { Link } from 'react-router-dom';
import RichText from '../utils/RichText';

// A button that routes internally (starts with "/") or opens an absolute URL.
const Btn = ({ text, link, className = 'btn btn-primary' }) => {
  if (!text) return null;
  const to = link || '/contact';
  return to.startsWith('/')
    ? <Link to={to} className={className}>{text}</Link>
    : <a href={to} className={className}>{text}</a>;
};

export const HeroBlock = ({ heading, subtext, image, buttonText, buttonLink }) => (
  <section
    className="hero-section subpage-hero"
    style={image ? { backgroundImage: `linear-gradient(rgba(10,22,40,0.6),rgba(10,22,40,0.6)), url(${image})` } : undefined}
  >
    <div className="container">
      <div className="hero-content">
        {heading && <h1 className="hero-title">{heading}</h1>}
        {subtext && <RichText as="p" className="hero-subtitle" html={subtext} />}
        {buttonText && <div className="hero-btns cta-btns"><Btn text={buttonText} link={buttonLink} /></div>}
      </div>
    </div>
  </section>
);

export const HeadingBlock = ({ text }) => (
  <section className="section">
    <div className="container">
      <h2 className="section-title" style={{ textAlign: 'center' }}>{text}</h2>
    </div>
  </section>
);

export const RichTextBlock = ({ html }) => (
  <section className="section">
    <div className="container" style={{ maxWidth: '820px' }}>
      <RichText as="div" className="legal-content" html={html} />
    </div>
  </section>
);

export const CtaBlock = ({ heading, buttonText, buttonLink }) => (
  <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
    <div className="container">
      {heading && <h2 className="section-title" style={{ color: '#fff' }}>{heading}</h2>}
      <div className="cta-btns" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        <Btn text={buttonText} link={buttonLink} />
      </div>
    </div>
  </section>
);

export const ImageBlock = ({ url, alt }) =>
  url ? (
    <section className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <img src={url} alt={alt || ''} loading="lazy" style={{ maxWidth: '100%', borderRadius: '12px' }} />
      </div>
    </section>
  ) : null;

export const TwoColumnBlock = ({ html, image, imageSide = 'right' }) => {
  const img = image ? (
    <div style={{ flex: '1', minWidth: '280px' }}>
      <img src={image} alt="" loading="lazy" style={{ maxWidth: '100%', borderRadius: '12px' }} />
    </div>
  ) : null;
  const text = (
    <div style={{ flex: '1', minWidth: '280px' }}>
      <RichText as="div" html={html} />
    </div>
  );
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
          {imageSide === 'left' ? <>{img}{text}</> : <>{text}{img}</>}
        </div>
      </div>
    </section>
  );
};

export const GetQuoteBlock = ({ buttonText, service }) => {
  const to = service ? `/contact?service=${encodeURIComponent(service)}` : '/contact';
  return (
    <section className="section cta-banner bg-navy" style={{ textAlign: 'center' }}>
      <div className="container">
        <Link to={to} className="btn btn-primary">{buttonText || 'Get a Free Quote'}</Link>
      </div>
    </section>
  );
};
