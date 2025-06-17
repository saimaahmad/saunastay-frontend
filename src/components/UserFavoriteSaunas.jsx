import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserFavoriteSaunas = () => {
  const [favoriteSaunas, setFavoriteSaunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavoriteSaunas([]);
        setLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setFavoriteSaunas([]);
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const { favorites = [] } = userDoc.data();

        if (favorites.length === 0) {
          setFavoriteSaunas([]);
          setLoading(false);
          return;
        }

        const saunaPromises = favorites.map(async (id) => {
          const saunaDoc = await getDoc(doc(db, 'saunas', id));
          return saunaDoc.exists() ? { id: saunaDoc.id, ...saunaDoc.data() } : null;
        });

        const saunas = (await Promise.all(saunaPromises)).filter(Boolean);
        setFavoriteSaunas(saunas);
      } catch (error) {
        console.error('Error loading user favorites:', error);
        setFavoriteSaunas([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  if (loading) return <p className="text-center text-gray-600">{t('UserFav.loadingFavorites')}</p>;

  if (!user)
    return (
      <p className="text-center text-gray-600">
        {t('UserFav.loginToView')} <Link to="/login" className="underline text-blue-600">{t('UserFav.login')}</Link>
      </p>
    );

  return (
    <div className="bg-[#f5efe6] min-h-screen px-6 py-12 font-serif text-[#243a26]">
      <h3 className="text-5xl font-serif text-center mb-6">❤️ {t('UserFav.myFavorites')}</h3>

      {favoriteSaunas.length === 0 ? (
        <p className="text-center text-gray-600">{t('UserFav.noFavorites')}</p>
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

export default UserFavoriteSaunas;
