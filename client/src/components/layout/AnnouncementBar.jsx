import React from 'react';
import { getContent } from '../../config/content';

// Match emails (and keep them as a captured part when splitting)
const EMAIL_RE = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;
const EMAIL_SPLIT_RE = new RegExp(EMAIL_RE.source, 'gi');

// Render an announcement, keeping any email address in its original lower case
const renderAnnouncement = (text) =>
  text.split(EMAIL_SPLIT_RE).map((part, i) =>
    EMAIL_RE.test(part)
      ? <span key={i} className="ticker-keepcase">{part}</span>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );

const AnnouncementBar = () => {
  const announcements = getContent('announcements.items');
  return (
    <div className="announcement-bar">
      <div className="ticker-wrapper">
        <div className="ticker">
          {[...announcements, ...announcements].map((text, index) => (
            <span key={index} className="ticker-item">{renderAnnouncement(text)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
