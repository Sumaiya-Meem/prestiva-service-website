import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const Reviews = () => {
  const testimonials = [
    {
      name: "David H.",
      role: "Property Manager, Adelaide",
      rating: 5,
      text: "Prestiva has been managing our office cleaning for over a year. Their attention to detail is unmatched, and they are incredibly reliable. Highly recommend!"
    },
    {
      name: "Sarah L.",
      role: "Homeowner, Sydney",
      rating: 5,
      text: "Booked an end-of-lease clean and was blown away. I got my full bond back without a single issue. The team was professional and friendly."
    },
    {
      name: "Mark T.",
      role: "Restaurant Owner",
      rating: 5,
      text: "Consistency is key in my business, and Prestiva delivers every time. Our kitchen and dining area look pristine every morning."
    }
  ];

  return (
    <section className="section reviews">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Real feedback from satisfied property owners</p>
        </div>
        
        <div className="reviews-grid">
          {testimonials.map((review, index) => (
            <div key={index} className="review-card">
              <div className="quote-icon"><FaQuoteLeft /></div>
              <div className="rating">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} color="var(--primary-gold)" />
                ))}
              </div>
              <p className="review-text">{review.text}</p>
              <div className="review-author">
                <div className="author-info">
                  <h4 className="author-name">{review.name}</h4>
                  <p className="author-role">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
