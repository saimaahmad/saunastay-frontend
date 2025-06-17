import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import GuestFavorites from '../pages/GuestFavorites'; // adjust path if needed
import { useTranslation } from 'react-i18next';

const ThankYouPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = new URLSearchParams(location.search).get('bookingId');

  const [booking, setBooking] = useState(null);
  const [sauna, setSauna]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!bookingId) return navigate('/');
      const bSnap = await getDoc(doc(db, 'bookings', bookingId));
      if (!bSnap.exists()) return navigate('/');
      const b = bSnap.data();
      setBooking(b);

      const sSnap = await getDoc(doc(db, 'saunas', b.saunaId));
      if (sSnap.exists()) setSauna({ id: sSnap.id, ...sSnap.data() });

      setLoading(false);
    };
    loadData();
  }, [bookingId, navigate]);

  if (loading || !booking || !sauna) {
    return (
      <p className="text-center py-20 text-gray-500">
        {t('loadingBookingDetails', 'Loading your booking details...')}
      </p>
    );
  }

  const totalPaid = sauna.price * booking.spotsBooked;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Main Message */}
      <section className="bg-green-100 p-6 rounded-xl mb-10 shadow">
        <h2 className="text-3xl font-semibold text-green-800 mb-4">
          🎉 {t('thankYouBooking', 'Thank you for your booking!')}
        </h2>
        <p>
          {t('sessionConfirmed', 'Your session at {{sauna}} is confirmed.', {
            sauna: sauna.title
          })}
        </p>
        <ul className="mt-4 space-y-1 text-gray-700">
          <li>
            <strong>📍 {t('location', 'Location')}:</strong> {sauna.city}
          </li>
          <li>
            <strong>📆 {t('date', 'Date')}:</strong> {booking.date}
          </li>
          <li>
            <strong>🕒 {t('time', 'Time')}:</strong> {booking.time} ({sauna.timezone})
          </li>
          <li>
            <strong>👥 {t('spotsH')}:</strong> {booking.spotsBooked}
          </li>
          <li>
            <strong>💳 {t('totalPaid', 'Total Paid')}:</strong> €{totalPaid}
          </li>
          <li>
            <strong>📨 {t('confirmationEmail', 'Confirmation Email')}:</strong> {booking.userEmail}
          </li>
          <li>
            <strong>🔖 {t('bookingId', 'Booking ID')}:</strong> {bookingId}
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          {t(
            'arriveNote',
            'Please arrive 10 minutes early and bring your own towel.'
          )}
        </p>
      </section>

      {/* Recommendations */}
      <section className="mt-12">
    
         <GuestFavorites />
        
      </section>

     
    </div>
  );
};

export default ThankYouPage;
