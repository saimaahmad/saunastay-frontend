import React, { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, addMinutes, setHours, setMinutes, isBefore } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import UpdateAvailabilityModal from '../components/UpdateAvailabilityModal';
import { setDoc, doc } from 'firebase/firestore';

const formatDate = (isoStr) => new Date(isoStr).toLocaleDateString('en-GB').split('/').join('-');
const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':');
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m));
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/\s/g, '');
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
const [showConfirm, setShowConfirm] = useState(false);
const [confirmData, setConfirmData] = useState(null);
const [viewType, setViewType] = useState('dayGridMonth');

const dateObj = new Date();
const time24 = format(dateObj, 'HH:mm');

function to24Hour(time12h) {
  const [time, modifier] = [time12h.slice(0,5), time12h.slice(5).toUpperCase()];
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}


function generateTimeSlots(startHour = 8, endHour = 20, sessionDurationMins = 30) {
  const slots = [];
  
  // Start at today with startHour and 0 minutes
  let current = setMinutes(setHours(new Date(), startHour), 0);
  const end = setMinutes(setHours(new Date(), endHour), 0);

  while (isBefore(current, end) || current.getTime() === end.getTime()) {
    // Format time in 24-hour HH:mm
    slots.push(format(current, 'HH:mm'));
    // Increment current by sessionDurationMins
    current = addMinutes(current, sessionDurationMins);
  }

  return slots;
}

