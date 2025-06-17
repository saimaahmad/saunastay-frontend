import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const categories = [
  { icon: '🧖‍♂️', label: 'Traditional Sauna' },
  { icon: '⚡', label: 'Electric Sauna' },
  { icon: '🔥', label: 'Wood Burning' },
  { icon: '🌲', label: 'Outdoor Sauna' },
  { icon: '💨', label: 'Smoke Sauna' },
  { icon: '🔄', label: 'Hybrid Sauna' },
  { icon: '🛢️', label: 'Barrel Sauna' },
  { icon: '🌈', label: 'Infrared vs Traditional' },
  { icon: '⭐', label: 'Popular Styles' },
  { icon: '🚿', label: 'Steam Shower' },
  { icon: '🛁', label: 'Bathroom Sauna' },
  { icon: '🧬', label: 'Bio Sauna' },
  { icon: '🏠', label: 'Cabin Sauna' },
  { icon: '💧', label: 'Steam Room' },
];

const SaunaCategoryBar = ({ selectedCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);
  const { t } = useTranslation();

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative bg-[#e1d5c9] border-b border-[#d8c9b8] py-4 px-2">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#f1e6da] p-2 rounded-full shadow-md z-10 hover:bg-[#e5d5c5]"
      >
        <FaChevronLeft className="text-[#243a26]" />
      </button>

      <div
        ref={scrollRef}
        className="overflow-x-auto whitespace-nowrap scrollbar-hide px-8"
      >
        <div className="inline-flex gap-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCategory(cat.label)}
              className={`flex flex-col items-center text-sm px-3 py-1 rounded-md transition ${
                selectedCategory === cat.label
                  ? 'bg-[#b67342] text-white'
                  : 'text-[#243a26] hover:text-[#5a8871]'
              }`}
            >
              <div className="text-2xl">{cat.icon}</div>
              <span className="font-medium text-xs text-center">{t(cat.label)}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#f1e6da] p-2 rounded-full shadow-md z-10 hover:bg-[#e5d5c5]"
      >
        <FaChevronRight className="text-[#243a26]" />
      </button>
    </div>
  );
};

export default SaunaCategoryBar;
