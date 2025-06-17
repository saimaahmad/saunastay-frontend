  import React, { useEffect, useState, useRef } from 'react';
  import { toast, ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { format, addMinutes, setHours, setMinutes, isBefore } from 'date-fns';
  import FullCalendar from '@fullcalendar/react';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import interactionPlugin from '@fullcalendar/interaction';
 import { db, auth } from '../firebase';
  import { onAuthStateChanged } from 'firebase/auth';
import {  collection, query, where, getDocs , doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore"; // Make sure this is also imported
import { useTranslation } from 'react-i18next';






const formatDate = (isoStr)   => new Date(isoStr).toLocaleDateString('en-GB').split('/').join('-');



  const formatTime = (hhmm) => {
    const [h, m] = hhmm.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  };



  const ManageAvailability = () => {
    const [ownerEmail, setOwnerEmail] = useState('');
    const [saunas, setSaunas] = useState([]);
    const [selectedSauna, setSelectedSauna] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editSpots, setEditSpots] = useState(null);
    const [highlightedSlotId, setHighlightedSlotId] = useState(null);
  const calendarRef = useRef(null);
const [availabilityData, setAvailabilityData] = useState([]);
const { t } = useTranslation();

  const [viewType, setViewType] = useState('dayGridMonth');



// Example: on slot click, set selected slot

  function to24Hour(time12h) {
    const [time, modifier] = [time12h.slice(0,5), time12h.slice(5).toUpperCase()];
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

useEffect(() => {
  console.log('Events updated:', events);
}, [events]);
  
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) setOwnerEmail(user.email);
      });
      return () => unsub();
    }, []);

    useEffect(() => {

      if (!ownerEmail) return;
      console.log('Fetching saunas for owner:', ownerEmail);

      (async () => {
        const snap = await getDocs(collection(db, 'saunas'));
        const owned = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((s) => s.ownerEmail === ownerEmail);
        setSaunas(owned);
        if (owned.length > 0) setSelectedSauna(owned[0]);
      })();
    }, [ownerEmail]);

    useEffect(() => {
      if (!selectedSauna) return;

        // Clear previous sauna's events before loading new ones
  setEvents([]);

      generateEventsForSauna(selectedSauna);
    }, [selectedSauna]);

    const handleSpotsChange = (eventId, value) => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                extendedProps: {
                  ...ev.extendedProps,
                  spotsAvailable: parseInt(value),
                },
              }
            : ev
        )
      );
    };
    




