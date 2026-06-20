import React from 'react';
import { FaUserCheck, FaLeaf, FaTag, FaClock, FaCheckCircle } from 'react-icons/fa';

const WhyChoose = () => {
  const reasons = [
    {
      icon: <FaUserCheck />,
      title: "Police-checked & Fully Insured",
      text: "Every team member is vetted and covered, giving you total peace of mind."
    },
    {
      icon: <FaLeaf />,
      title: "Eco-friendly Products",
      text: "We use sustainable, non-toxic products that are safe for your family, staff, and pets."
    },
    {
      icon: <FaTag />,
      title: "Upfront Pricing",
      text: "No hidden costs. We provide clear, transparent quotes before any work begins."
    },
    {
      icon: <FaClock />,
      title: "Same-day Bookings",
      text: "Need it done fast? We offer flexible scheduling and urgent cleaning services."
    },
    {
      icon: <FaCheckCircle />,
      title: "Satisfaction Guarantee",
      text: "If you're not 100% happy with the results, we'll make it right — guaranteed."
    }
  ];

  return (
    <section className="section why-choose">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">Why Choose Prestiva?</h2>
          <p className="section-subtitle">A higher standard of service in every space we touch</p>
        </div>
        
        <div data-reveal className="why-grid">
          {reasons.map((reason, index) => (
            <div key={index} className="why-card">
              <div className="why-icon">{reason.icon}</div>
              <h3 className="why-card-title">{reason.title}</h3>
              <p className="why-card-text">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
