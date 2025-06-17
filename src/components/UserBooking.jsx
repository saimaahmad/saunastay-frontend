import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import RequestAdminModal from '../components/RequestAdminModal';

const UserBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const calendarRef = useRef(null);

  const fetchBookings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'bookings'), where('userEmail', '==', user.email));
    const snapshot = await getDocs(q);

    const bookingsList = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    setBookings(bookingsList);
    
  // 👇 Set the first booking as selected by default
  if (bookingsList.length > 0) {
    setSelectedBooking(bookingsList[0]);
   } };

  useEffect(() => {
    fetchBookings();
  }, []);

  const events = bookings.flatMap((b) => {
    const startTime = b.time.padStart(5, '0');
    const startISO = `${b.date}T${startTime}:00`;

    return [
      // Timed event for week/day view
      {
        id: `${b.id}-timed`,
        title: '',
        start: startISO,
        allDay: false,
        backgroundColor: b.status === 'confirmed' ? '#b67342' : '#d4a95f',
        textColor: '#ffffff',
        extendedProps: { ...b },
      },
      // Summary block for month view
      {
        id: `${b.id}-summary`,
        title: '',
        start: b.date,
        allDay: true,
        backgroundColor: '#809f68',
        textColor: '#ffffff',
        extendedProps: { ...b, isSummary: true },
      },
    ];
  });

  return (
   
          <div className="grid grid-cols-[2fr_1fr] bg-[#fdf5e9] min-h-screen text-[#243a26]">
      {/* 📅 Calendar */}
  <section className="rounded-l-xl bg-[#f3dcb9] shadow-lg p-4 space-y-6 border border-r-0 border-gray-100"> 
        <FullCalendar
      
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
           slotLabelFormat={{
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // ✅ 24-hour time
  }}
  allDaySlot={false} // ✅ Removes the all-day row in timeGrid views

          events={events}
          eventClick={(info) => {
            setSelectedBooking(info.event.extendedProps);
          }}
          eventContent={(arg) => {
            const { extendedProps } = arg.event;
            const viewType = arg.view.type;

            if (viewType === 'dayGridMonth' && extendedProps.isSummary) {
              return (
                <div className="text-white text-xs space-y-1">
                      <div>👥 {extendedProps.spotsBooked} spot(s)</div>
                </div>
              );
            }

            if (!arg.event.allDay) {
              return (
                <div className="text-white text-xs space-y-1">
                                   <div>👥 {extendedProps.spotsBooked}</div>
                   </div>
              );
            }

            return null;
          }}
        />
      </section>

      {/* 🧾 Sidebar */}
    
       <section className="rounded-r-xl bg-[#f3dcb9] shadow-lg p-8 space-y-6 border border-gray-100 border-l-0">   
        {/* Booking Details */}
   {selectedBooking && (
    
    <div className=" border-[#d3b892] rounded">
  
  <div className="bg-[#ebbd83] px-3 py-2 font-bold text-[#243a26]">🔍 Booking Details</div>
                <div className="p-3 text-sm text-gray-800 space-y-2">
                  <p><strong>🔖 Booking ID:</strong> {selectedBooking.bookingId}</p>
    <p><strong>📅 Date:  </strong> {selectedBooking.date}</p>
    <p><strong>🕒 Time: </strong>{selectedBooking.time}</p>
    <p><strong>🧖 Sauna:</strong> {selectedBooking.saunaTitle || 'Sauna'}</p>
    <p><strong>👤 Name:</strong>{selectedBooking.userName}</p>
    <p><strong>📧 Email:</strong> {selectedBooking.userEmail}</p>
    <p><strong>📞 Contact:</strong>{selectedBooking.contact}</p>
    <p><strong>👥 Spots Booked:</strong>{selectedBooking.spotsBooked}</p>
    <p><strong>Status:</strong> {selectedBooking.status}</p>
  </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-[#b67342] hover:bg-[#a16234] text-white px-3 py-2 mt-4 rounded w-full"
            >
              ✉️ Request Change
            </button>
          </div>        )}
      </section>

      {/* Modal */}
      <RequestAdminModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        booking={selectedBooking}
        userEmail={auth.currentUser?.email || ''}
      />

      {/* Calendar Theme Customization */}
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

export default UserBooking;
