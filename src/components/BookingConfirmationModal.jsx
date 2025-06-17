import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDoc, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';

const BookingConfirmationModal = ({ sauna, slot, date, spots, onClose, onBookingConfirmed }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    spots: spots || 1,
    
  });
  const [user] = useAuthState(auth);
  const [confirmation, setConfirmation] = useState('');
  const totalSpots = sauna.totalSpots || 0;
  const time = slot.time;
 const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;
      try {
        const userDocRef = doc(db, 'users', user.email);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            email: user.email,
            contact: userData.contact || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
      setIsSubmitting(true);
    try {
      
      const dateStr = format(date, 'dd-MM-yyyy');
      const randomPart = uuidv4().slice(0, 4).toUpperCase();
      const bookingId = `SS-${dateStr}-${randomPart}`;
      const bookingData = {
        bookingId,
        saunaId: sauna.id,
        saunaTitle: sauna.title,
        userName: formData.name,
        userEmail: formData.email,
        contact: formData.contact,
        date: dateStr,
        time,
        spotsBooked: formData.spots,
        status: 'pending',
         pendingAt:    Timestamp.now(),
        createdAt: new Date(),
        timezone: sauna.timezone || 'Europe/Helsinki',
     


        
      };

      const bookingRef = doc(db, 'bookings', bookingId);
      await setDoc(bookingRef, bookingData);

      // Update availability
      const availDocRef = doc(db, 'availability', `${sauna.id}_${dateStr}`);
      const availSnap = await getDoc(availDocRef);

      if (availSnap.exists()) {
        const data = availSnap.data();
        const updatedSlots = data.slots.map(s =>
          s.time === time
            ? { ...s, spotsAvailable: Math.max(s.spotsAvailable - formData.spots, 0) }
            : s
        );
        await updateDoc(availDocRef, { slots: updatedSlots });
      }

      onBookingConfirmed();
      navigate(`/booking-payment/${bookingId}`);
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error(t('bookingFailed'));
    }
    finally {
      
  setIsSubmitting(false);
       }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 px-4">
      <div className="bg-[#f3dcb9] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-2 text-[#243a26]">{t('confirmBooking')}</h2>
        <p className="text-sm text-gray-600 mb-2">📍 {sauna.title} — {sauna.location}</p>
        <p className="text-sm text-gray-600 mb-4">🕒 {date.toDateString()} {t('at')} {time}</p>

      
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder={t('yourName', 'Your Name')}
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              required
              placeholder={t('yourEmail', 'Your Email')}
              className="w-full border p-2 rounded"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled
            />
            <input
              type="text"
              required
              placeholder={t('contactNumber', 'Contact Number')}
              className="w-full border p-2 rounded"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
            <input
              type="text"
              readOnly
              placeholder={t('spotsBooked', 'Spots Booked')}
              className="w-full border p-2 rounded bg-gray-100 text-gray-700"
              value={`${formData.spots} ${formData.spots > 1 ? t('spots') : t('spot')}`}
            />

            <button
              type="submit"
               disabled={isSubmitting}
              className={`w-full bg-[#4d603e] text-white p-2 rounded hover:bg-[#3c4f30]   ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}

            >
               {isSubmitting ? t('loading') : t('confirmBookingBtn')}
            </button>
          </form>
      
    <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-700 hover:underline"
          disabled={isSubmitting}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
