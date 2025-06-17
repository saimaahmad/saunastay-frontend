import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Routes, Route } from 'react-router-dom';
import AdminHome from './AdminHome';
import ManageUsers from './ManageUsers';
import ManageSaunas from './ManageSaunas';
import ManageBookings from './ManageBookings';

import AdminRequests from './AdminRequests';


const AdminDashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 bg-[#edc8a3] min-h-screen">
        
        <div className="p-6">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="saunas" element={<ManageSaunas />} />
            <Route path="bookings" element={<ManageBookings />} />
                    <Route path="requests" element={<AdminRequests />} />
          </Routes>

        </div>



        
      </div>
    </div>
  );
};

export default AdminDashboard;
