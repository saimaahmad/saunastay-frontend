import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import RequestAdminModal from '../components/RequestAdminModal';
import { useTranslation } from 'react-i18next';

const ManageBookingsOwner = () => {
  const [ownerEmail, setOwnerEmail] = useState('');
  const [saunas, setSaunas] = useState([]);
  const [selectedSauna, setSelectedSauna] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setOwnerEmail(user.email);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ownerEmail) return;

    (async () => {
      const saunaSnap = await getDocs(collection(db, 'saunas'));
      const ownedSaunas = saunaSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.ownerEmail === ownerEmail);

      setSaunas(ownedSaunas);
      if (ownedSaunas.length > 0) setSelectedSauna(ownedSaunas[0]);
    })();
  }, [ownerEmail]);

  useEffect(() => {
    if (!selectedSauna?.id) return;

    const fetchBookings = async () => {
      try {
        const bookingsSnap = await getDocs(
          query(collection(db, 'bookings'), where('saunaId', '==', selectedSauna.id))
        );

        const bookingsList = bookingsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setBookings(bookingsList);
        if (bookingsList.length > 0) setSelectedBooking(bookingsList[0]);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, [selectedSauna]);

  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-');
    const isoFormat = `${year}-${month}-${day}`;
    const date = new Date(isoFormat);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="bg-[#f5efe6] min-h-screen p-4 md:p-6 font-serif">
      <h1 className="text-xl md:text-2xl font-bold text-[#243a26] mb-4 md:mb-6">📖 {t('manageBookings')}</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* 🧖 Saunas Sidebar + Booking Detail */}
        <div className="w-full md:w-[320px] bg-[#f3dcb9] rounded-lg p-4 shadow-sm">
          <div className="border border-[#d3b892] rounded mb-4">
            <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🧖 {t('YourSaunas')}</div>
            <div className="p-3 max-h-[260px] overflow-y-auto">
              {saunas.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSauna(s);
                    setSelectedBooking(null);
                  }}
                  className={`cursor-pointer p-2 mb-2 rounded border ${
                    selectedSauna?.id === s.id
                      ? 'bg-[#ebbd83] border-[#b67342] font-semibold shadow-md'
                      : 'hover:bg-[#e5cdac] border-[#e4c497]'
                  }`}
                >
                  <div>{s.title}</div>
                  <div className="text-xs text-gray-600">{s.city}, {s.country}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedBooking && (
            <div className="border border-[#d3b892] rounded">
              <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🔍 {t('BookingDetails')}</div>
              <div className="p-3 text-sm text-gray-800 space-y-2">
                <p><strong>📅 {t('Date')}:</strong> {selectedBooking.date}</p>
                <p><strong>🕒 {t('Time')}:</strong> {selectedBooking.time}</p>
                <p><strong>👤 {t('customer')}:</strong> {selectedBooking.userName}</p>
                <p><strong>📞 {t('contact')}:</strong> {selectedBooking.contact}</p>
                <p><strong>👥 {t('spotsBooked')}:</strong> {selectedBooking.spotsBooked}</p>
                <p><strong>{t('status')}:</strong> {selectedBooking.status}</p>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-[#b67342] hover:bg-[#a16234] text-white px-3 py-2 mt-4 rounded w-full"
              >
                ✉️ {t('updateBooking')}
              </button>
            </div>
          )}
        </div>

        {/* 📋 Bookings Table */}
        <div className="flex-1 bg-[#f3dcb9] rounded-lg shadow-sm p-4">
  <h2 className="text-lg md:text-xl font-semibold text-[#243a26] mb-4">📅 {t('BookingsTable')}</h2>
  {bookings.length === 0 ? (
    <p className="text-gray-600">{t('NoBookingsFound')}</p>
  ) : (
    <div className="overflow-x-auto w-full">
      {/* Conditional rendering to ensure only one layout shows at a time */}
      <>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full border border-[#d3b892] bg-white rounded-lg text-sm">
            <thead className="bg-[#ebbd83] text-[#243a26]">
              <tr>
                <th className="px-4 py-2 text-left">📅 {t('Date')}</th>
                <th className="px-4 py-2 text-left">🕒 {t('Time')}</th>
                <th className="px-4 py-2 text-left">👤 {t('Customer')}</th>
                <th className="px-4 py-2 text-left">👥 {t('Spots')}</th>
                <th className="px-4 py-2 text-left">{t('Status')}</th>
                <th className="px-4 py-2 text-left">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className={`border-t border-[#e4c497] hover:bg-[#f8ecd9] ${
                    selectedBooking?.id === b.id ? 'bg-[#fce9cc]' : ''
                  } cursor-pointer`}
                  onClick={() => setSelectedBooking(b)}
                >
                  <td className="px-4 py-2">{formatDate(b.date)}</td>
                  <td className="px-4 py-2">{b.time}</td>
                  <td className="px-4 py-2">{b.userName}</td>
                  <td className="px-4 py-2">{b.spotsBooked}</td>
                  <td className="px-4 py-2">{b.status}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-[#b67342] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(b);
                        setShowRequestModal(true);
                      }}
                    >
                      ✏️ {t('ViewUpdate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card layout */}
        <div className="block md:hidden space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className={`border border-[#d3b892] rounded p-3 bg-white shadow-sm ${
                selectedBooking?.id === b.id ? 'bg-[#fce9cc]' : ''
              }`}
              onClick={() => setSelectedBooking(b)}
            >
              <p className="text-sm"><strong>📅 {t('Date')}:</strong> {formatDate(b.date)}</p>
              <p className="text-sm"><strong>🕒 {t('Time')}:</strong> {b.time}</p>
              <p className="text-sm"><strong>👤 {t('Customer')}:</strong> {b.userName}</p>
              <p className="text-sm"><strong>👥 {t('Spots')}:</strong> {b.spotsBooked}</p>
              <p className="text-sm"><strong>{t('Status')}:</strong> {b.status}</p>
              <button
                className="mt-2 text-[#b67342] hover:underline text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBooking(b);
                  setShowRequestModal(true);
                }}
              >
                ✏️ {t('ViewUpdate')}
              </button>
            </div>
          ))}
        </div>
      </>
    </div>
  )}
</div>

<RequestAdminModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          booking={selectedBooking}
          ownerEmail={ownerEmail}
        />
      </div>
    </div>
  );
};

export default ManageBookingsOwner;
