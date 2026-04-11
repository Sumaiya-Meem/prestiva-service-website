import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';

const PricingOverview = () => {
  const plans = [
    {
      title: "Commercial",
      price: "From $35",
      unit: "/hour",
      features: ["Office & Retail Cleaning", "Fully Insured Team", "Police Checked Staff", "flexible After-Hours", "Regular Maintenance Plans"],
      buttonText: "Get Commercial Quote",
      popular: false
    },
    {
      title: "Residential",
      price: "From $120",
      unit: "/service",
      features: ["Standard House Cleaning", "Deep Cleaning Options", "End of Lease Specials", "Bond Back Guarantee", "Same Day Availability"],
      buttonText: "Book Home Clean",
      popular: true
    },
    {
      title: "Landscaping",
      price: "From $60",
      unit: "/service",
      features: ["Lawn Mowing & Edging", "Hedge & Tree Trimming", "Garden Clean-Ups", "Green Waste Removal", "One-off or Regular"],
      buttonText: "Garden Quote",
      popular: false
    }
  ];

  return (
    <section className="section pricing-overview">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">Premium quality service with no hidden costs</p>
        </div>
        
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-title">{plan.title}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="unit">{plan.unit}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}><FaCheck color="var(--success-green)" /> {feature}</li>
                ))}
              </ul>
              <Link to="/contact" className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', textAlign: 'center' }}>
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