// Example usage:
const slots = generateTimeSlots(8, 20, 30);
console.log(slots);
// Output: ['08:00', '08:30', '09:00', ..., '19:30', '20:00']


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setOwnerEmail(user.email);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ownerEmail) return;
    (async () => {
      const snap = await getDocs(collection(db, 'saunas'));
      const owned = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((s) => s.ownerEmail === ownerEmail);
      setSaunas(owned);
      if (owned.length > 0) setSelectedSauna(owned[0]);
    })();
  }, [ownerEmail]);

  useEffect(() => {
    if (!selectedSauna) return;
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
  const today = new Date();
  const end = new Date();
  end.setFullYear(today.getFullYear() + 1);

  const opening = sauna.openingTime || '08:00';
  const closing = sauna.closingTime || '17:00';
  const totalSpots = sauna.totalSpots || 1;
  const sessionDuration = sauna.sessionDurationMins || 60;

  const [availabilitySnap] = await Promise.all([
    getDocs(collection(db, 'availability'))
  ]);

  // Build availability map for this sauna
  const availability = {};
  availabilitySnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.saunaId === sauna.id) {
      availability[`${data.date}_${data.time}`] = data.spotsAvailable;
    }
  });

  const eventsArray = [];
  let current = new Date(today);

  while (current <= end) {
    const dateISO = current.toISOString().split('T')[0];
    const dateFormatted = formatDate(dateISO);

    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);

    const startTime = new Date(current);
    startTime.setHours(openH, openM, 0, 0);

    const endTime = new Date(current);
    endTime.setHours(closeH, closeM, 0, 0);

    let slotTime = new Date(startTime);
    let hasUpdatedAllSlots = true;

    while (true) {
      const slotEnd = new Date(slotTime.getTime() + sessionDuration * 60000);
      if (slotEnd > endTime) break;

      const hh = String(slotTime.getHours()).padStart(2, '0');
      const mm = String(slotTime.getMinutes()).padStart(2, '0');
      const time24 = `${hh}:${mm}`;
      const timeFormatted = formatTime(time24);
      const key = `${dateFormatted}_${timeFormatted}`;
      const eventId = `${sauna.id}_${dateFormatted}_${timeFormatted}`;

      const spotsAvailable = availability[key] ?? totalSpots;
      if (!(key in availability)) hasUpdatedAllSlots = false;

      eventsArray.push({
        id: eventId,
        title: '',
        start: `${dateISO}T${time24}`,
        allDay: false,
        backgroundColor: '#809f68',
        textColor: 'white',
        extendedProps: {
          saunaId: sauna.id,
          date: dateFormatted,
          time: timeFormatted,
          totalSpots,
          spotsAvailable,
          opening,
          closing,
        },
      });

      slotTime = slotEnd;
    }

    // Generate summary slot
    const uniqueSpots = new Set();
    let summaryTime = new Date(startTime);
    while (true) {
      const summaryEnd = new Date(summaryTime.getTime() + sessionDuration * 60000);
      if (summaryEnd > endTime) break;

      const hh = String(summaryTime.getHours()).padStart(2, '0');
      const mm = String(summaryTime.getMinutes()).padStart(2, '0');
      const key = `${dateFormatted}_${formatTime(`${hh}:${mm}`)}`;
      const spots = availability[key] ?? totalSpots;
      uniqueSpots.add(spots);

      summaryTime = summaryEnd;
    }

    const summarySpots = uniqueSpots.size === 1 ? [...uniqueSpots][0] : totalSpots;

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
      },
    });

    current.setDate(current.getDate() + 1);
  }

  setEvents(eventsArray);

  // Highlight first valid slot for today
  const todayFormatted = formatDate(new Date().toISOString());
  const firstTodaySlot = eventsArray.find(
    (ev) => ev.extendedProps?.date === todayFormatted && ev.extendedProps?.time
  );

  if (firstTodaySlot) {
    setSelectedSlot({
      id: firstTodaySlot.id,
      date: firstTodaySlot.extendedProps.date,
      time: firstTodaySlot.extendedProps.time,
      totalSpots: firstTodaySlot.extendedProps.totalSpots,
      spotsAvailable: firstTodaySlot.extendedProps.spotsAvailable,
    });
    setEditSpots(firstTodaySlot.extendedProps.spotsAvailable);
    setHighlightedSlotId(firstTodaySlot.id);
  }
};


  return (
    <div className="bg-[#f5efe6] min-h-screen p-6 font-serif">
      <h1 className="text-2xl font-bold text-[#243a26] mb-6">📅 Manage Sauna Availability</h1>

      <div className="flex gap-0">
        {/* Left Sidebar */}
        <div className="w-[320px] bg-[#f3dcb9] rounded-lg p-4 shadow-sm flex flex-col justify-between h-fit">
          {/* Sauna List */}
          <div className="border border-[#d3b892] rounded mb-4">
            <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🧖 Your Saunas</div>
            <div className="p-3 max-h-[260px] overflow-y-auto">
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
                      ? 'bg-[#ebbd83] border-[#b67342] font-semibold shadow-md'
                      : 'hover:bg-[#e5cdac] border-[#e4c497]'
                  }`}
                >
                  <div>{s.title}</div>
                  <div className="text-xs text-gray-600">{s.city}, {s.country}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Panel */}
          {selectedSlot && (
            <div className="border border-[#d3b892] rounded">
              <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🛠 Update Slot</div>
              <div className="p-3">
                <p className="text-sm text-gray-700 mb-1">📅 {selectedSlot.date}</p>
<p className="text-sm text-gray-700 mb-3">
        🕒 {
          viewType === 'dayGridMonth'
            ? selectedSlot.time // raw slot label for month view
            : selectedSlot.time && (() => { // range for timeGrid views
                const start = to24Hour(selectedSlot.time);
                let [h, m] = start.split(':').map(Number);
                let endH = (h + 1) % 24;
                const end = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                return `${start} - ${end}`;
              })()
        }
      </p>



                <label className="block text-sm text-gray-600 mb-1">Spots Available:</label>
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
    const isSummary = !selectedSlot.time || selectedSlot.time.includes('-'); // Month view block

    if (isSummary) {
      const opening = selectedSauna.openingTime || '08:00';
      const closing = selectedSauna.closingTime || '17:00';
      const [openH, openM] = opening.split(':').map(Number);
      const [closeH, closeM] = closing.split(':').map(Number);

      const slot = new Date();
      const [dd, mm, yyyy] = date.split('-');
      slot.setFullYear(yyyy, mm - 1, dd);
      slot.setHours(openH, openM, 0, 0);

      const endSlot = new Date(slot);
      endSlot.setHours(closeH, closeM, 0, 0);

      while (slot < endSlot) {
        const hh = slot.getHours().toString().padStart(2, '0');
        const mm = slot.getMinutes().toString().padStart(2, '0');
       

     // Calculate next slot for 24-hour range
     const startH = slot.getHours().toString().padStart(2, '0');
const startM = slot.getMinutes().toString().padStart(2, '0');

        const nextSlot = new Date(slot);
        nextSlot.setHours(slot.getHours() + 1);
        const endH = nextSlot.getHours().toString().padStart(2, '0');
        const endM = nextSlot.getMinutes().toString().padStart(2, '0');

        const timeRange = `${startH}:${startM} - ${endH}:${endM}`; // e.g. 13:00-14:00
        const slotId = `${saunaId}_${date}_${timeRange}`;
         const docData = {
          saunaId,
          date,
          time: timeRange,
          spotsAvailable: editSpots,
          SlotStartTime:selectedSauna.openingTime,
                };

        await setDoc(doc(db, 'availability', slotId), docData);

        slot.setHours(slot.getHours() + 1);
        slot.setMinutes(openM); // Reset minutes to match session start pattern
      }
    } else {
      const docData = {
        saunaId,
        date,
        time: selectedSlot.time,
        spotsAvailable: editSpots,
      };
      await setDoc(doc(db, 'availability', selectedSlot.id), docData);
    }

    setConfirmData({
      saunaName: selectedSauna.title,
      date,
      time: selectedSlot.time || `${selectedSauna.openingTime} - ${selectedSauna.closingTime}`,
      spots: editSpots,
    });
    setShowConfirm(true);
    await generateEventsForSauna(selectedSauna);

  }}
  className="bg-[#b67342] hover:bg-[#a16234] text-white px-4 py-2 rounded w-full"
>
  Update Availability
</button>



              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="flex-1 bg-[#f3dcb9] rounded-lg shadow-sm p-4">
          <FullCalendar
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
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
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
      el.style.backgroundColor = '#b67342';
      el.style.border = '2px solid #975328';
      el.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
    } else {
      el.style.backgroundColor = '#809f68';
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
                return (
                  <div className="text-white text-xs space-y-1">
                    <div>{extendedProps.opening} - {extendedProps.closing}</div>
                    <div>Spots Available: {extendedProps.spotsAvailable}</div>
                  </div>
                );
              }
if (!arg.event.allDay && (view === 'timeGridWeek' || view === 'timeGridDay')) {
  const start = new Date(arg.event.start);
  const end = new Date(arg.event.end ?? (start.getTime() + 60 * 60 * 1000)); // default 1hr slot
const format = (d) => d.toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

  return (
    <div className="text-white text-xs space-y-1">
      <div>{format(start)} - {format(end)}</div>
      <div>Spots Available: {extendedProps.spotsAvailable}</div>
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
    el.style.backgroundColor = '#6b8f5e'; // slightly different olive/green
  } else {
    el.style.backgroundColor = '#809f68';
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
  </div>
<UpdateAvailabilityModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  saunaName={confirmData?.saunaName}
  date={confirmData?.date}
  time={confirmData?.time}
  spots={confirmData?.spots}
/>

      <style>{`
        .fc .fc-timegrid-slot {
          min-height: 90px;
        }
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

