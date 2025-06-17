import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Needed for routing
import './header.css'; // Adjust the path if needed


const Header = () => {
  return (
    <div className="header">
      <div className="header-text">
        <h1>Book or List Your Dream Sauna</h1>
        <p>We help you to book your dream sauna</p>
        
        <Link to="/BookingSearchPage">
          <button className="button-green">Book Sauna</button>
        </Link>
        <Link to="/owner-login">
  <button className="button-green">List Sauna</button>
</Link>

        
      </div>
    </div>
  );
};

export default Header;
