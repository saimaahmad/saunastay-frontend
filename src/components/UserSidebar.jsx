import React from 'react';
import { NavLink } from 'react-router-dom';

const UserSidebar = () => {
  const baseClasses = 'block py-2 px-4 rounded hover:bg-[#e3dac9]';
  const activeClass = 'bg-[#d2c3a9] font-semibold';

  return (
    <div className="p-6 space-y-4 bg-[#adb196]">
      <h3 className="text-xl font-bold mb-4">Menu</h3>
      <nav className="space-y-2">
        <NavLink
          to="/user/profile" // ✅ absolute path
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClass : ''}`
          }
        >
          👤 Profile
        </NavLink>
        <NavLink
          to="/user/bookings" // ✅ absolute path
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClass : ''}`
          }
        >
          📅 My Bookings
        </NavLink>
        <NavLink
          to="/user/favorites" // ✅ absolute path
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClass : ''}`
          }
        >
          ❤️ My Favorites
        </NavLink>
      </nav>
    </div>
  );
};

export default UserSidebar;
