import React, { useState, useEffect } from 'react';
import SaunaCategoryBar from '../components/SaunaCategoryBar';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import FavoriteButton from '../components/FavoriteButton';
import { useTranslation } from 'react-i18next';

const SaunaHome = ({ setShowLoginModal }) => {
  const { t } = useTranslation();

  const [saunas, setSaunas] = useState([]);
  const [filteredSaunas, setFilteredSaunas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '' });
  const [favorites, setFavorites] = useState([]);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaunas = async () => {
      const snapshot = await getDocs(collection(db, 'saunas'));
      const saunaList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSaunas(saunaList);
      setFilteredSaunas(saunaList);
    };
    fetchSaunas();
  }, []);

  useEffect(() => {
    let filtered = [...saunas];

    if (selectedCategory) {
      filtered = filtered.filter(
        (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (filters.location) {
      filtered = filtered.filter(
        (s) =>
          s.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
          s.address1?.toLowerCase().includes(filters.location.toLowerCase()) ||
          s.city?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        (s) => s.type?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredSaunas(filtered);
  }, [selectedCategory, filters, saunas]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setFavorites(userSnap.data().favorites || []);
        }
      }
    };
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
    }
  }, [user]);

  const handleSearch = () => {
    setSelectedCategory(''); // Clear category filter
    setFilters({ location: '', type: '' }); // Clear location and type filters
  };

  const toggleFavorite = async (saunaId) => {
    if (!user) {
      toast.info(t('pleaseLoginToSaveFavorites', 'Please log in to save favorites'), {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const userRef = doc(db, 'users', user.email);
    const isFavorited = favorites.includes(saunaId);

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { favorites: [] });
    }

    await updateDoc(userRef, {
      favorites: isFavorited ? arrayRemove(saunaId) : arrayUnion(saunaId),
    });

    setFavorites((prev) =>
      isFavorited ? prev.filter((id) => id !== saunaId) : [...prev, saunaId]
    );
  };

  return (
    <div className="bg-[#f5efe6] min-h-screen font-serif text-[#243a26]">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[420px] rounded-b-3xl shadow-lg"
        style={{ backgroundImage: "url('/images/sauna-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 rounded-b-3xl"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-md">
            {t('findYourDreamSauna', 'Find Your Dream Sauna')}
          </h1>
          <p className="text-sm sm:text-lg opacity-90">
            {t('naturePeaceLuxury', 'Nature, peace, and luxury — book it now')}
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto -mt-12 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-[#e1d5c9] p-4 sm:p-6 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder={t('searchByLocation', 'Search by location...')}
            className="p-3 bg-[#e1d5c9] border border-gray-400 rounded-md placeholder:text-gray-700 text-sm sm:text-base"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
          />

          <select
            className="p-3 bg-[#e1d5c9] border border-gray-400 rounded-md text-gray-800 text-sm sm:text-base"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <option value="">{t('allTypes', 'All Types')}</option>
            <option value="Private">{t('private', 'Private')}</option>
            <option value="Public">{t('public', 'Public')}</option>
            <option value="Mobile">{t('mobile', 'Mobile')}</option>
          </select>

          <button
            className="bg-[#4d603e] hover:bg-[#6a7e5c] text-white px-4 py-3 rounded-md font-serif text-sm sm:text-base"
            onClick={handleSearch}
          >
            🔍 {t('resetAllFilters', 'Reset All Filters')}
          </button>
        </div>
      </div>

      {/* Category Bar */}
      <SaunaCategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Sauna Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-serif mb-6 sm:mb-8 text-left">
          {selectedCategory
            ? `${t('saunasH', 'Saunas')}: ${selectedCategory}`
            : t('exploreSaunas', 'Explore Saunas')}
        </h2>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSaunas.length > 0 ? (
            filteredSaunas.map((sauna) => (
              <div
                key={sauna.id}
                className="bg-[#eee1ce] rounded-xl shadow p-3 sm:p-4"
              >
                <div className="relative">
                  <Link to={`/sauna/${encodeURIComponent(sauna.id)}`}>
                    <img
                      src={sauna.images?.[0] || '/images/placeholder.jpg'}
                      alt={sauna.title}
                      className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition"
                    />
                  </Link>
                  <FavoriteButton
                    saunaId={sauna.id}
                    userId={user?.uid}
                    variant="overlay"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-serif mt-3">
                  {sauna.title}
                </h3>
                <p className="text-sm text-gray-600">{sauna.city}</p>
                <p className="text-md mt-1 font-serif">${sauna.price}              </p>
              
                           
              
              
                {/* Type & Category */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {sauna.type && (
                    <span className="px-2 py-1 text-xs bg-green-100 border border-green-600 text-green-800 rounded-full">
                  {t(sauna.type?.toLowerCase(), sauna.type)}
                    </span>
                  )}
                  {sauna.category && (
                    <span className="px-2 py-1 text-xs bg-blue-100 border border-blue-600 text-blue-800 rounded-full">
                   {t(sauna.category, sauna.category)}
                    </span>
                  )}
                </div>

{/* Amenities */}
{sauna.amenities && sauna.amenities.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {sauna.amenities.map((item, index) => {
      const toCamelCase = (str) =>
        str
          .toLowerCase()
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .split(' ')
          .map((word, i) =>
            i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join('');

      return (
        <span
          key={index}
          className="px-2 py-1 text-xs bg-yellow-100 border border-yellow-600 text-yellow-800 rounded-full"
        >
          {t(`amenities.${toCamelCase(item)}`, item)}
        </span>
      );
    })}
  </div>
)}



              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              {t('noSaunasMatchFilters', 'No saunas match your filters or category.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaunaHome;
