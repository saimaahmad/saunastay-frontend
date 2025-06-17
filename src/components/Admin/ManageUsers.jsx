import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
  }, []);

  const handleUpdate = async () => {
    if (!selectedUser) return;
    const userRef = doc(db, 'users', selectedUser.id);
    await updateDoc(userRef, {
      name: selectedUser.name,
      email: selectedUser.email,
      contact: selectedUser.contact || '',
      role: selectedUser.role
    });
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    await deleteDoc(doc(db, 'users', selectedUser.id));
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#edc8a3] min-h-screen p-6 text-[#243a26]">
      <h2 className="text-2xl font-serif mb-6">Manage Sauna Users</h2>

      <table className="w-full bg-[#f5efe6] rounded shadow">
       <thead className="bg-[#caa26a] text-white text-left">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-[#e4c497]">
              <td className="px-4 py-2">{user.name || 'N/A'}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2 capitalize">{user.role}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
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

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-[#edc8a3] p-6 rounded-lg w-[400px] space-y-4 text-[#243a26]">
            <h3 className="text-xl font-bold">Edit User</h3>

            <input
              type="text"
              value={selectedUser.name || ''}
              onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
              placeholder="Name"
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="email"
              value={selectedUser.email}
              onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              placeholder="Email"
              className="w-full border px-3 py-2 rounded"
              disabled
            />

            <input
              type="text"
              value={selectedUser.contact || ''}
              onChange={(e) => setSelectedUser({ ...selectedUser, contact: e.target.value })}
              placeholder="Contact"
              className="w-full border px-3 py-2 rounded"
            />

            <select
              value={selectedUser.role}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>

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

export default ManageUsers;
