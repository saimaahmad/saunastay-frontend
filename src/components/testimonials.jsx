// src/components/Testimonials.jsx
import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2>What Our Customers Are Saying</h2>
      </div>

      <div className="testimonials-grid">
        {/* Multiple Testimonials */}
        <div className="testimonial">
          <p>"I had an amazing experience booking my sauna. The process was smooth and easy!"</p>
          <h4>John Doe</h4>
          <p>New York, USA</p>
        </div>
        <div className="testimonial">
          <p>"The sauna was fantastic! A perfect way to relax and unwind after a busy week."</p>
          <h4>Jane Smith</h4>
          <p>Los Angeles, USA</p>
        </div>
        <div className="testimonial">
          <p>"A wonderful experience. I’ll definitely be booking again soon!"</p>
          <h4>Sarah Lee</h4>
          <p>London, UK</p>
        </div>
        <div className="testimonial">
          <p>"The sauna was beautiful, and I loved the serene atmosphere. Highly recommend!"</p>
          <h4>Michael Brown</h4>
          <p>Toronto, Canada</p>
        </div>
        <div className="testimonial">
          <p>"Great experience from start to finish. The sauna was exactly what I needed!"</p>
          <h4>Emily Davis</h4>
          <p>Paris, France</p>
        </div>
        {/* Add more testimonials as needed */}
      </div>
    </section>
  );
};

export default Testimonials;


