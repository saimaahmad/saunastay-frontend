// components/SaunaCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SaunaCard = ({ sauna }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500">★</span>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </>
    );
  };

  return (
    <div className="bg-[#e1d5c9] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
      <div className="relative">
        <img
          src={sauna.images?.[0] || '/images/default-sauna.jpg'}
          alt={sauna.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white/80 text-xs px-2 py-1 rounded text-[#243a26] font-semibold">
          {sauna.Type === 'Private' ? '🔐 Private' : sauna.Type === 'Public' ? '🏛 Public' : '🚐 Mobile'}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-[#243a26] mb-1">{sauna.title}</h3>
        <p className="text-sm text-[#4a4a4a] mb-1">{sauna.location} · €{sauna.price}</p>

        {/* ⭐ Rating Stars */}
        {sauna.Ratings && (
          <div className="text-sm mb-2 text-yellow-500 flex items-center">
            {renderStars(sauna.Ratings)}
            <span className="ml-2 text-[#243a26]">({sauna.Ratings})</span>
          </div>
        )}

        <p className="text-sm text-[#555] mb-4 truncate">{sauna.description}</p>

        <Link to={`/sauna/${sauna.id}`}>
          <button className="w-full bg-[#b67342] hover:bg-[#a16236] text-white py-2 rounded-md font-semibold shadow">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SaunaCard;
