import React from 'react';
import siteConfig from '../../config/siteConfig';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="ticker-wrapper">
        <div className="ticker">
          {[...siteConfig.announcements, ...siteConfig.announcements].map((text, index) => (
            <span key={index} className="ticker-item">{text}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
