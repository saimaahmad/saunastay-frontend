import React from "react";

const Amenities = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
      {items.map((item, index) => (
        <li
          key={index}
          className="bg-[#f5efe6] border border-[#d4c4ac] rounded-md px-3 py-2"
        >
          ✅ {item}
        </li>
      ))}
    </ul>
  );
};

export default Amenities;
