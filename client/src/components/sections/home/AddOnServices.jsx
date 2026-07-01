import React from 'react';
import {
  CookingPot, AppWindow, Wind, Snowflake,
  DoorOpen, Blinds, PaintRoller, Warehouse,
  SprayCan, Sprout
} from 'lucide-react';

const AddOnServices = () => {
  const addons = [
    { icon: <CookingPot />, name: "Oven Clean" },
    { icon: <AppWindow />, name: "Window Clean" },
    { icon: <Wind />, name: "Carpet Steam" },
    { icon: <Snowflake />, name: "Fridge Clean" },
    { icon: <DoorOpen />, name: "Balcony Clean" },
    { icon: <Blinds />, name: "Blind Clean" },
    { icon: <PaintRoller />, name: "Wall Washing" },
    { icon: <Warehouse />, name: "Garage Tidy" },
    { icon: <SprayCan />, name: "Pressure Wash" },
    { icon: <Sprout />, name: "Mulching" }
  ];

  return (
    <section className="section add-on-services">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">Add-On Services</h2>
          <p className="section-subtitle">Customise your cleaning with these extra services</p>
        </div>
        
        <div className="addons-grid">
          {addons.map((addon, index) => (
            <div key={index} className="addon-tile">
              <div className="addon-icon">{addon.icon}</div>
              <h4 className="addon-name">{addon.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AddOnServices;
