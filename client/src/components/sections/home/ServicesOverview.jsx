import React from 'react';
import { Link } from 'react-router-dom';
import { SprayCan, Leaf, Wrench } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';
import { getContent } from '../../../config/content';

const iconMap = {
  cleaning: <SprayCan />,
  landscaping: <Leaf />,
  'property-maintenance': <Wrench />,
};

const ServicesOverview = () => {
  const services = siteConfig.serviceCategories.map((cat) => ({
    id: cat.slug,
    title: cat.title,
    description: cat.blurb,
    icon: iconMap[cat.slug],
    link: cat.path,
    price: cat.fromPrice,
  }));

  return (
    <section id="services" className="section services-overview">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">{getContent('home.services.heading')}</h2>
          <p className="section-subtitle">{getContent('home.services.subheading')}</p>
        </div>
        
        <div data-reveal className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon-box">{service.icon}</div>
              <h3 className="service-card-title">{service.title}</h3>
              {service.price && <p className="service-card-price">From {service.price}</p>}
              <p className="service-card-text">{service.description}</p>
              <Link to={service.link} className="service-link">{getContent('home.services.linkText')} &rarr;</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
