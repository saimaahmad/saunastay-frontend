import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

const ManageSaunas = () => {
  const [saunas, setSaunas] = useState([]);
  const [selectedSauna, setSelectedSauna] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSaunas = async () => {
      const snapshot = await getDocs(collection(db, 'saunas'));
      const saunaList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSaunas(saunaList);
    };

    fetchSaunas();
  }, []);

  const handleUpdate = async () => {
    if (!selectedSauna) return;
    const saunaRef = doc(db, 'saunas', selectedSauna.id);
    await updateDoc(saunaRef, selectedSauna);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedSauna) return;
    await deleteDoc(doc(db, 'saunas', selectedSauna.id));
    setSaunas(prev => prev.filter(sauna => sauna.id !== selectedSauna.id));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#edc8a3] min-h-screen p-6 text-[#243a26]">
      <h2 className="text-2xl font-semibold mb-6">Manage Saunas</h2>

      {saunas.length === 0 ? (
        <p>No saunas found.</p>
      ) : (
        <table className="min-w-full bg-[#e1d5c9] rounded shadow overflow-hidden">
          <thead className="bg-[#caa26a] text-white">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Owner Email</th>
              <th className="text-left px-4 py-3">Address</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {saunas.map((sauna) => (
              <tr key={sauna.id} className="border-b border-[#caa26a]">
                <td className="px-4 py-3">{sauna.title}</td>
                <td className="px-4 py-3">{sauna.ownerEmail || 'admin'}</td>
                <td className="px-4 py-3">{sauna.city}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSauna(sauna);
                      setIsModalOpen(true);
                    }}
                    className="text-[#b67342] hover:underline"
                  >
                    ✏️ View / Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && selectedSauna && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-[#edc8a3] p-6 rounded-lg w-[600px] space-y-4 text-[#243a26] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold">Edit Sauna</h3>

            {Object.keys(selectedSauna).map((key) => (
              typeof selectedSauna[key] === 'string' || typeof selectedSauna[key] === 'number' ? (
                <div key={key}>
                  <label className="block font-semibold mb-1 capitalize">{key}</label>
                  <input
                    type="text"
                    value={selectedSauna[key] || ''}
                    onChange={(e) => setSelectedSauna({ ...selectedSauna, [key]: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              ) : null
            ))}

            <div className="flex justify-between mt-4">
              <button
                onClick={handleUpdate}
                className="bg-orange-300 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="text-sm mt-4 underline text-center w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSaunas;
