import React from 'react';
import beforeAfter1 from '../../../assets/images/before_after_1.png';

const BeforeAfterGallery = () => {
  return (
    <section className="section before-after-gallery">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="section-title">Our Results Speak for Themselves</h2>
          <p className="section-subtitle">Real transformations from the Prestiva team</p>
        </div>
        
        <div className="gallery-container">
          <div className="gallery-item">
            <div className="gallery-img-wrapper">
              <img src={beforeAfter1} alt="Before and After Cleaning" />
              <div className="label-before">Before</div>
              <div className="label-after">After</div>
            </div>
            <div className="gallery-info">
              <h3>Commercial Office Transformation</h3>
              <p>Full deep clean and organization of a creative agency workspace.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterGallery;
