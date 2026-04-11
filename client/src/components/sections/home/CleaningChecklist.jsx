import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const CleaningChecklist = () => {
  const [activeTab, setActiveTab] = useState('kitchen');

  const checklistData = {
    kitchen: [
      "Benchtop and splashback cleaned",
      "Sinks and taps sanitised and polished",
      "Stovetop thoroughly cleaned",
      "Exterior of oven and rangehood cleaned",
      "Exterior of cupboards and drawers wiped",
      "Microwave cleaned inside and out"
    ],
    bathrooms: [
      "Shower, bathtub and tiles scrubbed",
      "Toilets sanitised and cleaned",
      "Vantiy and mirrors polished",
      "Sinks and taps sanitised",
      "Cabinets wiped down",
      "Towel rails and light switches cleaned"
    ],
    bedrooms: [
      "All surfaces dusted and wiped",
      "Mirrors and glass surfaces cleaned",
      "Window sills and tracks wiped",
      "Light switches and door handles cleaned",
      "Skirting boards dusted",
      "Carpets vacuumed or floors mopped"
    ],
    living: [
      "General dusting of all surfaces",
      "Electronics dusted carefully",
      "Coffee tables and dining areas cleaned",
      "Upholstery vacuumed",
      "Floor areas thoroughly cleaned",
      "Internal cobwebs removed"
    ]
  };

  return (
    <section className="section cleaning-checklist">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">What’s Included in Every Clean</h2>
          <p className="section-subtitle">Our comprehensive checklist ensures no corner is missed</p>
        </div>
        
        <div className="checklist-tabs">
          {Object.keys(checklistData).map((tab) => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="checklist-content">
          <div className="checklist-grid">
            {checklistData[activeTab].map((item, index) => (
              <div key={index} className="checklist-item">
                <FaCheckCircle className="check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CleaningChecklist;