const generateEventsForSauna = async (sauna) => {
  const opening = sauna.openingTime || '08:00';
  const closing = sauna.closingTime || '17:00';
  const totalSpots = sauna.totalSpots || 10;
  const sessionDuration = sauna.sessionDuration || 60;

  // 1. Fetch availability data
  const availabilitySnap = await getDocs(
    query(collection(db, 'availability'), where('saunaId', '==', sauna.id))
       
  );
  
console.log("➡️ Fetching availability for saunaId:", sauna.id);
console.log("Availability docs:", availabilitySnap.docs.length);

  const availabilityMap = {};
  availabilitySnap.docs.forEach(doc => {
    const data = doc.data();
    availabilityMap[`${data.date}_${data.slot}`] = data.spotsAvailable;
  });

  // 2. Fetch bookings
  const bookingSnap = await getDocs(
    query(collection(db, 'bookings'), where('saunaId', '==', sauna.id), where('status', '==', 'confirmed'))
  );
  console.log("➡️ Fetching bookings for saunaId:", sauna.id);
console.log("Booking docs:", bookingSnap.docs.length);

  const bookingMap = {};
  bookingSnap.docs.forEach(doc => {
    const data = doc.data();
    const key = `${data.date}_${data.time}`;
    bookingMap[key] = (bookingMap[key] || 0) + data.spotsBooked;
  });

  // 3. Generate events for 360 days
  const today = new Date();
  const end = new Date();
  end.setDate(today.getDate() + 360);
  let current = new Date(today);

  const eventsArray = [];

  while (current <= end) {
    const dateISO = current.toISOString().split('T')[0];
    const dateFormatted = formatDate(dateISO); // DD-MM-YYYY

    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);

    let slot = new Date(dateISO);
    slot.setHours(openH, openM, 0, 0);

    const endSlot = new Date(dateISO);
    endSlot.setHours(closeH, closeM, 0, 0);
const baseSpotsList = [];
    const daySpots = [];

    while (slot < endSlot) {
      const startTime = format(slot, 'HH:mm');
      const endTime = format(addMinutes(slot, sessionDuration), 'HH:mm');
      const slotLabel = `${startTime} - ${endTime}`;
      const key = `${dateFormatted}_${slotLabel}`;

      const baseSpots = availabilityMap[key] ?? totalSpots;
      const bookedSpots = bookingMap[key] || 0;
      const spotsAvailable = Math.max(baseSpots - bookedSpots, 0);
      const isUpdated = availabilityMap[key] !== undefined;
 baseSpotsList.push(baseSpots);
      daySpots.push(spotsAvailable);

      eventsArray.push({
        id: `${sauna.id}_${dateFormatted}_${slotLabel}`,
        title: '',
        start: `${dateISO}T${startTime}`,
        end: `${dateISO}T${endTime}`,
        allDay: false,
        backgroundColor: '#809f68',
        textColor: 'white',
        extendedProps: {
          saunaId: sauna.id,
          date: dateFormatted,
          time: slotLabel,
          totalSpots,
          spotsAvailable,
          opening,
          closing,
          sessionDuration,
          isUpdated
        }
      });

      slot = addMinutes(slot, 60); // advance by 1 hour regardless of session duration
    }

    // ✅ Summary event logic
 const summarySpots = daySpots.length > 0 ? Math.max(...daySpots) : null;

    eventsArray.push({
      id: `${sauna.id}_${dateFormatted}_summary`,
      title: '',
      start: dateISO,
      allDay: true,
      backgroundColor: '#809f68',
      textColor: 'white',
      extendedProps: {
        saunaId: sauna.id,
        date: dateFormatted,
        time: null,
        totalSpots,
        spotsAvailable: summarySpots,
        opening,
        closing,
  
      }
    });

    current.setDate(current.getDate() + 1);
  }

  setEvents(eventsArray);
};



    return (
      <div className="bg-[#f5efe6] min-h-screen p-6 font-serif">
        <h1 className="text-2xl font-bold text-[#243a26] mb-6">📅 {t('manageAvailabilityOwner.title')}</h1>

        <div className="flex flex-col lg:flex-row gap-4">

          {/* Left Sidebar */}
       <div className="w-full lg:w-[320px] bg-[#f3dcb9] rounded-lg p-4 shadow-sm flex flex-col h-screen">
          
            <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🧖 {t('manageAvailabilityOwner.yourSaunas')}</div>
           <div className="p-3 flex-1 overflow-y-auto max-h-[50vh] lg:max-h-none">

              {saunas.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSauna(s);
                    setSelectedSlot(null);
                    setHighlightedSlotId(null);
                  }}
                  className={`cursor-pointer p-2 mb-2 rounded border ${
                    selectedSauna?.id === s.id
                      ? ' border-[#b67342] font-semibold shadow-md'
                      : 'hover:bg-[bg-[#ebbd83]#e5cdac] border-[#e4c497]'
                  }`}
                >
                  <div>{s.title}</div>
                  <div className="text-xs text-gray-600">{s.city}, {s.country}</div>
 {t('manageAvailabilityOwner.sessionDuration')}: <div className="text-xs text-gray-600"> {s.sessionDuration}</div>
                </div>
              ))}
           
          </div>
        </div>

          {/* Calendar */}
          <div className="flex-1 bg-[#f3dcb9] rounded-lg shadow-sm p-4">
            <FullCalendar   height="auto"

            
              allDaySlot={false} // Hides the all-day row
    viewDidMount={(arg) => setViewType(arg.view.type)}
            slotLabelFormat={{
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }}
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
              right: 'dayGridMonth,timeGridDay',

              }}
              slotMinTime={selectedSauna?.openingTime || '08:00'}
              slotMaxTime={selectedSauna?.closingTime || '17:00'}
              
              
              events={events}

              eventClick={(info) => {
    const props = info.event.extendedProps;

    const selected = {
      id: info.event.id,
      date: props.date,
      time: props.time ?? `${props.opening} - ${props.closing}`, // summary fallback
      totalSpots: props.totalSpots,
      spotsAvailable: props.spotsAvailable,
        sessionDuration: props.sessionDuration, 
    };

    setSelectedSlot(selected);
    setEditSpots(props.spotsAvailable);
    setHighlightedSlotId(info.event.id);
    const api = calendarRef.current?.getApi();
  if (api) {
    api.getEvents().forEach((ev) => {
      const el = ev._def?.ui?.el || document.querySelector(`[data-event-id="${ev.id}"]`);
      if (!el) return;

      if (ev.id === info.event.id) {
        el.style.backgroundColor = '#ebbd83';
        el.style.textColor='#ffffff'
        el.style.border = '2px solid #975328';
        el.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
      } else {
        el.style.backgroundColor = '#F5f5dc';
        el.style.border = 'none';
        el.style.boxShadow = 'none';
      }
    });
  }

  }}


              eventContent={(arg) => {
                const { extendedProps } = arg.event;
                const view = arg.view.type;

             if (view === 'dayGridMonth' && arg.event.allDay) {
  const { spotsAvailable, isUniform, opening, closing } = extendedProps;

  return (
    <div className="text-[#b67342] text-xs space-y-1 leading-tight">
      <div>{opening} - {closing}</div>
      
        <>
          <div>{t('manageAvailabilityOwner.spotsAvailable')}</div>
          <div>{spotsAvailable}</div>
        </>
      
    </div>
  );
}





   if (!arg.event.allDay && view === 'timeGridDay'  ) {
 return (
  <div className="text-[#b67342] text-xs flex items-center gap-1 leading-tight">
    <span>
      {arg.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - 
      {arg.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
    </span>
    <span>•</span>
    <span>{t('manageAvailabilityOwner.spotsAvailable')} {extendedProps.spotsAvailable}</span>
 
    
      </div>
    );
  }

                return null;
              }}
            eventDidMount={(info) => {
    const props = info.event.extendedProps;
    const el = info.el;

    // Always highlight selected slot
    if (highlightedSlotId === info.event.id) {
      el.style.backgroundColor = '#b67342';
      el.style.border = '2px solid #975328';
      el.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
    } else if (props?.isUpdated) {
      // 🔸 Custom color if slot was updated from availability collection
      el.style.backgroundColor = '#f9cb9c'; // slightly different olive/green
    } else {
      el.style.backgroundColor = '#F5f5dc';
      el.style.border = 'none';
      el.style.boxShadow = 'none';
    }

    // Hide non-summary time slots from month view
    if (info.view.type === 'dayGridMonth' && !info.event.allDay) {
      el.style.display = 'none';
      el.style.pointerEvents = 'auto';
    }

   

    el.setAttribute('data-event-id', info.event.id);
  }}


            />

        

        </div>

            {selectedSlot && (
                <div className="border border-[#d3b892] rounded">
                  <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🛠{t('manageAvailabilityOwner.updateSlot')}</div>
                  <div className="p-3">
                    <p className="text-sm text-gray-700 mb-1">📅 {selectedSlot.date}</p>
  <p className="text-sm text-gray-700 mb-3">
    🕒 {
      viewType === 'dayGridMonth'
        ? selectedSlot.time
        : selectedSlot.time && (() => {
            const start = to24Hour(selectedSlot.time); // e.g., "08:00"
            const [h, m] = start.split(':').map(Number);

            const session = selectedSlot.sessionDuration || selectedSauna.sessionDuration || 60;

            const startDate = new Date();
            startDate.setHours(h, m, 0);

            const endDate = new Date(startDate.getTime() + session * 60000);

            const format = (d) => d.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return `${format(startDate)} - ${format(endDate)}`;
          })()
    }
  </p>






                    <label className="block text-sm text-gray-600 mb-1">{t('manageAvailabilityOwner.spotsAvailable')}</label>
                    <select
                      value={editSpots}
                      onChange={(e) => setEditSpots(parseInt(e.target.value))}
                      className="w-full border rounded px-2 py-1 mb-3"
                    >
                      {Array.from({ length: selectedSlot.totalSpots + 1 }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
    

<button
  onClick={async () => {
    handleSpotsChange(selectedSlot.id, editSpots);

    const saunaId = selectedSauna.id;
    const date = selectedSlot.date;
    const session = selectedSlot.sessionDuration || selectedSauna.sessionDuration || 60;
    const [dd, mm, yyyy] = date.split('-');
    const parsedDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);

    if (viewType === 'dayGridMonth') {
      const opening = selectedSauna.openingTime || '08:00';
      const closing = selectedSauna.closingTime || '17:00';

      const [openH, openM] = opening.split(':').map(Number);
      const [closeH, closeM] = closing.split(':').map(Number);

      let slot = new Date(parsedDate);
      slot.setHours(openH, openM, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(closeH, closeM, 0, 0);

      while (slot < endOfDay) {
        // 🔁 Always start at each new hour
        const nextHour = new Date(slot);
        nextHour.setHours(slot.getHours() + 1, 0, 0, 0);

        const slotStart = new Date(slot); // e.g., 06:00
        const slotEnd = new Date(slotStart.getTime() + session * 60000); // e.g., 06:45

        if (slotEnd > endOfDay) break; // Don't go beyond closing time

        const pad = (n) => n.toString().padStart(2, '0');
        const startStr = `${pad(slotStart.getHours())}:${pad(slotStart.getMinutes())}`;
        const endStr = `${pad(slotEnd.getHours())}:${pad(slotEnd.getMinutes())}`;
        const slotLabel = `${startStr} - ${endStr}`;
        const slotId = `${saunaId}_${date}_${startStr.replace(':', '')}_${endStr.replace(':', '')}`;

        const docData = {
          saunaId,
          date,
          spotsAvailable: editSpots,
          slot: slotLabel,
        };

        await setDoc(doc(db, 'availability', slotId), docData);

        // ⏭️ Move to next full hour
        slot = nextHour;
      }
    } else {
      // Day view (single slot logic)
      if (!selectedSlot.time) {
        console.error('Missing selectedSlot.time');
        return;
      }

      let startStr, endStr;

      if (selectedSlot.time.includes('-')) {
        [startStr, endStr] = selectedSlot.time.split('-').map(s => s.trim());
      } else {
        startStr = selectedSlot.time;
        const [h, m] = startStr.split(':').map(Number);
        const start = new Date();
        start.setHours(h, m, 0);
        const end = new Date(start.getTime() + session * 60000);

        const format = (d) =>
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        endStr = format(end);
      }

      const slotLabel = `${startStr} - ${endStr}`;
      const slotId = `${saunaId}_${date}_${startStr.replace(':', '')}_${endStr.replace(':', '')}`;

      const docData = {
        saunaId,
        date,
        spotsAvailable: editSpots,
        slot: slotLabel,
      };

      await setDoc(doc(db, 'availability', slotId), docData);
    }

    // ✅ Refresh sauna and calendar
    const saunaRef = doc(db, 'saunas', selectedSauna.id);
    const saunaDoc = await getDoc(saunaRef);

    if (saunaDoc.exists()) {
      const updatedSauna = { id: saunaDoc.id, ...saunaDoc.data() };
      await generateEventsForSauna(updatedSauna);
    }

    // ✅ Show toast
  
toast.success(t('manageAvailabilityOwner.updated', {
  title: selectedSauna.title,
  date: selectedSlot.date,
  time: selectedSlot.time || t('manageAvailabilityOwner.allSlots'),
  spots: editSpots,
}));
  }}
  className="bg-[#b67342] hover:bg-[#975328] text-white rounded px-3 py-2"
>
  {t('manageAvailabilityOwner.saveChanges')}
</button>



                  </div>
                </div>
              )}
      </div>

   <style>{`
        .fc .fc-button {
          background-color: #b67342 !important;
          color: white !important;
          border: none;
        }
        .fc .fc-toolbar-title {
          color: #243a26;
        }
        .fc .fc-daygrid-day-number {
          color: #243a26;
        }
      `}</style>

      
  
      </div>
    );
  };

  export default ManageAvailability;
