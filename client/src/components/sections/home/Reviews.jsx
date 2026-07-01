import React from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import useCarousel from '../../utils/useCarousel';

const testimonials = [
  {
    name: 'David H.',
    role: 'Property Manager, Adelaide',
    rating: 5,
    text: 'Prestiva has been managing our office cleaning for over a year. Their attention to detail is unmatched, and they are incredibly reliable. Highly recommend!',
  },
  {
    name: 'Sarah L.',
    role: 'Homeowner, Sydney',
    rating: 5,
    text: 'Booked an end-of-lease clean and was blown away. I got my full bond back without a single issue. The team was professional and friendly.',
  },
  {
    name: 'Mark T.',
    role: 'Restaurant Owner',
    rating: 5,
    text: 'Consistency is key in my business, and Prestiva delivers every time. Our kitchen and dining area look pristine every morning.',
  },
  {
    name: 'Jess M.',
    role: 'Airbnb Host, Adelaide',
    rating: 5,
    text: 'Fast turnarounds between guests and a spotless result every single time. My listing reviews have never been better since switching to Prestiva.',
  },
  {
    name: 'Tony R.',
    role: 'Builder, Sydney',
    rating: 5,
    text: 'Their after-construction clean got our site handover-ready ahead of schedule. Thorough, careful and great to deal with on busy projects.',
  },
  {
    name: 'Priya S.',
    role: 'Homeowner, Adelaide Hills',
    rating: 5,
    text: 'They mow, weed and keep our gardens immaculate. Same friendly crew each visit and the green waste is always taken away. Couldn’t be happier.',
  },
];

const Reviews = () => {
  const { trackRef, slide, pause, resume } = useCarousel({ gap: 24, interval: 4500 });

  return (
    <section className="section reviews">
      <div className="container">
        <div data-reveal className="section-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Real feedback from satisfied property owners</p>
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
                  {[...Array(review.rating)].map((_, i) => (
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
