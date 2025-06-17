import React from 'react';
import { FaHome, FaUsers, FaShuttleVan } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const SaunaTypeStep = ({ selectedType, onSelectType }) => {
  const { t } = useTranslation();

  const types = [
    {
      key: 'private',
      label: t('saunaType.private'),
      description: t('saunaType.privateDescription'),
      icon: <FaHome className="text-3xl text-[#4d603e]" />,
    },
    {
      key: 'public',
      label: t('saunaType.public'),
      description: t('saunaType.publicDescription'),
      icon: <FaUsers className="text-3xl text-[#4d603e]" />,
    },
    {
      key: 'mobile',
      label: t('saunaType.mobile'),
      description: t('saunaType.mobileDescription'),
      icon: <FaShuttleVan className="text-3xl text-[#4d603e]" />,
    },
  ];

  return (
    <div className="bg-[#eee1ce] px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {types.map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => onSelectType(type.key)}
            className={`w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4 px-4 sm:px-6 py-4 sm:py-5 border rounded transition duration-200 ease-in-out transform shadow-sm ${
              selectedType === type.key
                ? 'bg-[#eee1ce] border-[#4d603e] scale-[1.02] shadow-md'
                : 'bg-[#eee1ce] border-gray-100'
            }`}
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#243a26]">{type.label}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
            <div className="flex-shrink-0">{type.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SaunaTypeStep;
