import React from 'react';
import { useTranslation } from 'react-i18next';

const amenitiesList = [
  { labelKey: 'amenities.woodFiredHeater', icon: '🔥' },
  { labelKey: 'amenities.coldPlunge', icon: '❄️' },
  { labelKey: 'amenities.changingRoom', icon: '🚿' },
  { labelKey: 'amenities.outdoor', icon: '🌲' },
  { labelKey: 'amenities.wifi', icon: '📶' },
  { labelKey: 'amenities.kitchen', icon: '🍳' },
  { labelKey: 'amenities.parking', icon: '🚗' },
  { labelKey: 'amenities.saunaLight', icon: '💡' },
  { labelKey: 'amenities.pool', icon: '🏊' },
  { labelKey: 'amenities.towels', icon: '🧖‍♀️' },
];

const AmenitiesStep = ({ formData, setFormData }) => {
  const { t } = useTranslation();
  const selectedAmenities = formData.amenities || [];

  const toggleAmenity = (label) => {
    const updated = selectedAmenities.includes(label)
      ? selectedAmenities.filter((item) => item !== label)
      : [...selectedAmenities, label];

    setFormData((prev) => ({ ...prev, amenities: updated }));
  };

  return (
    <div className="bg-[#eee1ce] min-h-screen py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-[#243a26] mb-6 text-center">
          {t('amenities.title')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {amenitiesList.map(({ labelKey, icon }) => {
            const label = t(labelKey);
            return (
              <button
                key={labelKey}
                type="button"
                onClick={() => toggleAmenity(label)}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 text-[#243a26] transition-all duration-200
                  ${selectedAmenities.includes(label) ? 'border-[#4d603e] bg-[#eee1ce] shadow-md scale-105' : 'border-gray-100 bg-[#eee1ce] hover:border-[#4d603e]'}`}
              >
                <div className="mb-2 text-2xl">{icon}</div>
                <span className="text-sm font-medium text-center">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AmenitiesStep;
