// components/HostInfo.jsx
import React from 'react';

const HostInfo = ({ name, avatar }) => {
  return (
    <div className="flex items-center space-x-4 mt-6">
      <img
        src={avatar || "/images/default-host.jpg"}
        alt={name}
        className="w-16 h-16 rounded-full object-cover border-2 border-[#b67342]"
        onError={(e) => e.target.src = "/images/default-host.jpg"}
      />
      <div>
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm text-gray-600">Your Host</p>
      </div>
    </div>
  );
};

export default HostInfo;
