import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import dayjs from 'dayjs';

const UserBookingsCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);


  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn('No user logged in');
        return;
      }

      console.log('Fetching bookings for user:', user.email);
      const q = query(collection(db, 'bookings'), where('userEmail', '==', user.email));
      const snapshot = await getDocs(q);

      const bookingsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Raw booking doc:', doc.id, data);
        return {
          id: doc.id,
          ...data,
        };
      });

      setBookings(bookingsList);
      if (bookingsList.length > 0) {
        setSelectedBooking(bookingsList[0]);
      }
    };

    fetchBookings();
  }, []);

 
  return (
    <div className="grid grid-cols-[2fr_1fr] bg-[#fdf5e9] min-h-screen text-[#243a26]">
     <section className="bg-[#f3dcb9] p-6 border-r border-gray-300 overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-[#2e4a20]">📅 Your Bookings</h2>
        <table className="min-w-full border bg-white shadow rounded text-sm">
          <thead className="bg-[#eec890] text-[#2e4a20]">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Sauna</th>
              <th className="p-2 text-left">Spots</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`cursor-pointer hover:bg-[#faebd7] ${
                  selectedBooking?.id === booking.id ? 'bg-[#f9e2c5]' : ''
                }`}
              >
                <td className="p-2">{booking.date}</td>
                <td className="p-2">{booking.time}</td>
                <td className="p-2">{booking.saunaTitle}</td>
                <td className="p-2">{booking.spotsBooked}</td>
                <td className="p-2 capitalize">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {/* 🧾 Booking Details */}
      <section className="bg-[#f3dcb9] shadow-lg p-6 border-l border-gray-200">
        {selectedBooking ? (
          <div className="border rounded bg-white p-4">
            <h3 className="text-lg font-bold mb-2 text-[#2e4a20]">📋 Booking Details</h3>
            <div className="text-sm space-y-1">
              <p><strong>Booking ID:</strong> {selectedBooking.bookingId || selectedBooking.id}</p>
              <p><strong>📅 Date:</strong> {selectedBooking.date}</p>
              <p><strong>🕒 Time:</strong> {selectedBooking.time}</p>
              <p><strong>🧖 Sauna:</strong> {selectedBooking.saunaTitle}</p>
              <p><strong>👤 Name:</strong> {selectedBooking.userName}</p>
              <p><strong>📧 Email:</strong> {selectedBooking.userEmail}</p>
              <p><strong>📞 Contact:</strong> {selectedBooking.contact}</p>
              <p><strong>👥 Spots Booked:</strong> {selectedBooking.spotsBooked}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>🌍 Timezone:</strong> {selectedBooking.timezone}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a booking from the calendar to view details.</p>
        )}
      </section>
    </div>
  );
};

export default UserBookingsCalendar;
