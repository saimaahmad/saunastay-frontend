import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const ThankYouPage = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');
  const [status, setStatus] = useState('processing');
  const [booking, setBooking] = useState(null);
  const [sauna, setSauna] = useState(null);
  const [totalPaid, setTotalPaid] = useState(null);

  useEffect(() => {
    const savePaymentManually = async () => {
      if (!bookingId) return;

      try {
        // 1. Check if payment already exists
        const paymentRef = doc(db, 'payment', bookingId);
        const paymentSnap = await getDoc(paymentRef);
        if (paymentSnap.exists()) {
          setStatus('already saved');
        } else {
          // 2. Get booking data
          const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
          if (!bookingSnap.exists()) {
            setStatus('booking not found');
            return;
          }
          const bookingData = bookingSnap.data();

          // 3. Get sauna data
          const saunaSnap = await getDoc(doc(db, 'saunas', bookingData.saunaId));
          if (!saunaSnap.exists()) {
            setStatus('sauna not found');
            return;
          }
          const saunaData = saunaSnap.data();

          const amountPaid = bookingData.spotsBooked * saunaData.price;

          // 4. Save payment manually
          await setDoc(paymentRef, {
            bookingId,
            saunaId: bookingData.saunaId,
            saunaOwnerEmail: saunaData.ownerEmail,
            customerEmail: bookingData.userEmail,
            amountPaid,
            saunaRevenue: amountPaid,
            method: 'manual',
            status: 'paid',
            timestamp: new Date(),
          });

          // 5. Update booking status
          await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'confirmed',
          });

          setStatus('saved');
          setTotalPaid(amountPaid);
          setBooking(bookingData);
          setSauna(saunaData);
        }

        // Even if already saved, fetch booking + sauna for display
        if (status === 'already saved') {
          const bookingSnap = await getDoc(doc(db, 'bookings', bookingId));
          const saunaSnap = await getDoc(doc(db, 'saunas', bookingSnap.data().saunaId));
          setBooking(bookingSnap.data());
          setSauna(saunaSnap.data());
          setTotalPaid(bookingSnap.data().spotsBooked * saunaSnap.data().price);
        }
      } catch (err) {
        console.error('❌ Error saving payment manually:', err);
        setStatus('error');
      }
    };

    savePaymentManually();
  }, [bookingId]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-6">
       <h1 className="text-2xl font-bold">{t('thankYou.title')}</h1>
<p className="mt-2">
  {t('thankYou.bookingId')}: <strong>{bookingId}</strong>
</p>
{status === 'processing' && <p>{t('thankYou.processing')}</p>}
{status === 'saved' && <p className="text-green-600">{t('thankYou.saved')}</p>}
{status === 'already saved' && <p className="text-blue-600">{t('thankYou.alreadySaved')}</p>}
{status === 'error' && <p className="text-red-500">{t('thankYou.error')}</p>}

      </div>

      {(status === 'saved' || status === 'already saved') && booking && sauna && (
        <>
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
                <strong>📍 {t('locationT', 'Location')}:</strong> {sauna.city}
              </li>
              <li>
                <strong>📆 {t('date', 'Date')}:</strong> {booking.date}
              </li>
              <li>
                <strong>🕒 {t('time', 'Time')}:</strong> {booking.time} ({sauna.timezone})
              </li>
              <li>
                <strong>👥 {t('spotsH', 'Spots')}:</strong> {booking.spotsBooked}
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

        </>
      )}
    </div>
  );
};

export default ThankYouPage;
