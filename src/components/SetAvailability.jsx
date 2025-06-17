// src/components/SetAvailability.jsx
import React, { useState, useEffect } from 'react';

const defaultSlots = [
  '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'
];

const SetAvailability = ({ embedded, availability, setAvailability }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (selectAll) {
      const today = new Date();
      const next7 = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date.toISOString().split('T')[0];
      });
      const newAvailability = next7.map(date => ({
        date,
        slots: defaultSlots.map(time => ({
          time,
          status: 'Available',
          spotsBooked: 0,
        }))
      }));
      setAvailability(newAvailability);
    }
  }, [selectAll]);

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    if (selectedDates.includes(dateStr)) return;
    const newEntry = {
      date: dateStr,
      slots: defaultSlots.map(time => ({
        time,
        status: 'Available',
        spotsBooked: 0,
      }))
    };
    setAvailability([...availability, newEntry]);
    setSelectedDates([...selectedDates, dateStr]);
  };

  return (
    <div className="space-y-3">
      <input
        type="date"
        className="border p-2 rounded"
        onChange={handleDateChange}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => setSelectAll(e.target.checked)}
        />
        <label className="text-sm text-gray-700">Select All Slots for Next 7 Days</label>
      </div>

      {availability.length > 0 && (
        <div className="mt-4 bg-[#fffaf1] border rounded p-3">
          <h4 className="font-semibold text-[#243a26] mb-2">Availability Summary:</h4>
          {availability.map((a, index) => (
            <div key={index} className="mb-2 text-sm">
              <strong>{a.date}:</strong> {a.slots.length} slots selected
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetAvailability;
