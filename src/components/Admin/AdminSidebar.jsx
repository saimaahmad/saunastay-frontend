import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-[#caa26a] text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 font-serif">SaunaStay</h2>

      <nav className="space-y-4">
        <Link to="/admin/dashboard" className="block hover:text-[#243a26]">Dashboard</Link>
        <Link to="/admin/dashboard/users" className="block hover:text-[#243a26]">Manage Users</Link>
        <Link to="/admin/dashboard/saunas" className="block hover:text-[#243a26]">
  Manage Saunas
</Link>


        <Link to="/admin/dashboard/bookings" className="block hover:text-[#243a26]">Manage Bookings</Link>
      
        <Link to="/admin/dashboard/requests" className="block hover:text-[#243a26]">
  Manage Requests
</Link>

      </nav>
    </div>
  );
};

export default AdminSidebar;
