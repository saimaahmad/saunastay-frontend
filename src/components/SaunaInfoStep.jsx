import React, { useRef } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const SaunaInfoStep = ({ formData, setFormData }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeMB = 2;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(t('saunaInfo.avatarTooLarge', { max: maxSizeMB }));
        return;
      }
      const avatarURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: avatarURL }));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#eee1ce] w-full max-w-3xl space-y-6 mx-auto p-4 sm:p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#243a26] text-center mb-6">
          {t('saunaInfo.title')}
        </h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {t('saunaInfo.name')}
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-100 p-3 rounded bg-[#eee1ce]"
            placeholder={t('saunaInfo.namePlaceholder')}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {t('saunaInfo.description')}
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-100 p-3 rounded h-40 resize-none bg-[#eee1ce]"
            placeholder={t('saunaInfo.descriptionPlaceholder')}
          />
        </div>

        {/* Host Name & Total Spots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {t('saunaInfo.hostName')}
            </label>
            <input
              type="text"
              name="hostName"
              value={formData.hostName || ''}
              onChange={handleInputChange}
              className="mt-1 w-full border border-gray-100 p-3 rounded bg-[#eee1ce]"
              placeholder={t('saunaInfo.hostNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              {t('saunaInfo.totalSpots')}
            </label>
            <input
              type="number"
              name="totalSpots"
              min="1"
              value={formData.totalSpots || ''}
              onChange={(e) => {
                const value = Math.max(1, parseInt(e.target.value) || 1);
                setFormData((prev) => ({ ...prev, totalSpots: value }));
              }}
              className="mt-1 w-full border border-gray-100 p-3 rounded bg-[#eee1ce]"
              placeholder={t('saunaInfo.totalSpotsPlaceholder')}
            />
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            {t('saunaInfo.avatar')}
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer bg-white overflow-hidden"
              onClick={triggerFileSelect}
            >
              <img
                src={formData.avatar || '/images/default-avatar.webp'}
                alt="Avatar"
                className="object-cover w-full h-full rounded-full"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <input
              type="text"
              name="avatar"
              value={formData.avatar || ''}
              onChange={handleInputChange}
              className="flex-1 border border-gray-100 p-3 rounded bg-[#eee1ce]"
              placeholder={t('saunaInfo.avatarUrlPlaceholder')}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t('saunaInfo.avatarLimitNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaunaInfoStep;
