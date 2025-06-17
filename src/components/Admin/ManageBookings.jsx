// ManageBookings.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      const snap = await getDocs(collection(db, 'bookings'));
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchBookings();
  }, []);

  const handleUpdate = async () => {
    if (!selectedBooking) return;
    const bookingRef = doc(db, 'bookings', selectedBooking.id);
    await updateDoc(bookingRef, selectedBooking);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    await deleteDoc(doc(db, 'bookings', selectedBooking.id));
    setBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#edc8a3] min-h-screen p-6 text-[#243a26]">
      <h2 className="text-2xl font-serif mb-6">Manage Bookings</h2>

      <table className="w-full bg-[#f5efe6] rounded shadow">
        <thead className="bg-[#caa26a] text-white text-left">
          <tr>
            <th className="px-4 py-2">Booking ID</th>
      
            <th className="px-4 py-2">Sauna</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id} className="border-b border-[#e4c497]">
              <td className="px-4 py-2">{booking.bookingId}</td>
                          <td className="px-4 py-2">{booking.saunaTitle}</td>
              <td className="px-4 py-2">{booking.date}</td>
              <td className="px-4 py-2">{booking.status}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setIsModalOpen(true);
                  }}
                  className="text-[#b67342] hover:underline"
                >
                  ✏️ View / Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-[#edc8a3] p-6 rounded-lg w-[500px] space-y-4 text-[#243a26] overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold">Edit Booking</h3>
            {Object.entries(selectedBooking).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{key}</label>
                <input
                  value={value}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, [key]: e.target.value })}
                  className="w-full border px-3 py-2 rounded text-sm"
                  disabled={key === 'id'}
                />
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleUpdate}
                className="bg-orange-300 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-sm mt-4 underline text-center w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
