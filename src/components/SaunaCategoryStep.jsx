import React, { useEffect, useState } from 'react';
import {
  FaFire, FaBolt, FaTree, FaSmog, FaCogs, FaDrumSteelpan,
  FaSpa, FaCloud
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const SaunaCategoryStep = ({ selectedCategory, setSelectedCategory }) => {
  const [animate, setAnimate] = useState(false);
  const { t } = useTranslation();

  const saunaCategories = [
    { label: 'traditionalSauna', icon: <FaFire size={20} /> },
    { label: 'electricSauna', icon: <FaBolt size={20} /> },
    { label: 'outdoorSauna', icon: <FaTree size={20} /> },
    { label: 'smokeSauna', icon: <FaSmog size={20} /> },
    { label: 'hybridSauna', icon: <FaCogs size={20} /> },
    { label: 'barrelSauna', icon: <FaDrumSteelpan size={20} /> },
    { label: 'infraredSauna', icon: <FaSpa size={20} /> },
    { label: 'steamRoom', icon: <FaCloud size={20} /> },
    { label: 'cabinSauna', icon: <FaTree size={20} /> },
    { label: 'bathroomSauna', icon: <FaSpa size={20} /> },
    { label: 'woodBurningSauna', icon: <FaFire size={20} /> },
    { label: 'bioSauna', icon: <FaSpa size={20} /> },
    { label: 'steamCabin', icon: <FaCloud size={20} /> },
    { label: 'drySauna', icon: <FaSpa size={20} /> },
    { label: 'mobileSauna', icon: <FaCloud size={20} /> },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#eee1ce] py-4 px-4 sm:px-6 max-w-5xl mx-auto">
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 transform transition-all duration-700 ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {saunaCategories.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelectedCategory(label)}
            className={`flex flex-col justify-center items-center h-28 border rounded-lg p-4 bg-[#eee1ce] transition-all duration-300 ease-in-out ${
              selectedCategory === label
                ? 'border-[#4d603e] shadow-md scale-105'
                : 'border-gray-100 hover:border-[#4d603e]'
            }`}
          >
            <div className="mb-2 text-[#4d603e]">{icon}</div>
            <span className="text-sm font-medium text-[#243a26] text-center">
              {t(label)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SaunaCategoryStep;
