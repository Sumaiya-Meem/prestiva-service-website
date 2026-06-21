import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';

const plans = [
  {
    title: 'Property Maintenance',
    price: 'From $65',
    unit: '/service',
    features: ['Lawn mowing', 'Weeding & edging', 'Gutter cleaning', 'Pressure cleaning', 'Green waste removal', 'Site clean-ups'],
    buttonText: 'Get Maintenance Quote',
    service: 'Property Maintenance',
  },
  {
    title: 'Landscaping',
    price: 'From $99',
    unit: '/service',
    features: ['Turf laying', 'Irrigation', 'Soil preparation', 'Lawn repair', 'Garden clean-up', 'Outdoor area preparation'],
    buttonText: 'Get Landscaping Quote',
    service: 'Turf Laying',
  },
  {
    title: 'Cleaning Services',
    price: 'From $120',
    unit: '/service',
    features: ['End-of-lease cleaning', 'Builders cleaning', 'After-construction cleaning', 'Deep cleaning', 'Carpet cleaning', 'Window cleaning'],
    buttonText: 'Get Cleaning Quote',
    service: 'End-of-Lease Cleaning',
  },
  {
    title: 'Commercial Cleaning',
    price: 'From $35',
    unit: '/hour',
    features: ['Office cleaning', 'Retail cleaning', 'After-hours cleaning', 'Regular maintenance plans', 'Fully insured team', 'Police checked staff'],
    buttonText: 'Get Commercial Quote',
    service: 'Commercial Cleaning',
    popular: true,
  },
];

const PricingOverview = () => {
  return (
    <section id="pricing" className="section pricing-overview">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">Premium quality service with no hidden costs</p>
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
                  <li key={i}><FaCheck color="#27c281" /> {feature}</li>
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
