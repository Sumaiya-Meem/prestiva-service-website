import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { getContent } from '../../../config/content';

// Structural bits (contact-link service + "popular" styling) stay in code;
// all visible text, prices and features are editable content.
const PLAN_META = [
  { service: 'Property Maintenance', popular: false },
  { service: 'Turf Laying', popular: false },
  { service: 'End-of-Lease Cleaning', popular: false },
  { service: 'Commercial Cleaning', popular: true },
];

const PricingOverview = () => {
  const plans = PLAN_META.map((meta, i) => {
    const n = i + 1;
    return {
      title: getContent(`home.pricing.p${n}.title`),
      price: getContent(`home.pricing.p${n}.price`),
      unit: getContent(`home.pricing.p${n}.unit`),
      features: getContent(`home.pricing.p${n}.features`),
      buttonText: getContent(`home.pricing.p${n}.button`),
      service: meta.service,
      popular: meta.popular,
    };
  });

  return (
    <section id="pricing" className="section pricing-overview">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">{getContent('home.pricing.heading')}</h2>
          <p className="section-subtitle">{getContent('home.pricing.subheading')}</p>
        </div>

        <div className="price-grid-4">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Speciality</div>}
              <h3 className="plan-title">{plan.title}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="unit">{plan.unit}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}><Check color="#27c281" /> {feature}</li>
                ))}
              </ul>
              <Link
                to={`/contact?service=${encodeURIComponent(plan.service)}`}
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', textAlign: 'center', marginTop: 'auto' }}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingOverview;
