import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getContent } from '../../../config/content';

const CleaningChecklist = () => {
  const [activeTab, setActiveTab] = useState('kitchen');

  const checklistData = {
    kitchen: getContent('home.checklist.kitchen'),
    bathrooms: getContent('home.checklist.bathrooms'),
    bedrooms: getContent('home.checklist.bedrooms'),
    living: getContent('home.checklist.living'),
  };

  return (
    <section className="section cleaning-checklist">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">{getContent('home.checklist.heading')}</h2>
          <p className="section-subtitle">{getContent('home.checklist.subheading')}</p>
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
                <CheckCircle2 className="check-icon" />
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
