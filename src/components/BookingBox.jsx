import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DayPicker } from 'react-day-picker';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'react-day-picker/dist/style.css';
import BookingConfirmationModal from './BookingConfirmationModal';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const BookingBox = ({
  saunaId,
  title,
  totalSpots,
  price,
  sessionDuration,
  openingTime,
  closingTime,
}) => {
  const { t } = useTranslation();

  // Move mobile dropdown states inside component
  const [mobileSelectedSlot, setMobileSelectedSlot] = useState('');
  const [mobileSelectedSpots, setMobileSelectedSpots] = useState('');

  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  const [user] = useAuthState(auth);
  const [showModal, setShowModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [saunaData, setSaunaData] = useState(null);
  const { i18n } = useTranslation();
const currentLang = i18n.language || 'en';


  useEffect(() => {
    const fetchSaunaData = async () => {
      if (!saunaId) return;
      const saunaRef = doc(db, 'saunas', saunaId);
      const saunaSnap = await getDoc(saunaRef);
      if (saunaSnap.exists()) {
        setSaunaData(saunaSnap.data());
      }
    };
    fetchSaunaData();
  }, [saunaId]);

  useEffect(() => {
    if (!openingTime || !closingTime || !sessionDuration) return;
    const generateTimeSlots = (start, end, duration) => {
      const slots = [];
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);

      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0);

      let current = new Date(startTime);
      while (true) {
        const slotEnd = new Date(current.getTime() + duration * 60000);

        if (slotEnd > endTime) break;

        const format = (d) =>
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        slots.push(`${format(current)} - ${format(slotEnd)}`);

        current.setHours(current.getHours() + 1);
        current.setMinutes(startMinute);
      }

      return slots;
    };

    const slots = generateTimeSlots(openingTime, closingTime, sessionDuration);
    setTimeSlots(slots);
  }, [openingTime, closingTime, sessionDuration]);

  // Declare fetchAvailabilityAndBookings outside useEffect for reuse
  const fetchAvailabilityAndBookings = async () => {
    if (!selectedDate || !saunaId || timeSlots.length === 0 || !saunaData) return;

    const dateStrAvailability = format(selectedDate, 'dd-MM-yyyy');
    const dateStrBookings = format(selectedDate, 'dd-MM-yyyy');

    console.log('Selected date (formatted):', dateStrAvailability);
    console.log('Time slots:', timeSlots);

    const availabilityQuery = query(
      collection(db, 'availability'),
      where('saunaId', '==', saunaId),
      where('date', '==', dateStrAvailability)
    );

    const availabilitySnap = await getDocs(availabilityQuery);

    const tempAvailabilityMap = {};

    availabilitySnap.forEach((doc) => {
      const data = doc.data();
      const slotTime = data.slot?.trim();

      console.log('Availability doc slotTime:', slotTime, 'spotsAvailable:', data.spotsAvailable);
      if (slotTime && timeSlots.includes(slotTime)) {
        tempAvailabilityMap[slotTime] = data.spotsAvailable;
      }
    });

    console.log('Temp availability map after fetching:', tempAvailabilityMap);

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('saunaId', '==', saunaId),
      where('date', '==', dateStrBookings)
    );
    const bookingsSnap = await getDocs(q);

    const bookedMap = {};
    bookingsSnap.forEach((doc) => {
      const booking = doc.data();
      const t = booking.time.trim();
      console.log('Booking doc time:', `"${t}"`, 'spotsBooked:', booking.spotsBooked);
      if (!bookedMap[t]) bookedMap[t] = 0;
      bookedMap[t] += booking.spotsBooked;
    });

    console.log('Booked map after fetching:', bookedMap);

    const finalMap = {};
    timeSlots.forEach((slot) => {
      const fallbackSpots = saunaData?.totalSpots ?? totalSpots;
      const availableInAvailability = tempAvailabilityMap[slot];
      const booked = bookedMap[slot] ?? 0;

      const availableSpots = (availableInAvailability !== undefined ? availableInAvailability : fallbackSpots) - booked;

      console.log(
        `Slot: "${slot}" | Available in availability: ${availableInAvailability} | Booked: ${booked} | Calculated available: ${availableSpots}`
      );

      finalMap[slot] = {
        availableSpots: Math.max(availableSpots, 0),
        isDefault: availableInAvailability === undefined,
      };
    });

    setAvailabilityMap(finalMap);
    console.log('Final availability map set:', finalMap);
  };

  useEffect(() => {
    fetchAvailabilityAndBookings();
  }, [selectedDate, saunaId, timeSlots, totalSpots, title, saunaData]);

  const handleBookingConfirmed = () => {
    fetchAvailabilityAndBookings(); // refresh availability/bookings
    setShowModal(false);
  };

  const handleSlotChange = (time, spots) => {
    setSelectedSlots((prev) => ({ ...prev, [time]: parseInt(spots) }));
  };

  const handleBooking = () => {
    if (!user) {
      toast.warning('Please log in to book a sauna.');
      return;
    }
    if (!selectedDate || !saunaId || timeSlots.length === 0) {
      toast.error('Please select a time and number of spots.');
      return;
    }

    const time = Object.keys(selectedSlots)[0];
    const spots = selectedSlots[time];

    const details = {
      sauna: {
        id: saunaId,
        title,
        location: saunaData?.location || 'N/A',
        totalSpots,
      },
      slot: {
        time,
        spotsBooked: 0,
      },
      date: selectedDate,
      spots,
    };

    setBookingDetails(details);
    setShowModal(true);
  };

  return (
    <div className="bg-[#f3dcb9] p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-serif mb-6 text-[#243a26]">{t.bookYourSauna}</h2>

      <div className="grid md:grid-cols-2 gap-2 mb-6">
        <div className="flex justify-center items-start">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={{ before: new Date() }}
            modifiersClassNames={{
              selected: 'bg-[#4d603e] text-white',
              today: 'text-[#b67342]',
            }}
            className="bg-[#f5efe6] p-4 rounded-xl border shadow-sm"
          />
        </div>

        <div className="text-[#243a26] space-y-4 text-sm font-medium bg-[#f5efe6] p-5 rounded-md shadow h-fit w-full">
          <p>
            ⏱ <strong>{t('sessionDuration')}:</strong> {sessionDuration} {t('minutes')}
          </p>
          <p>
            💶 <strong>{t('price')}:</strong> €{price} {t('perPerson')}
          </p>
          <p>
            🕗 <strong>{t('opensAt')}:</strong> {openingTime}
          </p>
          <p>
            🕙 <strong>{t('closesAt')}:</strong> {closingTime}
          </p>
          {saunaData?.timezone && (
            <p>
              🌍 <strong>{t('timezone')}:</strong> {saunaData.timezone}
            </p>
          )}
          {saunaData?.securityNote && (
            <p>
              🔒 <strong>{t('securityFeatures')}:</strong> {' '}
{saunaData?.[`securityNote_${currentLang}`] || saunaData?.securityNote_en || saunaData?.securityNote || ''}
            </p>
          )}
          
          {saunaData?.timezone && (
            <p className="text-xs italic text-gray-700">
              {t('allTimesNote')} ({saunaData.timezone}).
            </p>
          )}
        </div>
      </div>

      {selectedDate ? (
        <>
          {/* Mobile dropdowns for slot and spots */}
          <div className="md:hidden mb-6 p-4 bg-[#f5efe6] rounded-md shadow max-w-xs mx-auto space-y-4">
            <div>
              <label htmlFor="mobile-slot" className="block text-[#243a26] font-medium mb-1">
                {t('slot')}
              </label>
              <select
                id="mobile-slot"
                value={mobileSelectedSlot}
                onChange={(e) => {
                  setMobileSelectedSlot(e.target.value);
                  // Reset spots when slot changes
                  setMobileSelectedSpots('');
                }}
                className="w-full border p-2 rounded"
              >
                <option value="">{t('pleaseSelectDate')}</option>
                {timeSlots.map((slot) => {
                  const available = availabilityMap[slot]?.availableSpots ?? 0;
                  return (
                    <option key={slot} value={slot} disabled={available === 0}>
                      {slot} {available === 0 ? `(${t('full')})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="mobile-spots" className="block text-[#243a26] font-medium mb-1">
                {t('selectSpots')}
              </label>
              <select
                id="mobile-spots"
                value={mobileSelectedSpots}
                onChange={(e) => setMobileSelectedSpots(e.target.value)}
                className="w-full border p-2 rounded"
                disabled={!mobileSelectedSlot}
              >
                <option value="">{t('notAvailable')}</option>
                {mobileSelectedSlot &&
                  Array.from(
                    {
                      length: availabilityMap[mobileSelectedSlot]?.availableSpots ?? 0,
                    },
                    (_, i) => i + 1
                  ).map((spot) => (
                    <option key={spot} value={spot}>
                      {spot}
                    </option>
                  ))}
              </select>
            </div>

            <button
              disabled={!mobileSelectedSlot || !mobileSelectedSpots || mobileSelectedSpots === '0'}
              onClick={() => {
                if (!user) {
                  toast.warning(t('pleaseLogInToBook'));
                  return;
                }
                const details = {
                  sauna: {
                    id: saunaId,
                    title,
                    location: saunaData?.location || 'N/A',
                    totalSpots,
                  },
                  slot: {
                    time: mobileSelectedSlot,
                    spotsBooked: 0,
                  },
                  date: selectedDate,
                  spots: parseInt(mobileSelectedSpots, 10),
                };
                setBookingDetails(details);
                setShowModal(true);
              }}
              className={`w-full py-2 rounded text-white font-semibold transition ${
                !mobileSelectedSlot || !mobileSelectedSpots || mobileSelectedSpots === '0'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#b89a72] hover:bg-[#997f58]'
              }`}
            >
              {t('bookNow')}
            </button>
          </div>

          {/* Desktop/tablet table (hidden on mobile) */}
          <table className="w-full border-collapse border border-[#ddd] bg-[#f5efe6] shadow-sm rounded-lg hidden md:table">
            <thead>
              <tr className="bg-[#d4bca2] text-white">
                <th className="border border-[#ddd] px-4 py-2 text-left">{t('slot')}</th>
                <th className="border border-[#ddd] px-4 py-2 text-left">{t('sessionDurationMin')}</th>
                <th className="border border-[#ddd] px-4 py-2 text-left">{t('totalSpots')}</th>
                <th className="border border-[#ddd] px-4 py-2 text-left">{t('spotsAvailable')}</th>
                <th className="border border-[#ddd] px-4 py-2 text-left">{t('selectSpots')}</th>
                <th className="border border-[#ddd] px-4 py-2 text-left">{t('bookNow')}</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => {
                const total = saunaData?.totalSpots ?? totalSpots;
                const available = availabilityMap[time]?.availableSpots ?? 0;
                const spotsSelected = selectedSlots[time] || 0;

                return (
                  <tr key={time} className="even:bg-white odd:bg-[#faf9f6]">
                    <td className="border border-[#ddd] px-4 py-2 font-semibold text-[#243a26]">{time}</td>
                    <td className="border border-[#ddd] px-4 py-2 text-[#243a26] font-medium">
                      {sessionDuration} {t('minutes')}
                    </td>
                    <td className="border border-[#ddd] px-4 py-2">{total}</td>
                    <td className="border border-[#ddd] px-4 py-2">
                      {available > 0 ? (
                        <span className="text-[#243a26] font-medium">{available}</span>
                      ) : (
                        <span className="text-gray-400">{t.full}</span>
                      )}
                    </td>
                    <td className="border border-[#ddd] px-4 py-2">
                      {available > 0 ? (
                        <select
                          value={selectedSlots[time] || ''}
                          onChange={(e) => handleSlotChange(time, e.target.value)}
                          className="border p-1 rounded text-sm"
                        >
                          <option value="">{t.notAvailable}</option>
                          {Array.from({ length: available }, (_, i) => available - i).map((spot) => (
                            <option key={spot} value={spot}>
                              {spot}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 text-sm">{t.full}</span>
                      )}
                    </td>
                    <td className="border border-[#ddd] px-4 py-2">
                      <button
                        disabled={available === 0 || spotsSelected === 0}
                        onClick={() => {
                          if (!user) {
                            toast.warning('Please log in to book a sauna.');
                            return;
                          }
                          if (spotsSelected === 0) {
                            toast.warning('Please select spots before booking.');
                            return;
                          }
                          const details = {
                            sauna: {
                              id: saunaId,
                              title,
                              location: saunaData?.location || 'N/A',
                              totalSpots,
                            },
                            slot: {
                              time,
                              spotsBooked: 0,
                            },
                            date: selectedDate,
                            spots: spotsSelected,
                          };
                          setBookingDetails(details);
                          setShowModal(true);
                        }}
                        className={`px-3 py-1 rounded text-white font-semibold transition ${
                          available === 0 || spotsSelected === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#b89a72] hover:bg-[#997f58]'
                        }`}
                      >
                        {t('bookNow')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-sm text-gray-600">{t.pleaseSelectDate}</p>
      )}

      {showModal && bookingDetails && (
        <BookingConfirmationModal
          sauna={bookingDetails.sauna}
          slot={bookingDetails.slot}
          date={bookingDetails.date}
          spots={bookingDetails.spots}
          onClose={() => setShowModal(false)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}
    </div>
  );
};

export default BookingBox;
