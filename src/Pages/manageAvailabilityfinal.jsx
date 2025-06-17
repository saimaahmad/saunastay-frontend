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
const sessionDuration = sauna.sessionDuration || 60; // in minutes


    //const availabilitySnap = await getDocs(collection(db, 'availability'));
const q = query(collection(db, 'availability'), where('saunaId', '==', sauna.id));
const availabilitySnap = await getDocs(q);
availabilitySnap.forEach(doc => {
  console.log('Fetched availability:', doc.id, doc.data());
});


    // Filter availability docs for this sauna
    const availability = {};
    availabilitySnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.saunaId === sauna.id) {
        availability[`${data.date}_${data.time}`] = data.spotsAvailable;
      }
    });
const today = new Date();
const end = new Date();
end.setDate(today.getDate() + 360); // generate 30 days of slots
let current = new Date(today);

    const eventsArray = [];
const formattedEvents = availabilitySnap.docs.map((doc) => {
  const data = doc.data();

  const [day, month, year] = data.date.split('-');
  const isoDate = `${year}-${month}-${day}`; // convert to YYYY-MM-DD

  return {
    id: doc.id,
    title: '',
    start: `${isoDate}T${data.startTime}:00`, // ensure seconds
    end: `${isoDate}T${data.endTime}:00`,
    allDay: viewType === 'dayGridMonth',
    extendedProps: {
      ...data,
      isUpdated: true,
    },
  };
});



    while (current <= end) {
      const dateISO = current.toISOString().split('T')[0];
      const dateFormatted = formatDate(dateISO);

      const [openH, openM] = opening.split(':').map(Number);
      const [closeH, closeM] = closing.split(':').map(Number);

      // Create Date objects for start/end of availability for current day
      let slot = new Date(dateISO);
      slot.setHours(openH, openM, 0, 0);

      const endSlot = new Date(dateISO);
      endSlot.setHours(closeH, closeM, 0, 0);

      // Loop in increments of sessionDuration (minutes)
      while (slot < endSlot) {
  const hh = slot.getHours().toString().padStart(2, '0');
  const mm = slot.getMinutes().toString().padStart(2, '0');
  const time24 = `${hh}:${mm}`;
  const timeFormatted = formatTime(time24);
  const key = `${dateFormatted}_${timeFormatted}`;
  const eventId = `${sauna.id}_${dateFormatted}_${timeFormatted}`;

  const spotsAvailable = availability[key] ?? totalSpots;

  const isUpdated = availability[key] !== undefined;
  eventsArray.push({
    id: eventId,
    title: '',
    start: `${dateISO}T${time24}`,
    end: `${dateISO}T${format(addMinutes(slot, sessionDuration), 'HH:mm')}`, // end based on session duration
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
      sessionDuration,
      isUpdated,
    },
  });

  // 🔁 Ensure next slot starts at the next hour
  slot = addMinutes(slot, 60);
}


      // Monthly summary event (all-day)
      // Determine spots summary for the day (if all same, use that; else fallback)
      const uniqueSpots = new Set();
      for (let hour = openH; hour < closeH; hour++) {
        for (let min = 0; min < 60; min += sessionDuration) {
          const hh = hour.toString().padStart(2, '0');
          const mm = min.toString().padStart(2, '0');
          const timeKey = `${dateFormatted}_${formatTime(`${hh}:${mm}`)}`;
          const spots = availability[timeKey] ?? totalSpots;
          uniqueSpots.add(spots);
        }
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

    // Highlight first valid slot (same as before)
    const todayFormatted = formatDate(new Date().toISOString());
    const firstTodaySlot = eventsArray.find(
      (ev) => ev.extendedProps?.date === todayFormatted && ev.extendedProps?.time
    );

 

  };


    return (
      <div className="bg-[#f5efe6] min-h-screen p-6 font-serif">
        <h1 className="text-2xl font-bold text-[#243a26] mb-6">📅 Manage Sauna Availability</h1>

        <div className="flex gap-0">
          {/* Left Sidebar */}
       <div className="w-[320px] bg-[#f3dcb9] rounded-lg p-4 shadow-sm flex flex-col h-screen">
          
            <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🧖 Your Saunas</div>
            <div className="p-3 flex-1 overflow-y-auto">
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
    Session Duration: <div className="text-xs text-gray-600"> {s.sessionDuration}</div>
                </div>
              ))}
           
          </div>
        </div>

          {/* Calendar */}
          <div className="flex-1 bg-[#f3dcb9] rounded-lg shadow-sm p-4">
            <FullCalendar

            
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
                  return (
                    <div className="text-[#b67342] text-xs space-y-1 leading-tight">
  <div>{extendedProps.opening} - {extendedProps.closing}</div>
  <div>Spots Available:</div>
  <div>{extendedProps.spotsAvailable}</div>
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
    <span>Spots Available: {extendedProps.spotsAvailable}</span>
 
    
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
                  <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🛠 Update Slot</div>
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
      // Update local state first
      handleSpotsChange(selectedSlot.id, editSpots);

      const saunaId = selectedSauna.id;
      const date = selectedSlot.date;

      const isSummary = !selectedSlot.time || selectedSlot.time.includes('-'); // Month view all-day summary

      if (isSummary) {
        // When updating summary, save individual hourly slots for the whole day
        const opening = selectedSauna.openingTime || '08:00';
        const closing = selectedSauna.closingTime || '17:00';

        const [openH, openM] = opening.split(':').map(Number);
        const [closeH, closeM] = closing.split(':').map(Number);

        let slot = new Date();
        const [dd, mm, yyyy] = date.split('-');
        slot.setFullYear(Number(yyyy), Number(mm) - 1, Number(dd));
        slot.setHours(openH, openM, 0, 0);

        const endSlot = new Date(slot);
        endSlot.setHours(closeH, closeM, 0, 0);

        while (slot < endSlot) {
          const pad = (n) => n.toString().padStart(2, '0');
          const startStr = `${pad(slot.getHours())}:${pad(slot.getMinutes())}`;

          // End of this hourly slot is next hour on the dot
          const nextSlot = new Date(slot);
          nextSlot.setHours(slot.getHours() + 1);
          const endStr = `${pad(nextSlot.getHours())}:${pad(nextSlot.getMinutes())}`;

          // Format keys with colon removed for consistency
          const slotId = `${saunaId}_${date}_${startStr.replace(':', '')}_${endStr.replace(':', '')}`;

          const docData = {
            saunaId,
            date,
            spotsAvailable: editSpots,
            slot: `${startStr} - ${endStr}`,
          };

          await setDoc(doc(db, 'availability', slotId), docData);

          slot = nextSlot; // move to next hour
        }
      } else {
      // For single time slot update (day view or detailed slot)
  if (!selectedSlot.time) {
    console.error('Missing selectedSlot.time:', selectedSlot.time);
    return;
  }


  let startStr, endStr;

  if (selectedSlot.time && selectedSlot.time.includes('-')) {
    // Format: "08:00-09:00"
    [startStr, endStr] = selectedSlot.time.split('-').map(s => s.trim());
  } else if (selectedSlot.time) {
    // Format: "08:00", compute end based on session duration
    startStr = selectedSlot.time;
    const session = selectedSlot.sessionDuration || selectedSauna.sessionDuration || 60;

    const [h, m] = startStr.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0);
    const endDate = new Date(startDate.getTime() + session * 60000);

    const format = (d) => d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    endStr = format(endDate);
  } else {
    console.error('Invalid or missing selectedSlot.time:', selectedSlot.time);
    return;
  }

  const sanitizedStart = startStr.replace(':', '');
  const sanitizedEnd = endStr.replace(':', '');

  const slotId = `${saunaId}_${date}_${sanitizedStart}_${sanitizedEnd}`;

  const docData = {
    saunaId,
    date,
    spotsAvailable: editSpots,
    slot: `${startStr} - ${endStr}`,
  };


  await setDoc(doc(db, 'availability', slotId), docData);

      
      }
        // ✅ Re-fetch the sauna from Firestore
  
  const saunaRef = doc(db, 'saunas', selectedSauna.id);
  const saunaDoc = await getDoc(saunaRef);
  
      if (saunaDoc.exists()) {
        const updatedSauna = { id: saunaDoc.id, ...saunaDoc.data() };
        // ✅ Regenerate events using updated availability data
        await generateEventsForSauna(updatedSauna);
      }

  toast.success(
    `Updated: ${selectedSauna.title} | ${selectedSlot.date} | ${selectedSlot.time || 'All-day'} | Spots: ${editSpots}`
  );


      // Regenerate events to reflect update on UI
      await generateEventsForSauna(selectedSauna);
    
    }}
    className="bg-[#b67342] hover:bg-[#975328] text-white rounded px-3 py-2"
  >
    Save Changes
  </button>



                  </div>
                </div>
              )}
      </div>



        <style>{`
          .fc .fc-timegrid-slot {
            min-height: 90px;
          }
          .fc .fc-button {
            background-color: [#ebbd83] !important;
            color: [#b67342] !important;
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
