import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ImageGallery from '../components/ImageGallery';
import HostInfo from '../components/HostInfo';
import BookingBox from '../components/BookingBox';
import ReviewSection from '../components/ReviewSection';
import Amenities from '../components/Amenities';
import { useTranslation } from 'react-i18next';

const SaunaDetailPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { id } = useParams();
  const decodedId = decodeURIComponent(id);
  const [sauna, setSauna] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchSauna = async () => {
      const saunaRef = doc(db, 'saunas', decodedId);
      const saunaSnap = await getDoc(saunaRef);
      if (saunaSnap.exists()) {
        setSauna({ id: decodedId, ...saunaSnap.data() });
      }
    };

    const fetchReviews = async () => {
      const q = query(collection(db, 'saunaReviews'), where('saunaId', '==', decodedId));
      const snapshot = await getDocs(q);
      const result = snapshot.docs.map(doc => doc.data());
      setReviews(result);
    };

    fetchSauna();
    fetchReviews();
  }, [decodedId]);

  if (!sauna)
    return (
      <p className="text-center mt-10 text-gray-500">{t('loadingSaunaDetails', 'Loading sauna details...')}</p>
    );

  return (
    <div className="bg-[#fdf8ef] min-h-screen text-[#243a26]">
      {/* Image Gallery */}
      <div className="pt-6">
        <ImageGallery images={sauna.images?.slice(0, 4)} />
      </div>

      {/* Rating & Host Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <p className="text-lg font-semibold flex items-center gap-2">
            <span>⭐</span> 
            {typeof sauna.ratingSummary?.avgRatings === 'number'
              ? sauna.ratingSummary.avgRatings.toFixed(1)
              : t('noRatingsYet', 'No ratings yet')}
          </p>
          {typeof sauna.ratingSummary?.avgRatings === 'number' && (
            <span className="flex text-yellow-500 mt-1">
              {[...Array(Math.round(sauna.ratingSummary.avgRatings))].map((_, i) => (
                <FaStar key={i} />
              ))}
            </span>
          )}
        </div>
        <div className="flex justify-start md:justify-end mt-4 md:mt-0">
          <HostInfo name={sauna.hostName} avatar={sauna.avatar || '/images/default.jpg'} />
        </div>
      </div>

      {/* Location + Amenities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#f5e7d8] p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">📍 {t('locationCategory', 'Location & Category')}</h3>
         <p className="text-md mb-1">
  <strong>{t('locationFeature', 'Location')}:</strong>{' '}
  {currentLang === 'fi' ? sauna.city_fi : sauna.city_en}, {currentLang === 'fi' ? sauna.country_fi : sauna.country_en}
</p>

          <p className="text-md">
            <strong>{t('category', 'Category')}:</strong>    {t(sauna.category, sauna.category)}
          </p>
        </div>
        <div className="bg-[#f5e7d8] p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">🛠 {t('Amenities', 'Amenities')}</h3>
        {/* Amenities */}
{sauna.amenities?.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {sauna.amenities.map((item, idx) => {
      const toCamelCase = (str) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .split(' ')
          .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
          .join('');

      const key = `amenities.${toCamelCase(item)}`;
      return (
        <span
          key={idx}
          className="px-2 py-1 text-xs bg-yellow-100 border border-yellow-600 text-yellow-800 rounded-full"
        >
          {t(key, item)}
        </span>
      );
    })}
  </div>
)}

        </div>
      </div>

      {/* Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-10">
        <h2 className="text-2xl font-bold mb-3">{sauna.title}</h2>
      
        <p className="text-base text-gray-700">
  {currentLang === 'fi' ? sauna.description_fi : sauna.description_en || sauna.description}
</p>
      </div>

      {/* BookingBox */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-12">
        <BookingBox
          saunaId={decodedId}
          title={sauna.title}
          totalSpots={sauna.totalSpots}
          price={sauna.price}
          sessionDuration={sauna.sessionDuration}
          openingTime={sauna.openingTime}
          closingTime={sauna.closingTime}
            lang={currentLang} // dynamically from i18n
        />
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-16 pb-20">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-6">💬 {t('guestReviews', 'Guest Reviews')}</h3>
          <ReviewSection reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default SaunaDetailPage;
