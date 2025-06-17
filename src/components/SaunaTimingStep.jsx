import React from 'react';
import { useTranslation } from 'react-i18next';

const sessionOptions = [
  { labelKey: 'session.30min', value: 30 },
  { labelKey: 'session.45min', value: 45 },
  { labelKey: 'session.1hour', value: 60 },
];

const generateTimeSlots = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hours = String(h).padStart(2, '0');
      const minutes = String(m).padStart(2, '0');
      times.push(`${hours}:${minutes}`);
    }
  }
  return times;
};

const timeOptions = generateTimeSlots();

const SaunaTimingStep = ({ formData, setFormData, onNext }) => {
  const { t } = useTranslation();

  const handleTimeChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSessionSelect = (value) => {
    setFormData((prev) => ({ ...prev, sessionDuration: value }));
  };

  const handlePriceChange = (value) => {
    setFormData((prev) => ({ ...prev, price: parseFloat(value) || '' }));
  };

  return (
    <div className="bg-[#eee1ce] min-h-screen p-4 sm:p-6 overflow-y-auto max-h-screen">
      <h2 className="text-2xl font-serif text-[#243a26] mb-6">{t('timing.title')}</h2>

      {/* Opening and Closing Time */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/2">
          <label className="block text-sm mb-1 text-[#243a26]">
            {t('timing.opening')}
          </label>
          <select
            value={formData.openingTime || ''}
            onChange={(e) => handleTimeChange('openingTime', e.target.value)}
            className="w-full p-2 border rounded bg-[#eee1ce] h-20 overflow-y-scroll border-gray-100"
          >
            <option value="">{t('timing.selectTime')}</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-sm mb-1 text-[#243a26]">
            {t('timing.closing')}
          </label>
          <select
            value={formData.closingTime || ''}
            onChange={(e) => handleTimeChange('closingTime', e.target.value)}
            className="w-full p-2 border rounded bg-[#eee1ce] h-20 overflow-y-scroll border-gray-100"
          >
            <option value="">{t('timing.selectTime')}</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Duration */}
      <div className="mb-6">
        <label className="block text-sm mb-2 text-[#243a26]">
          {t('timing.duration')}
        </label>
        <div className="flex flex-wrap gap-4">
          {sessionOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 text-[#243a26]">
              <input
                type="radio"
                name="sessionDuration"
                value={option.value}
                checked={formData.sessionDuration === option.value}
                onChange={() => handleSessionSelect(option.value)}
                className="accent-[#243a26]"
              />
              <span>{t(option.labelKey)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Per Session */}
      <div className="mb-6">
        <label className="block text-sm text-[#243a26] mb-1">
          {t('timing.price')}
        </label>
        <input
  type="number"
  min="1" // ✅ Enforce minimum
  value={formData.price || ''}
  onChange={(e) => handlePriceChange(e.target.value)}
  placeholder={t('timing.pricePlaceholder')}
  className="w-full p-2 rounded border bg-[#eee1ce] border-gray-100"
/>

      </div>
    </div>
  );
};

export default SaunaTimingStep;
