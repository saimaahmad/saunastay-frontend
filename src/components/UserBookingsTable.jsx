import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import RequestAdminModal from '../components/RequestAdminModal';

const UserBookingsTable = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'bookings'), where('userEmail', '==', user.email));
      const snapshot = await getDocs(q);

      const bookingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(bookingsList);
      if (bookingsList.length > 0) {
        setSelectedBooking(bookingsList[0]);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="grid md:grid-cols-[2fr_1fr] grid-cols-1 bg-[#fdf5e9] min-h-screen text-[#243a26]">
      {/* 📋 Bookings Table */}
      <section className="bg-[#f3dcb9] p-4 md:p-6 border-b md:border-r md:border-b-0 border-gray-300 overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-[#2e4a20]">📅 {t('yourBookings', 'Your Bookings')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-[#fffaf0] shadow rounded text-sm">
            <thead className="bg-[#eec890] text-[#2e4a20]">
              <tr>
                <th className="p-2 text-left">{t('date', 'Date')}</th>
                <th className="p-2 text-left">{t('time', 'Time')}</th>
                <th className="p-2 text-left">{t('sauna', 'Sauna')}</th>
                <th className="p-2 text-left">{t('spots', 'Spots')}</th>
                <th className="p-2 text-left">{t('status', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`cursor-pointer hover:bg-[#faebd7] ${selectedBooking?.id === booking.id ? 'bg-[#f9e2c5]' : ''}`}
                >
                  <td className="p-2">{booking.date}</td>
                  <td className="p-2">{booking.time}</td>
                  <td className="p-2">{booking.saunaTitle}</td>
                  <td className="p-2">{booking.spotsBooked}</td>
                  <td className="p-2 capitalize">{t(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 📄 Booking Detail Panel */}
      <section className="bg-[#f3dcb9] shadow-lg p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-300">
        {selectedBooking ? (
          <div className="border rounded bg-white p-4 space-y-2">
            <h3 className="text-lg font-bold mb-2 text-[#2e4a20]">📋 {t('bookingDetails', 'Booking Details')}</h3>
            <p><strong>{t('bookingId', 'Booking ID')}:</strong> {selectedBooking.bookingId || selectedBooking.id}</p>
            <p><strong>{t('date', 'Date')}:</strong> {selectedBooking.date}</p>
            <p><strong>{t('time', 'Time')}:</strong> {selectedBooking.time}</p>
            <p><strong>{t('sauna', 'Sauna')}:</strong> {selectedBooking.saunaTitle}</p>
            <p><strong>{t('name', 'Name')}:</strong> {selectedBooking.userName}</p>
            <p><strong>{t('email', 'Email')}:</strong> {selectedBooking.userEmail}</p>
            <p><strong>{t('contact', 'Contact')}:</strong> {selectedBooking.contact}</p>
            <p><strong>{t('spotsBooked', 'Spots Booked')}:</strong> {selectedBooking.spotsBooked}</p>
            <p><strong>{t('status', 'Status')}:</strong> {t(selectedBooking.status)}</p>
            <p><strong>{t('timezone', 'Timezone')}:</strong> {selectedBooking.timezone}</p>

            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-[#b67342] hover:bg-[#a16234] text-white px-3 py-2 mt-4 rounded w-full"
            >
              ✉️ {t('updateBooking', 'Update Booking')}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('selectBooking', 'Select a booking to see details.')}</p>
        )}
      </section>

      {/* 🔧 Update Booking Modal */}
      {selectedBooking && (
        <RequestAdminModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          booking={selectedBooking}
          ownerEmail={selectedBooking.saunaOwnerEmail}
        />
      )}
    </div>
  );
};

export default UserBookingsTable;
