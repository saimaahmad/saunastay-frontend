import React from 'react';
import { useTranslation } from 'react-i18next';

const SecurityFeaturesStep = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  const handleNoteChange = (e) => {
    setFormData((prev) => ({ ...prev, securityNote: e.target.value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="bg-[#eee1ce] min-h-screen py-4 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-2xl font-semibold text-[#243a26] text-center">
          🔒 {t('security.title')}
        </h2>

        {/* Checkboxes */}
        <div className="space-y-4">
          <label className="flex items-center space-x-3 text-[#243a26]">
            <input
              type="checkbox"
              name="hasCamera"
              checked={formData.hasCamera || false}
              onChange={handleCheckboxChange}
              className="accent-[#4d603e]"
            />
            <span>{t('security.camera')}</span>
          </label>

          <label className="flex items-center space-x-3 text-[#243a26]">
            <input
              type="checkbox"
              name="hasNoiseMonitor"
              checked={formData.hasNoiseMonitor || false}
              onChange={handleCheckboxChange}
              className="accent-[#4d603e]"
            />
            <span>{t('security.noiseMonitor')}</span>
          </label>

          <label className="flex items-center space-x-3 text-[#243a26]">
            <input
              type="checkbox"
              name="hasWeapons"
              checked={formData.hasWeapons || false}
              onChange={handleCheckboxChange}
              className="accent-[#4d603e]"
            />
            <span>{t('security.weapons')}</span>
          </label>
        </div>

        {/* Note */}
        <textarea
          value={formData.securityNote || ''}
          onChange={handleNoteChange}
          placeholder={t('security.notePlaceholder')}
          className="w-full p-4 border border-gray-100 rounded-lg bg-[#eee1ce] text-[#243a26] min-h-[160px] resize-none shadow focus:outline-none focus:ring-2 focus:ring-[#4d603e]"
        />

        {/* Disclaimer */}
        <div className="mt-6 text-sm text-gray-700 pt-4">
          <p>
            <strong>{t('security.disclaimerTitle')}</strong>{' '}
            {t('security.disclaimerText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeaturesStep;
