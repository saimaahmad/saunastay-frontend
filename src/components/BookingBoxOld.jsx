// src/components/BookingBox.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BookingConfirmationModal from './BookingConfirmationModal';

const BookingBox = () => {
  const { id: saunaId } = useParams();
  const [sauna, setSauna] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchSauna = async () => {
      const saunaRef = doc(db, 'saunas', saunaId);
      const saunaSnap = await getDoc(saunaRef);
      if (saunaSnap.exists()) {
        setSauna({ id: saunaId, ...saunaSnap.data() });
      }
    };
    fetchSauna();
  }, [saunaId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!sauna?.['sauna-id']) return;
      const snapshot = await getDocs(collection(db, 'availability'));
      const all = snapshot.docs.map(doc => doc.data());
      const filtered = all.filter(item => item['sauna-id'] === sauna['sauna-id']);
      setAvailabilityData(filtered);

      if (filtered.length > 0) {
        const firstDate = new Date(filtered[0].date);
        setSelectedDate(firstDate);
        setAvailableSlots(filtered[0].slots || []);
      }
    };
    if (sauna) fetchAvailability();
  }, [sauna]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const found = availabilityData.find((a) => a.date === dateStr);
    setAvailableSlots(found?.slots || []);
  };

  const highlightDates = availabilityData.map((a) => new Date(a.date));

  return (
    <div className="bg-[#fffaf1] p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#363025]">📅 Book Your Sauna</h2>

      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        highlightDates={highlightDates}
        placeholderText="Select an available date"
        minDate={new Date()}
        showMonthDropdown
        showYearDropdown
        scrollableMonthYearDropdown
        className="w-full px-4 py-2 border border-gray-400 rounded mb-4"
        calendarClassName="p-3 shadow-xl rounded"
      />

      {selectedDate && (
        <>
          <h3 className="text-lg font-semibold text-[#363025] mb-2">
            Time Slots for {selectedDate.toDateString()}:
          </h3>
          {availableSlots.length > 0 ? (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-[#d6c092] text-[#243a26]">
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Spots Booked</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {availableSlots.map((slot, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{slot.time}</td>
                    <td className="p-2 border">{slot.spotsBooked}</td>
                    <td className="p-2 border text-green-700 font-semibold">{slot.status}</td>
                    <td className="p-2 border">
                      {slot.status === 'Available' ? (
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setModalOpen(true);
                          }}
                          className="bg-[#4d603e] text-white px-3 py-1 rounded hover:bg-[#3c4f30]"
                        >
                          Book Now
                        </button>
                      ) : (
                        <span className="text-gray-400">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No slots available for this date.</p>
          )}
        </>
      )}

      {modalOpen && selectedSlot && sauna && (
        <BookingConfirmationModal
          sauna={sauna}
          slot={selectedSlot}
          date={selectedDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BookingBox;
