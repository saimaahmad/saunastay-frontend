import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import UserBooking from '../components/UserBooking';
import UserProfilePage from '../components/UserProfilePage';
import UserFavoriteSaunas from '../components/UserFavoriteSaunas';
import UserBookingsTable from '../components/UserBookingsTable';
import { useTranslation } from 'react-i18next';

const UserDashboard = () => {
  const [userName, setUserName] = useState('');
  const { t } = useTranslation();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || '');
        }
      } catch (err) {
        console.error('Error fetching user name:', err);
      }
    };
    fetchUserName();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f5efe6] font-serif text-[#243a26] px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">
        👋 {userName
          ? t('dashboardU.title', { name: userName })
          : t('dashboardU.defaultTitle')}
      </h2>

      <div className="bg-[#fdf5e9] rounded-xl shadow-lg grid grid-cols-[250px_1fr] overflow-hidden" style={{ minHeight: '600px' }}>
        <div className="border-r border-[#ddd] bg-[#adb196]">
          <UserSidebar />
        </div>

        <div className="p-6">
          <Routes>
            <Route path="bookings" element={<UserBookingsTable />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="favorites" element={<UserFavoriteSaunas />} />
            <Route path="" element={<Navigate to="bookings" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
