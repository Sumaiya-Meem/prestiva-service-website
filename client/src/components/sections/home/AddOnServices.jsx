import React from 'react';
import { 
  FaUtensils, FaWindowMaximize, FaWind, FaSnowflake, 
  FaDoorOpen, FaColumns, FaPaintRoller, FaWarehouse, 
  FaBroom, FaSun 
} from 'react-icons/fa';

const AddOnServices = () => {
  const addons = [
    { icon: <FaUtensils />, name: "Oven Clean" },
    { icon: <FaWindowMaximize />, name: "Window Clean" },
    { icon: <FaWind />, name: "Carpet Steam" },
    { icon: <FaSnowflake />, name: "Fridge Clean" },
    { icon: <FaDoorOpen />, name: "Balcony Clean" },
    { icon: <FaColumns />, name: "Blind Clean" },
    { icon: <FaPaintRoller />, name: "Wall Washing" },
    { icon: <FaWarehouse />, name: "Garage Tidy" },
    { icon: <FaBroom />, name: "Pressure Wash" },
    { icon: <FaSun />, name: "Mulching" }
  ];

  return (
    <section className="section add-on-services">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
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
