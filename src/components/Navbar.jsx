import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import Login from './Login';
import Signup from './Signup';
import { useTranslation } from 'react-i18next';
import { MdLanguage } from 'react-icons/md';
import fiFlag from '../assets/flags/fi.png';
import gbFlag from '../assets/flags/gb.png';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // make sure your `db` export is correct
import { useEffect } from 'react';



const Navbar = ({ isOwner = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation();
   const lang = i18n.language || "en"; 
  
const [userRole, setUserRole] = useState(null);

  const handleProtectedNav = (path) => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate(path);
    }
    setIsMenuOpen(false);
  };
useEffect(() => {
  const fetchUserRole = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserRole(docSnap.data().role); // assuming the field is called 'role'
      }
    }
  };
  fetchUserRole();
}, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const linkClass = (path) =>
    `hover:text-[#7b8d6d] ${
      location.pathname === path ? 'font-serif underline' : ''
    }`;

  return (
    <>
      <nav className="bg-[#e9c58f] py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/images/Logo.png"
                alt="SaunaStay Logo"
                className="h-[44px] w-auto object-contain"
              />
            </Link>
            <span className="text-2xl italic font-serif text-[#243a26]">
              {t('saunaStay')}
            </span>
          </div>

    
          {/* Right Controls */}
          <div className="flex items-center gap-4 text-[#243a26] font-serif">
            {!isOwner && (
  <Link
    to="/host-sauna"
    className="hidden sm:inline-block bg-[#CD853F] font-bold border border-gray-300 text-white px-4 py-2 rounded-full shadow hover:bg-[#C19A6B] transition font-serif"
  >
    {t('hostSauna')}
  </Link> 
)}
            {/* Hamburger Menu with Language */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full shadow-smxx bg-[#CD853F] hover:shadow-md transition"
              >

                <MdLanguage
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLanguage();
                  }}
                  className="text-xl text-gray-600 mr-1"
                />
                <img
                  src={i18n.language === 'fi' ? fiFlag : gbFlag}
                  alt="flag"
                  className="w-5 h-5 mr-2"
                />
                <FiMenu className="text-lg" />
                <FaUserCircle className="text-xl text-gray-600" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#e4c094] rounded-xl shadow-lg p-4 z-50 text-sm space-y-2">
                  {/* Language Toggle in Menu */}
                  <div
                    className="flex items-center gap-2 cursor-pointer px-2 py-1 bg-[#CD853F] rounded"
                    onClick={toggleLanguage}
                  >
                    <MdLanguage className="text-lg" />
                    <span>{i18n.language === 'fi' ? 'English' : 'Suomi'}</span>
                    <img
                      src={i18n.language === 'fi' ? gbFlag : fiFlag}
                      alt="lang"
                      className="w-4 h-4 ml-1"
                    />
      
                  </div>
                  
       

                    {user ? (
                      <>
                        <p className="text-gray-700 font-medium">
                          👋 Welcome {user.displayName || user.email}
                        </p>
                        {!isOwner && (
                          <>
                            <button
                              onClick={() => {
                                navigate('/user/profile');
                                setIsMenuOpen(false);
                              }}
                              className="block text-left w-full hover:text-[#7b8d6d]"
                            >
                              👤 {t('profileN')}
                            </button>
                            <button
                              onClick={() => {
                                navigate('/user/bookings');
                                setIsMenuOpen(false);
                              }}
                              className="block text-left w-full hover:text-[#7b8d6d]"
                            >
                              🛀 {t('myBookings')}
                            </button>
                            <button
                              onClick={() => {
                                navigate('/user/favorites');
                                setIsMenuOpen(false);
                              }}
                              className="block text-left w-full hover:text-[#7b8d6d]"
                            >
                              ❤️ {t('myFavorites')}
                            </button>
                            <Link
                        to="/journal"
                        onClick={() => setIsMenuOpen(false)}
                        className="block hover:text-[#7b8d6d]"
                      >
                        🧭 {t('saunaJournal')}

                      </Link>
                    <Link
  to={`/${lang}/help`}
  onClick={() => setIsMenuOpen(false)}
  className="block hover:text-[#7b8d6d] transition-all"
>
  📞 {t("helpSupport")}
</Link>
<Link
  to="/feedback"
  onClick={() => setIsMenuOpen(false)}
                        className="block hover:text-[#7b8d6d]"
>
  💬 {t('feedback')}
</Link>
                            {userRole === 'owner' && (
  <Link
    to="/owner/home"
    onClick={() => setIsMenuOpen(false)}
    className="block hover:text-[#7b8d6d]"
  >
    🔙 {t('backToDashboard')}
  </Link>
)}

                          </>
                      )}
                      {isOwner && (
                        <>
                          <Link
                            to="/owner/home"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            📊 {t('dashboard')}
                          </Link>
                          <Link
                            to="/owner/OwnerProfile"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            👤 {t('profileN')}
                          </Link>
                          <Link
                            to="/owner/saunas"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            🧖 {t('manageSaunas')}
                          </Link>
                          <Link
                            to="/owner/availability"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            🕒 {t('manageAvailability')}
                          </Link>
                          <Link
                            to="/owner/ManageBookings"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            📑 {t('manageBookings')}
                          </Link>
                          <Link
                            to="/owner/revenue"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            💰 {t('revenueN')}
                          </Link>
                                         <Link
  to={`/${lang}/help`}
  onClick={() => setIsMenuOpen(false)}
  className="block hover:text-[#7b8d6d] transition-all"
>
  📞 {t("helpSupport")}
</Link>
                          <Link
                            to="/host-sauna"
                            onClick={() => setIsMenuOpen(false)}
                            className="block hover:text-[#7b8d6d]"
                          >
                            ➕ {t('listSauna')}
                          </Link>
                                            <Link
  to="/feedback"
  onClick={() => setIsMenuOpen(false)}
                        className="block hover:text-[#7b8d6d]"
>
  💬 {t('feedback')}
</Link>
                        </>
                      )}
                      <hr />
                      <button
                        onClick={handleLogout}
                        className="block text-left w-full text-red-600 hover:text-red-800"
                      >
                        🚪 {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowLogin(true);
                          setIsMenuOpen(false);
                        }}
                        className="block text-left w-full hover:text-[#7b8d6d]"
                      >
                        🔐 {t('login')}
                      </button>
                      <button
                        onClick={() => {
                          setShowSignup(true);
                          setIsMenuOpen(false);
                        }}
                        className="block text-left w-full hover:text-[#7b8d6d]"
                      >
                        ✍️ {t('signup')}
                      </button>
                      <hr />
                      <button
                        onClick={() => handleProtectedNav('/bookings')}
                        className="block text-left w-full hover:text-[#7b8d6d]"
                      >
                        🛀 {t('myBookings')}
                      </button>
                      <button
                        onClick={() => handleProtectedNav('/favorites')}
                        className="block text-left w-full hover:text-[#7b8d6d]"
                      >
                        ❤️ {t('myFavorites')}
                      </button>
                      <Link
                        to="/journal"
                        onClick={() => setIsMenuOpen(false)}
                        className="block hover:text-[#7b8d6d]"
                      >
                        🧭 {t('saunaJournal')}

                      </Link>
                <Link
  to={`/${lang}/help`}
  onClick={() => setIsMenuOpen(false)}
  className="block hover:text-[#7b8d6d] transition-all"
>
  📞 {t("helpSupport")}
</Link>
                      <Link
                        to="/host-sauna"
                        onClick={() => setIsMenuOpen(false)}
                        className="block hover:text-[#7b8d6d]"
                      >
                        ➕ {t('listSauna')}
                      </Link>
                      <Link
  to="/feedback"
  onClick={() => setIsMenuOpen(false)}
                        className="block hover:text-[#7b8d6d]"
>
  💬 {t('feedback')}
</Link>

                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {!isOwner && showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <Login
            onClose={() => setShowLogin(false)}
            goToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
          />
        </div>
      )}

      {!isOwner && showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <Signup onClose={() => setShowSignup(false)} />
        </div>
      )}
    </>
  );
};

export default Navbar;
