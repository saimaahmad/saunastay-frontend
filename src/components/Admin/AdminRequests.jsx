import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, 'adminRequests'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching admin requests:', error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="flex w-full h-screen bg-[#f5efe6] text-[#243a26] font-serif overflow-hidden">
      
      {/* Left - Table */}
      <div className="w-[80%] h-full overflow-y-auto p-6 border-r border-[#d3b892]">
        <h2 className="text-2xl font-serif mb-4">📬 Admin Requests</h2>
        {requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#d3b892] bg-white">
            <table className="min-w-full text-sm">
              <thead  className="bg-[#caa26a] text-white text-left">
                <tr>
                  <th className="px-4 py-2">Owner</th>
                  <th className="px-4 py-2">Sauna</th>
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`cursor-pointer hover:bg-[#fce9cc] border-t border-[#e4c497] ${
                      selectedRequest?.id === req.id ? 'bg-[#f8e4c2]' : ''
                    }`}
                  >
                    <td className="px-4 py-2">{req.ownerEmail}</td>
                    <td className="px-4 py-2">{req.saunaTitle}</td>
                    <td className="px-4 py-2">{req.bookingId}</td>
                    <td className="px-4 py-2">{req.status}</td>
                    <td className="px-4 py-2">{req.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right - Detail Panel */}
      <div className="w-1/3 h-full overflow-y-auto p-6 bg-[#f8ecd9]">
        {selectedRequest ? (
          <>
            <h3 className="text-xl font-bold mb-4">🔍 Request Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Owner Email:</strong> {selectedRequest.ownerEmail}</p>
              <p><strong>Customer Name:</strong> {selectedRequest.customerName}</p>
              <p><strong>Customer Email:</strong> {selectedRequest.customerEmail}</p>
              <p><strong>Contact:</strong> {selectedRequest.contact}</p>
              <p><strong>Booking ID:</strong> {selectedRequest.bookingId}</p>
              <p><strong>Sauna:</strong> {selectedRequest.saunaTitle}</p>
              <p><strong>Sauna ID:</strong> {selectedRequest.saunaId}</p>
              <p><strong>Date:</strong> {selectedRequest.date}</p>
              <p><strong>Time:</strong> {selectedRequest.time}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              <p><strong>Created:</strong> {new Date(selectedRequest.createdAt?.toDate()).toLocaleString()}</p>
            </div>
            <button
              onClick={() => alert('✅ Request marked as done (demo)')}
              className="mt-6 bg-[#b67342] hover:bg-[#a16234] text-white px-4 py-2 rounded w-full"
            >
              ✅ Mark as Done
            </button>
          </>
        ) : (
          <p className="text-gray-600">Select a request to view full details.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
