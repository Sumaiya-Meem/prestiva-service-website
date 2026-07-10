import React from 'react';
import { Building2, Star, ShieldCheck, CalendarDays } from 'lucide-react';
import siteConfig from '../../../config/siteConfig';
import { getContent } from '../../../config/content';
import CountUpStat from '../../utils/CountUpStat';

const TrustStats = () => {
  const stats = [
    { icon: <Building2 />, number: siteConfig.trustStats.propertiesServiced, label: getContent('home.trust.label1') },
    { icon: <Star fill="currentColor" />, number: siteConfig.trustStats.googleRating, label: getContent('home.trust.label2') },
    { icon: <ShieldCheck />, number: siteConfig.trustStats.insurance, label: getContent('home.trust.label3') },
    { icon: <CalendarDays />, number: siteConfig.trustStats.availability, label: getContent('home.trust.label4') }
  ];

  return (
    <div className="trust-stats-strip">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number"><CountUpStat value={stat.number} /></div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStats;
