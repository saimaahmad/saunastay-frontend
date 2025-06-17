import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GuestFavorites = () => {
  const [favoriteSaunas, setFavoriteSaunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadFavorites = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allFavoriteIds = new Set();

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const favorites = userData.favorites || [];
        favorites.forEach((id) => allFavoriteIds.add(id));
      });

      const saunaPromises = Array.from(allFavoriteIds).map(async (id) => {
        const saunaDoc = await getDoc(doc(db, 'saunas', id));
        return saunaDoc.exists() ? { id: saunaDoc.id, ...saunaDoc.data() } : null;
      });

      const saunas = (await Promise.all(saunaPromises)).filter(Boolean);
      setFavoriteSaunas(saunas);
      setLoading(false);
    };

    loadFavorites();
  }, []);

  return (
    <div className="bg-[#f5efe6] min-h-screen px-6 py-12 font-serif text-[#243a26]">
      <h3 className="text-5xl font-serif text-center mb-6">❤️ {t('guestFavorite.title')}</h3>
      <p className="text-center text-gray-700 text-lg mb-12 max-w-2xl mx-auto">
        {t('guestFavorite.description')}
      </p>

      {loading ? (
        <p className="text-center text-gray-600">{t('guestFavorite.loading')}</p>
      ) : favoriteSaunas.length === 0 ? (
        <p className="text-center text-gray-600">{t('guestFavorite.noFavorites')}</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteSaunas.map((sauna) => (
            <div key={sauna.id} className="bg-[#eee1ce] rounded-xl shadow p-4">
              <Link to={`/sauna/${encodeURIComponent(sauna.id)}`}>
                <img
                  src={sauna.images?.[0] || '/images/placeholder.jpg'}
                  alt={sauna.title}
                  className="w-full h-48 object-cover rounded-md mb-3 hover:opacity-90 transition"
                />
              </Link>
              <h3 className="text-xl font-serif">{sauna.title}</h3>
              <p className="text-sm text-gray-600">{sauna.location}</p>
              <p className="text-md mt-1 font-serif">€{sauna.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestFavorites;
