import React from 'react';
import { UserCheck, Leaf, Tag, Clock, CheckCircle2 } from 'lucide-react';
import { getContent } from '../../../config/content';
import RichText from '../../utils/RichText';

// Icons stay in code, matched to reasons by position (extra items fall back to a tick).
const ICONS = [<UserCheck />, <Leaf />, <Tag />, <Clock />, <CheckCircle2 />];

const WhyChoose = () => {
  const reasons = getContent('home.why.items');
  return (
    <section className="section why-choose">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">{getContent('home.why.heading')}</h2>
          <p className="section-subtitle">{getContent('home.why.subheading')}</p>
        </div>

        <div data-reveal className="why-grid">
          {reasons.map((reason, index) => (
            <div key={index} className="why-card">
              <div className="why-icon">{ICONS[index] || <CheckCircle2 />}</div>
              <h3 className="why-card-title">{reason.title}</h3>
              <RichText as="p" className="why-card-text" html={reason.text} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
