import React, { useRef, useEffect, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const CLOUD_NAME = 'dd7o8hpf2';
const UPLOAD_PRESET = 'saunastay_uploads';

const ImageUploadStep = ({ formData, setFormData }) => {
  const inputRefs = useRef([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!formData.images || formData.images.length !== 4) {
      setFormData((prev) => ({ ...prev, images: Array(4).fill(null) }));
    }
  }, []);

  const handleImageUpload = async (file, index) => {
    setUploadingIndex(index);
    const formDataCloud = new FormData();
    formDataCloud.append('file', file);
    formDataCloud.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formDataCloud,
      });
      const data = await res.json();
      const updatedImages = [...(formData.images || Array(4).fill(null))];
      updatedImages[index] = data.secure_url;

      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    } catch (error) {
      console.error('Cloudinary upload error:', error);
    } finally {
      setUploadingIndex(null);
    }
  };

  const triggerFileInput = (index) => {
    inputRefs.current[index]?.click();
  };

  return (
    <div className="bg-[#eee1ce] min-h-screen py-6 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Size Warning */}
        <p className="text-sm text-red-600 mb-4">
          ⚠️ {t('images.warning')}
        </p>

        {/* Cover Image */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-[#243a26] mb-2">
            {t('images.cover')}
          </label>
          <div
            className="w-full h-64 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-[#f5efe6]"
            onClick={() => triggerFileInput(0)}
          >
            {formData.images?.[0] ? (
              <img src={formData.images[0]} alt="Cover" className="w-full h-full object-cover" />
            ) : uploadingIndex === 0 ? (
              <p className="text-sm text-gray-500">{t('images.uploading')}</p>
            ) : (
              <span className="flex items-center gap-2 text-gray-500 text-sm text-center">
                <FiUploadCloud className="text-xl" />
                {t('images.uploadCover')}
              </span>
            )}
            <input
              ref={(el) => (inputRefs.current[0] = el)}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0], 0)}
            />
          </div>
        </div>

        {/* Side Images */}
        <label className="block text-sm font-semibold text-[#243a26] mb-2">
          {t('images.side')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-32 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden bg-[#f5efe6]"
              onClick={() => triggerFileInput(index)}
            >
              {formData.images?.[index] ? (
                <img src={formData.images[index]} alt={`Side ${index}`} className="object-cover w-full h-full" />
              ) : uploadingIndex === index ? (
                <p className="text-sm text-gray-500">{t('images.uploading')}</p>
              ) : (
                <span className="text-gray-500 text-sm flex flex-col items-center text-center">
                  <FiUploadCloud className="text-xl" />
                  {t('images.upload')}
                </span>
              )}
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0], index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadStep;
