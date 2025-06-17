// src/pages/TestingBookingBox.jsx
import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';

const TestingBookingBox = () => {
  const { saunaId: routeId } = useParams(); // optional param
  const hardcodedSaunaId = "helsinki-forest"; // fallback ID
  const saunaId = routeId || hardcodedSaunaId;

  const [sauna, setSauna] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);

  // Step 1: Get the sauna by document ID
  useEffect(() => {
    const fetchSauna = async () => {
      console.log("🔥 Fetching sauna for ID:", saunaId);
      const saunaRef = doc(db, 'saunas', saunaId);
      const saunaSnap = await getDoc(saunaRef);

      if (saunaSnap.exists()) {
        const saunaData = saunaSnap.data();
        setSauna({ id: saunaId, ...saunaData });
        console.log("📌 Sauna loaded:", saunaData);
      } else {
        console.warn("❌ Sauna not found.");
      }
    };

    fetchSauna();
  }, [saunaId]);

  // Step 2: Get availability where sauna-id matches sauna's sauna-id
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!sauna || !sauna['sauna-id']) return;

      const snapshot = await getDocs(collection(db, 'availability'));
      const all = snapshot.docs.map(doc => doc.data());

      const filtered = all.filter(
        (entry) => entry['sauna-id'] === sauna['sauna-id']
      );

      console.log("📊 Matched availability:", filtered);
      setAvailabilityData(filtered);
    };

    fetchAvailability();
  }, [sauna]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧖‍♀️ Sauna Availability Tester</h1>

      {sauna && (
        <p className="mb-4 text-lg font-medium">
          Selected Sauna: <span className="text-green-700">{sauna.title || sauna.id}</span>
        </p>
      )}

      {availabilityData.length > 0 ? (
        availabilityData.map((entry, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-green-700">
              📅 Date: {entry.date}
            </h2>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Spots Booked</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {entry.slots?.map((slot, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{slot.time}</td>
                    <td className="p-2 border">{slot.spotsBooked}</td>
                    <td className={`p-2 border font-semibold ${
                      slot.status === 'booked'
                        ? 'text-red-500'
                        : slot.status === 'available'
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {slot.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="text-gray-500 mt-4 italic">
          {sauna ? 'No availability found for this sauna.' : 'Loading sauna...'}
        </p>
      )}
    </div>
  );
};

export default TestingBookingBox;
