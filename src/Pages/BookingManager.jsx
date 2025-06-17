import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const BookingManager = () => {
  const [groupedBookings, setGroupedBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('ownerEmail', '==', user.email));

      const unsubscribeBookings = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map((doc) => doc.data());

        const grouped = {};
        bookings.forEach((booking) => {
          const title = booking.saunaTitle || t('bookingManager.unknownSauna');
          if (!grouped[title]) grouped[title] = [];
          grouped[title].push(booking);
        });

        setGroupedBookings(grouped);
        setLoading(false);
      });

      return () => unsubscribeBookings();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="bg-[#d4b89c] min-h-screen p-4 md:p-6 rounded">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-[#243a26]">
        {t('bookingManager.title')}
      </h2>

      {loading ? (
        <p className="text-gray-600">{t('bookingManager.loading')}</p>
      ) : Object.keys(groupedBookings).length === 0 ? (
        <div className="bg-[#e1d5c9] p-6 rounded shadow text-center text-gray-500">
          {t('bookingManager.noBookings')}
        </div>
      ) : (
        Object.entries(groupedBookings).map(([saunaTitle, bookings]) => (
          <div key={saunaTitle} className="mb-8">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-[#243a26]">{saunaTitle}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] bg-white rounded shadow">
                <thead>
                  <tr className="bg-[#caa26a] text-white text-left text-sm md:text-base">
                    <th className="py-3 px-4">{t('bookingManager.customer')}</th>
                    <th className="py-3 px-4">{t('bookingManager.email')}</th>
                    <th className="py-3 px-4">{t('bookingManager.date')}</th>
                    <th className="py-3 px-4">{t('bookingManager.time')}</th>
                    <th className="py-3 px-4">{t('bookingManager.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={index} className="border-t text-gray-700 text-sm md:text-base">
                      <td className="py-3 px-4">{booking.customerName}</td>
                      <td className="py-3 px-4">{booking.customerEmail}</td>
                      <td className="py-3 px-4">{booking.date}</td>
                      <td className="py-3 px-4">{booking.time}</td>
                      <td className="py-3 px-4 capitalize">{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BookingManager;
