import React from 'react';
import {
  CookingPot, AppWindow, Wind, Snowflake,
  DoorOpen, Blinds, PaintRoller, Warehouse,
  SprayCan, Sprout
} from 'lucide-react';
import { getContent } from '../../../config/content';

// Icons stay in code, matched to add-ons by position (extras fall back to a spray can).
const ICONS = [
  <CookingPot />, <AppWindow />, <Wind />, <Snowflake />, <DoorOpen />,
  <Blinds />, <PaintRoller />, <Warehouse />, <SprayCan />, <Sprout />,
];

const AddOnServices = () => {
  const addons = getContent('home.addons.items');
  return (
    <section className="section add-on-services">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">{getContent('home.addons.heading')}</h2>
          <p className="section-subtitle">{getContent('home.addons.subheading')}</p>
        </div>

        <div className="addons-grid">
          {addons.map((name, index) => (
            <div key={index} className="addon-tile">
              <div className="addon-icon">{ICONS[index] || <SprayCan />}</div>
              <h4 className="addon-name">{name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AddOnServices;
