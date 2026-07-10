import React from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import useCarousel from '../../utils/useCarousel';
import { getContent } from '../../../config/content';

const Reviews = () => {
  const testimonials = getContent('home.reviews.items');
  const { trackRef, slide, pause, resume } = useCarousel({ gap: 24, interval: 4500 });

  return (
    <section className="section reviews">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">{getContent('home.reviews.heading')}</h2>
          <p className="section-subtitle">{getContent('home.reviews.subheading')}</p>
        </div>

        <div className="reviews-carousel" onMouseEnter={pause} onMouseLeave={resume}>
          <button className="carousel-arrow carousel-arrow--prev" onClick={() => slide(-1)} aria-label="Previous reviews">
            <ChevronLeft />
          </button>

          <div className="reviews-track" ref={trackRef}>
            {testimonials.map((review, index) => (
              <div key={index} className="review-slide review-card">
                <div className="quote-icon"><Quote /></div>
                <div className="rating">
                  {[...Array(Number(review.rating) || 0)].map((_, i) => (
                    <Star key={i} color="var(--primary-gold)" fill="var(--primary-gold)" />
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

          <button className="carousel-arrow carousel-arrow--next" onClick={() => slide(1)} aria-label="More reviews">
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
