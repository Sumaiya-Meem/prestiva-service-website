import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getContent } from '../../../config/content';
import RichText from '../../utils/RichText';

const FAQ = () => {
  const faqs = getContent('faq.items');

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section faq-section">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">{getContent('faq.heading')}</h2>
          <p className="section-subtitle">{getContent('faq.subheading')}</p>
        </div>
        
        <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{faq.question}</h3>
                {activeIndex === index ? <ChevronUp /> : <ChevronDown />}
              </div>
              <div className="faq-answer">
                <RichText as="p" html={faq.answer} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
