import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BookingPaymentPage from './BookingPaymentPage';

const PaymentCancelledPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const bookingId = new URLSearchParams(useLocation().search).get('bookingId');

  useEffect(() => {
    if (!bookingId) return navigate('/');
    // Mark the booking as cancelled in Firestore:
    updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' })
      .catch(err => console.error(err));
    toast.info(t('paymentCancelledNotice'));
  }, [bookingId, navigate, t]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold mb-4">{t('paymentCancelled')}</h1>
      <p className="mb-6">{t('paymentCancelledDesc')}</p>
      <button
        onClick={() => navigate(`/booking-payment/${bookingId}`)}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        {t('retryPayment')}
      </button>
    </div>
  );
};

export default PaymentCancelledPage;
