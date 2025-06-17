import React from 'react';

const UpdateAvailabilityModal = ({ isOpen, onClose, saunaName, date, slot, spots }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-updated-title"
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
    >
      <div className="bg-[#f3dcb9] p-6 rounded-lg shadow-md w-[360px]">
        <h2 id="availability-updated-title" className="text-lg font-bold text-[#243a26] mb-4">
          ✅ Availability Updated
        </h2>
        <p className="mb-2"><strong>Sauna:</strong> {saunaName || '—'}</p>
        <p className="mb-2"><strong>Date:</strong> {date || '—'}</p>
        <p className="mb-2">
          <strong>Slot:</strong> {slot || '—'}
        </p>
        <p className="mb-2"><strong>Spots Available:</strong> {spots}</p>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-[#4d603e] hover:bg-[#3d4e2e] text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateAvailabilityModal;
