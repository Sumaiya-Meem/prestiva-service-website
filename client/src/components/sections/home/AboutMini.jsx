import React from 'react';
import { Link } from 'react-router-dom';
import { getContent } from '../../../config/content';
import RichText from '../../utils/RichText';

const AboutMini = () => {
  return (
    <section className="section about-mini">
      <div className="container">
        <div className="about-mini-grid" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="about-mini-content">
            <h4 className="text-gold" style={{ marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>{getContent('home.about.eyebrow')}</h4>
            <h2 className="section-title" style={{ marginBottom: '25px' }}>{getContent('home.about.heading')}</h2>
            <RichText as="p" style={{ marginBottom: '30px', color: 'var(--medium-gray)' }} html={getContent('home.about.body1')} />
            <RichText as="p" style={{ marginBottom: '40px', color: 'var(--medium-gray)' }} html={getContent('home.about.body2')} />
            <Link to="/about" className="btn btn-outline" style={{ color: 'var(--primary-navy)', borderColor: 'var(--primary-navy)' }}>{getContent('home.about.button')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMini;
