import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const faqs = [
    {
      question: "What areas do you service?",
      answer: "We currently provide professional cleaning and landscaping services across Adelaide and Sydney and their surrounding suburbs."
    },
    {
      question: "Are your cleaners insured and police-checked?",
      answer: "Yes, absolutely. For your peace of mind, all our staff undergo rigorous background checks and we carry full public liability insurance."
    },
    {
      question: "Do I need to be home for the service?",
      answer: "It's entirely up to you. Many of our clients provide access instructions or keys for when they are at work. We ensure your property is secure at all times."
    },
    {
      question: "What is your satisfaction guarantee?",
      answer: "We pride ourselves on quality. If you are not completely satisfied with our service, please contact us within 24 hours and we will return to rectify the issue at no extra cost."
    },
    {
      question: "Do you bring your own cleaning supplies?",
      answer: "Yes, we bring all necessary eco-friendly cleaning products and professional-grade equipment. If you have specific products you'd like us to use, just let us know!"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section faq-section">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about our services</p>
        </div>
        
        <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{faq.question}</h3>
                {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
