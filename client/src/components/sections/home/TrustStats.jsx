import React from 'react';
import { FaBuilding, FaStar, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import siteConfig from '../../../config/siteConfig';

const TrustStats = () => {
  const stats = [
    { icon: <FaBuilding />, number: siteConfig.trustStats.propertiesServiced, label: "Properties Serviced" },
    { icon: <FaStar />, number: siteConfig.trustStats.googleRating, label: "Google Rated" },
    { icon: <FaShieldAlt />, number: siteConfig.trustStats.insurance, label: "& Police Checked" },
    { icon: <FaCalendarAlt />, number: siteConfig.trustStats.availability, label: "A Week" }
  ];

  return (
    <div className="trust-stats-strip">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStats;
