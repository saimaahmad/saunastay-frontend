import React, { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase'; // adjust path if needed

const AdminHome = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState([]);

  const handleUpdateRevenue = async () => {
    setLoading(true);
    setMessage('');

    try {
      const functions = getFunctions();
      const updateRevenue = httpsCallable(functions, 'updateRevenue');
      const result = await updateRevenue();
      setMessage(result.data.message || 'Revenue updated successfully');
    } catch (error) {
      setMessage('Error updating revenue: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="text-[#243a26] font-serif">
        <h2 className="text-2xl font-semibold mb-4">Welcome Admin</h2>
      <p className="text-lg mb-6">
        Use the sidebar to manage users, saunas, and bookings across the platform.
      </p>

      <button
        onClick={handleUpdateRevenue}
        disabled={loading}
        className="px-4 py-2 mb-20 bg-orange-500 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Updating Revenue...' : 'Update Revenue Now'}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}

      {/* 📬 Admin Requests Table */}
   
        <h2 className="text-2xl font-bold mb-6">📬 Admin Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-700">No requests found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#d3b892] bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#ebbd83] text-left text-[#243a26]">
                <tr>
                  <th className="px-4 py-2">Owner</th>
                  <th className="px-4 py-2">Sauna</th>
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#fce9cc] border-t border-[#e4c497] text-[#243a26]"
                  >
                    <td className="px-4 py-2">{req.ownerEmail}</td>
                    <td className="px-4 py-2">{req.saunaTitle}</td>
                    <td className="px-4 py-2">{req.bookingId}</td>
                    <td className="px-4 py-2">{req.reason}</td>
                    <td className="px-4 py-2">{req.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
   
  );
};

export default AdminHome;
