import React from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaHome, FaLeaf } from 'react-icons/fa';

const ServicesOverview = () => {
  const services = [
    {
      id: "commercial",
      title: "Commercial Cleaning",
      description: "Professional cleaning solutions for offices, retail, warehouses, and more.",
      icon: <FaBuilding />,
      link: "/commercial"
    },
    {
      id: "residential",
      title: "Residential Cleaning",
      description: "Expert home cleaning, end of lease, deep cleans, and carpet services.",
      icon: <FaHome />,
      link: "/residential"
    },
    {
      id: "landscaping",
      title: "Landscaping & Gardening",
      description: "Premium lawn care, garden maintenance, and landscaping designs.",
      icon: <FaLeaf />,
      link: "/landscaping"
    }
  ];

  return (
    <section className="section services-overview">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">Our Service Specialisations</h2>
          <p className="section-subtitle">Comprehensive property care tailored to your needs</p>
        </div>
        
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon-box">{service.icon}</div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-text">{service.description}</p>
              <Link to={service.link} className="service-link">Learn More &rarr;</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
