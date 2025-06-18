// src/App.jsx
import './i18n/i18n';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SaunaHome from './Pages/SaunaHome';
import { SaunaProvider } from './context/SaunaContext';
import SaunaDetailPage from './Pages/SaunaDetailPage';
import SearchResultsPage from './Pages/SearchResultsPage';
import { ToastContainer } from 'react-toastify';
import AddNewSauna from './Pages/AddNewSauna';
import DashboardOwner from './Pages/DashboardOwner';
import ManageAvailability from './Pages/ManageAvailability';
import ManageSaunas from './Pages/ManageSaunas';
import ManageBookingsOwner from './Pages/ManageBookingsOwner';
import ProtectedRoute from './components/ProtectedRoute'; // ✅ NEW
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login'; // ✅ Must be imported
import SaunaJournal from './Pages/SaunaJournal';
import 'react-toastify/dist/ReactToastify.css';
import UserDashboard from './Pages/UserDashboard';  
import OwnerProfilePage from './Pages/OwnerProfilePage';
import UserProfilePage from './components/UserProfilePage';
import UserBooking from './components/UserBooking';
import UserFavoriteSaunas from './components/UserFavoriteSaunas';
import OwnerRevenuePage from './components/OwnerRevenuePage';
import PrivacyPolicy from './Pages/PrivacyPolicy.jsx';
import BookingPaymentPage from './Pages/BookingPaymentPage';
import ThankYouPage from './components/ThankYouPage';
import PaymentCancelledPage from './Pages/PaymentCancelledPage';
import UserBookingsTable from './components/UserBookingsTable';
import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';
import FeedbackBotWrapper from './Pages/FeedbackBotWrapper';
import Feedback from './Pages/Feedback';
import HelpEN from './Pages/HelpEN';
import HelpFI from './Pages/HelpFI';

function App() {
  const [showLoginModal, setShowLoginModal] = React.useState(false);
const { t } = useTranslation();
 
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const role = user.email === 'theSaunaStay@gmail.com' ? 'admin' : 'user';
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || '',
          role,
        });
        console.log(`Created Firestore user with role: ${role}`);
      }
    }
  });

  return () => unsubscribe();
}, []);

  

  return (
    <div className="bg-[#f5efe6] min-h-screen">
    <AuthProvider>
    <SaunaProvider>

  <ToastContainer
  position="top-center"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>
 <div className="bg-yellow-100 text-yellow-800 text-center text-sm font-medium px-4 py-2 border-b border-yellow-300">
    🚀 This is the MVP (basic) version of all your favorite saunas booking — Your FeedBacks are Welcome!
  </div>

      <Router>
        <Routes>
          {/* ✅ Homepage with Navbar and Booking */}
        
<Route path="/" element={<><Navbar /><SaunaHome setShowLoginModal={setShowLoginModal} /></>} />

          {/* ✅ Add New Sauna */}
          <Route path="/host-sauna" element={<AddNewSauna />} />

          {/* ✅ Search Results */}
          <Route path="/search-results" element={<><Navbar /><SearchResultsPage /></>} />


          {/* ✅ Sauna Detail Page */}
          <Route path="/sauna/:id" element={<><Navbar /><SaunaDetailPage /></>} />



// In your routes
<Route path="/en/help" element={<HelpEN />} />
<Route path="/fi/help" element={<HelpFI />} />
<Route path="/booking-payment/:bookingId" element={<><Navbar /><BookingPaymentPage /></>} />

<Route path="/thank-you" element={<><Navbar /><ThankYouPage /></>} />
<Route path="/payment-cancelled" element={<><Navbar /><PaymentCancelledPage /> </>}/>

<Route path="/feedback" element={<><Navbar /><Feedback /></>} />

<Route path="/journal" element={<><Navbar /><SaunaJournal /></>} />

       
        <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* ✅ Protected Admin Routes */}
<Route path="/admin" element={<AdminLogin />} />
<Route path="/admin/dashboard/*" element={
  <ProtectedAdminRoute>
    <AdminDashboard />
  </ProtectedAdminRoute>
} />



          {/* ✅ Protected Owner Routes */}
          <Route
            path="/owner/home"
            element={
              <ProtectedRoute>
                <><Navbar isOwner={true} /><DashboardOwner /></>
              </ProtectedRoute>
            }
          />

          {/* ✅ Protected Add New Sauna Routes */}
          <Route
            path="/host-sauna"
            element={
              <ProtectedRoute>
                <><Navbar isOwner={true} /><AddNewSauna /></>
              </ProtectedRoute>
            }
          />
<Route
  path="/owner/revenue"
  element={
    <ProtectedRoute>
      <><Navbar isOwner={true} /><OwnerRevenuePage /></>
    </ProtectedRoute>
  }
/>


            <Route
    path="/owner/OwnerProfile"
    element={
      <ProtectedRoute>
        <><Navbar isOwner={true} /><OwnerProfilePage /></>
      </ProtectedRoute>
    }
  />

          <Route
            path="/owner/saunas"
            element={
              <ProtectedRoute>
                <><Navbar isOwner={true} /><ManageSaunas /></>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/ManageBookings"
            element={
              <ProtectedRoute>
                <><Navbar isOwner={true} /><ManageBookingsOwner /></>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/availability"
            element={
              <ProtectedRoute>
                <><Navbar isOwner={true} /><ManageAvailability /></>
              </ProtectedRoute>
            }

          />


                   <Route
            path="/owner/test"
            element={
              <ProtectedRoute>
                <><Navbar isOwner={true} /><ManageAvailability /></>
              </ProtectedRoute>
            }

          
          />
<Route path="/dashboard/profile" element={<UserProfilePage />} />
<Route path="/dashboard/bookings" element={<UserBookingsTable/>} />
<Route path="/dashboard/favorites" element={<UserFavoriteSaunas />} />
<Route path="/user/*" element={<><Navbar isUser={true} /><UserDashboard /></>} />



        </Routes>
  <FeedbackBotWrapper />
        {showLoginModal && (
  <Login
    onClose={() => setShowLoginModal(false)}
    goToSignup={() => {
      setShowLoginModal(false);
      // You can route to signup or open another modal if needed
    }}
  />
)}

   <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4">
          © {new Date().getFullYear()} SaunaStay. All rights reserved.{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
        </footer>

      </Router>
    </SaunaProvider>
    </AuthProvider>
    </div>
  );
}

export default App;
