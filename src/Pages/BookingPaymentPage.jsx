import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }           from 'react-router-dom';
import { doc, getDoc} from 'firebase/firestore';
import { db, auth}               from '../firebase';
import { useAuthState }                      from 'react-firebase-hooks/auth';
import { toast }                             from 'react-toastify';
import { useTranslation }                    from 'react-i18next';
import { httpsCallable } from "firebase/functions";
import { functions }     from "../firebase";

const BookingPaymentPage = () => {
  const { i18n } = useTranslation();

  const { t } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [currentUser, loadingUser] = useAuthState(auth);
  const [booking, setBooking]         = useState(null);
  const [sauna, setSauna]             = useState(null);
  const [contact, setContact]         = useState('');
  const [address, setAddress]         = useState('');
    const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch booking & sauna
  useEffect(() => {
    async function fetchData() {
      try {
        const bSnap = await getDoc(doc(db, 'bookings', bookingId));
        if (!bSnap.exists()) {
          toast.error(t('bookingNotFound'));
          return navigate('/');
        }
        const b = bSnap.data();
        setBooking(b);

        const sSnap = await getDoc(doc(db, 'saunas', b.saunaId));
        if (!sSnap.exists()) {
          toast.error(t('saunaNotFound'));
        } else {
          setSauna({ id: sSnap.id, ...sSnap.data() });
        }
      } catch {
        toast.error(t('loadFailure'));
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [bookingId, navigate, t]);

  // Check if already paid
  useEffect(() => {
    async function checkPayment() {
      const pSnap = await getDoc(doc(db, 'payment', bookingId));
      if (pSnap.exists()) {
        setAlreadyPaid(true);
        navigate('/thank-you');
      }
    }
    checkPayment();
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    if (!contact || !address) {
      toast.error(t('enterContactAddress'));
      return;
    }
    if (!booking || !sauna || !currentUser) {
      toast.error(t('stillLoading'));
      return;
    }
      const totalAmount = booking.spotsBooked * sauna.price;
  const selectedLang = i18n.language || 'auto';
     // 1) mark booking pending and get a Stripe Checkout URL
  const base = window.location.origin;
  const { data } = await httpsCallable(
    functions,
    "createCheckoutSession"
  )({
    bookingId:    bookingId,
    customerEmail: currentUser.email,
     saunaId: sauna.id,
    saunaOwnerEmail: sauna.ownerEmail,
    saunaName: sauna.title,
     language: selectedLang,
    amount: totalAmount, // ✅ Use this
    description: `Booking for ${sauna.title} on ${booking.date} at ${booking.time}`,
    successUrl:   `${base}/thank-you?bookingId=${bookingId}`,
    cancelUrl:    `${base}/payment-cancelled?bookingId=${bookingId}`,
    
      });

      console.log('➡️ Redirecting to Stripe Checkout:', data.url);
  // redirect to Stripe
  window.location.href = data.url;
}
    if (loadingData || !booking || !sauna || !currentUser) {
    return (
      <p className="text-center py-10">
        {t('loadingBooking')}
      </p>
    );
  }

  const totalPrice = sauna.price * booking.spotsBooked;
  
  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
        {/* Booking Summary */}
        <section className="rounded-xl md:rounded-l-xl md:rounded-r-none bg-[#f3dcb9] shadow-lg p-8 border">
          <h2 className="text-2xl font-serif mb-4 text-[#2e4a20] border-b pb-2">
            {t('bookingSummary')}
          </h2>
        <p className="mb-2"><strong>{t('sauna')}:</strong> {sauna.title}</p>
<p className="mb-2"><strong>{t('address')}:</strong> {sauna.city}</p>
<p className="mb-2"><strong>{t('bookingId')}:</strong> {bookingId}</p>
<p className="mb-2"><strong>{t('bookingDate')}:</strong> {booking.date}</p>
<p className="mb-2"><strong>{t('bookingSlot')}:</strong> {booking.time} ({sauna.timezone})</p>
<p className="mb-2"><strong>{t('spotsBooked')}:</strong> {booking.spotsBooked}</p>
<p className="mb-2"><strong>{t('sessionPrice')}:</strong> €{sauna.price}</p>
<p className="mb-2"><strong>{t('totalCost')}:</strong> €{totalPrice}</p>

          <hr className="my-4" />
          <h3 className="font-semibold">{t('description')}</h3>
          <p className="text-sm">{sauna.description}</p>
         
        </section>

        {/* Your Details & Payment */}
        <section className="rounded-xl md:rounded-r-xl md:rounded-l-none bg-[#f3dcb9] shadow-lg p-8 border">
          <h2 className="text-2xl font-serif mb-4 text-[#2e4a20] border-b pb-2">
            {t('yourDetailsPayment')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">{t('name')}</label>
              <input
                type="text"
                value={currentUser.displayName || ''}
                disabled
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('email')}</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('contactNumberMust')}</label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-[#f4e2cb]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('addressField')}</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-[#f4e2cb]"
              />
            </div>
           
            <p className="text-xs text-gray-500">{t('terms')}</p>
            <button
              disabled={alreadyPaid}
              onClick={handlePayment}
              className={`w-full mt-2 bg-[#eec890] font-bold p-2 rounded hover:bg-[#d4a268]
                ${alreadyPaid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {alreadyPaid ? t('alreadyPaid') : t('confirmPay')}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BookingPaymentPage;
