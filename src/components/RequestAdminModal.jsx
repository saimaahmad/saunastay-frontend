import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const RequestAdminModal = ({ isOpen, onClose, booking, ownerEmail }) => {
  const [reason, setReason] = useState('');
  const { t } = useTranslation();

  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warn(t("RequestModal.enterReason"));
      return;
    }

    const req = {
      bookingId: booking.id,
      saunaId: booking.saunaId,
      saunaTitle: booking.saunaTitle,
      ownerEmail,
      customerName: booking.userName,
      customerEmail: booking.userEmail,
      contact: booking.contact,
      date: booking.date,
      time: booking.time,
      reason,
      status: "pending",
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, "adminRequests"), req);
      toast.success(t("RequestModal.success"));
      setReason('');
      onClose();
    } catch (err) {
      console.error("Failed to submit admin request", err);
      toast.error(t("RequestModal.error"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-[#f3dcb9] p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-[#243a26] mb-4">📤 {t("RequestModal.title")}</h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>{t("RequestModal.sauna")}:</strong> {booking.saunaTitle}</p>
          <p><strong>{t("RequestModal.date")}:</strong> {booking.date}</p>
          <p><strong>{t("RequestModal.time")}:</strong> {booking.time}</p>
          <p><strong>{t("RequestModal.customer")}:</strong> {booking.userName}</p>
          <p><strong>{t("RequestModal.status")}:</strong> {booking.status}</p>
        </div>

        <label className="block mt-4 text-sm font-semibold text-[#243a26]">{t("RequestModal.reasonLabel")}</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder={t("RequestModal.placeholder")}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            {t("RequestModal.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#b67342] text-white px-4 py-2 rounded hover:bg-[#a16234]"
          >
            {t("RequestModal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestAdminModal;
