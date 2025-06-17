// src/components/SaunaListings.jsx
import React from 'react';
import './SaunaListings.css';

const SaunaListings = () => {
  return (
    <section className="sauna-listings">
      <div className="sauna-listings-header">
        <h2>Our Popular Saunas</h2>
        <p>Explore our curated selection of exquisite saunas and live your dream.</p>
      </div>

      <div className="listings-grid">
        {/* Multiple Sauna Listings */}
        <div className="listing">
          <img src="/images/sauna1.jpg" alt="Sauna 1" className="sauna-image" />
          <h3>Luxury Sauna</h3>
          <p>Relax and enjoy a premium sauna experience.</p>
          <button className="reserve-btn">Reserve</button>
        </div>
        <div className="listing">
          <img src="/images/sauna2.jpg" alt="Sauna 2" className="sauna-image" />
          <h3>Modern Sauna</h3>
          <p>Modern design with top-notch facilities.</p>
          <button className="reserve-btn">Reserve</button>
        </div>
        <div className="listing">
          <img src="/images/sauna3.jpg" alt="Sauna 3" className="sauna-image" />
          <h3>Traditional Sauna</h3>
          <p>Enjoy the timeless experience of a traditional sauna.</p>
          <button className="reserve-btn">Reserve</button>
        </div>
        <div className="listing">
          <img src="/images/sauna4.jpg" alt="Sauna 4" className="sauna-image" />
          <h3>Forest Retreat Sauna</h3>
          <p>A peaceful sauna experience surrounded by nature.</p>
          <button className="reserve-btn">Reserve</button>
        </div>
        <div className="listing">
          <img src="/images/sauna5.jpg" alt="Sauna 5" className="sauna-image" />
          <h3>Beachside Sauna</h3>
          <p>Sauna with a stunning view of the beach.</p>
          <button className="reserve-btn">Reserve</button>
        </div>
      </div>
    </section>
  );
};

export default SaunaListings;
