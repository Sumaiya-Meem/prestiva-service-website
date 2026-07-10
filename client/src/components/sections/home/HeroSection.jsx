import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';
import { getContent } from '../../../config/content';
import { pageBgUrl } from '../../../config/pageBackgrounds';
import RichText from '../../utils/RichText';

const HeroSection = () => {
  const heroImg = pageBgUrl('home');
  return (
    <section className="hero-section hero-home">
      <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }} />
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">{getContent('home.hero.title')}</h1>
          <p className="hero-motto">{siteConfig.motto}</p>
          <RichText as="p" className="hero-subtitle" html={getContent('home.hero.subtitle')} />
          <div className="hero-btns">
            <Link to="/contact" className="btn btn-primary">{getContent('home.hero.ctaPrimary')}</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', borderColor: '#fff' }}>
              <Phone /> Call {siteConfig.phone}
            </a>
          </div>

          <ul className="hero-trust">
            {getContent('home.hero.trust').map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
