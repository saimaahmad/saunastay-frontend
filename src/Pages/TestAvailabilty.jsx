import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import UpdateAvailabilityModal from '../components/UpdateAvailabilityModal';
import { getDocs, collection, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { setDoc, doc } from 'firebase/firestore';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/card";
import { toast, ToastContainer } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';




const TestAvailability = () => {
  const [saunas, setSaunas] = useState([]);
  const [selectedSaunaId, setSelectedSaunaId] = useState(null);
  // Find the selected sauna object
const selectedSauna = saunas.find((sauna) => sauna.id === selectedSaunaId) || null;

const saunaOpeningTime = selectedSauna?.openingTime || '00:00';
const saunaClosingTime = selectedSauna?.closingTime || '24:00';
  const [events, setEvents] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [editSpots, setEditSpots] = useState(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState(null);
  const calendarRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [viewType, setViewType] = useState('dayGridMonth');
  const dateObj = new Date();
  const time24 = format(dateObj, 'HH:mm');




// Example: on slot click, set selected slot
const handleSlotClick = (slot) => {
  setSelectedSlot(slot);
};



  useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) setOwnerEmail(user.email);
      });
      return () => unsub();
    }, []);


  useEffect(() => {
    const fetchSaunas = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const saunaRef = collection(db, "saunas");
      const q = query(saunaRef, where("ownerEmail", "==", user.email));
      const snapshot = await getDocs(q);

      const saunaData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSaunas(saunaData);
      if (saunaData.length > 0) {
        setSelectedSaunaId(saunaData[0].id); // Select first sauna by default
      }
    };

    fetchSaunas();
  }, []);

  

  useEffect(() => {
    if (!selectedSaunaId) return;
    const sauna = saunas.find((sauna) => sauna.id === selectedSaunaId);
    if (!sauna) return;

    const {
      openingTime,
      closingTime,
      sessionDuration,
      name,
    } = sauna;

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const startHour = parseInt(openingTime.split(":")[0], 10);
    const endHour = parseInt(closingTime.split(":")[0], 10);


    const newEvents = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${dateStr}T${hour.toString().padStart(2, "0")}:00:00`;
      const endHourCalc = hour + sessionDuration / 60;
      const end = `${dateStr}T${Math.floor(endHourCalc)
        .toString()
        .padStart(2, "0")}:${(sessionDuration % 60)
        .toString()
        .padStart(2, "0")}:00`;

      newEvents.push({
        title: `${name} Slot`,
        start,
        end,
      });
    }

    setEvents(newEvents);
  }, [selectedSaunaId, saunas]);

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
      {/* Sidebar */}
      <div className="space-y-4 md:col-span-1">
        <h2 className="bg-[#ebbd83] px-3 py-2 text-[#243a26]">🧖 Your Saunas</h2>
        {saunas.map((sauna) => (
         <div
                  key={sauna.id}
                  onClick={() => {
                    setSelectedSauna(sauna);
                    setSelectedSlot(null);
                    setHighlightedSlotId(null);
                  }}
                  className={`cursor-pointer p-2 mb-2 rounded border ${
                    selectedSauna?.id === sauna.id
                      ? 'bg-[#ebbd83] border-[#b67342] font-semibold shadow-md'
                      : 'hover:bg-[#e5cdac] border-[#e4c497]'
                  }`}
                >
           
              
                  <div>{sauna.title}</div>
                  <div className="text-xs text-gray-600">{sauna.city}, {sauna.country}</div>
                      <p className="text-sm text-gray-600">
                {sauna.openingTime} - {sauna.closingTime}
              </p>
              <p className="text-sm">Session: {sauna.sessionDuration} min</p>
         </div>
        ))}
      </div>

      {/* Calendar View */}
      
          <div className="flex-1 bg-[#f3dcb9] rounded-lg shadow-sm p-4">
        <FullCalendar
        
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
           initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
          
          //initialView="timeGridDay"
          //headerToolbar={{
           // left: "prev,next today",
           // center: "title",
           // right: "timeGridDay,timeGridWeek",
          //}}
         // allDaySlot={false}
       slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
      minTime={`${saunaOpeningTime}:00`}
      maxTime={`${saunaClosingTime}:00`}
          events={events}
          height="auto"
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

export default TestAvailability;
