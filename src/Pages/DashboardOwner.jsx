import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DashboardOwner = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [saunas, setSaunas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const saunaQuery = query(collection(db, 'saunas'), where('ownerEmail', '==', user.email));
        const saunaSnap = await getDocs(saunaQuery);
        const saunaList = saunaSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSaunas(saunaList);

        const bookingSnap = await getDocs(collection(db, 'bookings'));
        const ownerBookings = bookingSnap.docs
          .map(doc => doc.data())
          .filter(b => saunaList.some(s => s.id === b.saunaId));
        setBookings(ownerBookings);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <p className="text-center mt-10 text-gray-500">{t('dashboardOwner.loading')}</p>;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const weeklyBookings = bookings.filter(b => new Date(b.date) >= new Date()).slice(0, 7);

  const placeholderChartData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
    day,
    bookings: 0,
    revenue: 0,
  }));

  const bookingsPerDay = placeholderChartData.map((d) => {
    const dayBookings = bookings.filter(
      (b) => new Date(b.date).toLocaleDateString('en-US', { weekday: 'short' }) === d.day
    );
    const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    return { ...d, bookings: dayBookings.length, revenue: Math.round(dayRevenue) };
  });

  const ownerName = saunas[0]?.hostName || user?.email?.split('@')[0];

  return (
    <div className="bg-[#f5efe6] min-h-screen p-4 sm:p-6 font-serif">
      <h1 className="text-2xl font-bold text-[#243a26] mb-1">
        👋 {t('dashboardOwner.greeting', { name: ownerName })}
      </h1>
      <p className="text-[#4d603e] mb-6">{t('dashboardOwner.intro')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div onClick={() => navigate('/owner/saunas')} className="bg-[#f1d2a2] p-4 rounded shadow text-center cursor-pointer hover:shadow-lg transition">
          <div className="text-3xl">📋</div>
          <div className="text-lg font-semibold mt-2">{saunas.length}</div>
          <div className="text-sm text-gray-600">{t('dashboardOwner.totalSaunas')}</div>
        </div>
        <div onClick={() => navigate('/owner/ManageBookings')} className="bg-[#f1d2a2] p-4 rounded shadow text-center cursor-pointer hover:shadow-lg transition">
          <div className="text-3xl">📅</div>
          <div className="text-lg font-semibold mt-2">{weeklyBookings.length}</div>
          <div className="text-sm text-gray-600">{t('dashboardOwner.upcomingBookings')}</div>
        </div>
        <div  onClick={() => navigate('/owner/Revenue')} className="bg-[#f1d2a2] p-4 rounded shadow text-center cursor-pointer hover:shadow-lg transition">
          <div className="text-3xl">💶</div>
          <div className="text-lg font-semibold mt-2">{totalRevenue}</div>
          <div className="text-sm text-gray-600">{t('dashboardOwner.totalRevenue')}</div>
        </div>
        <div onClick={() => navigate('/owner/OwnerProfile')} className="bg-[#f1d2a2] p-4 rounded shadow text-center cursor-pointer hover:shadow-lg transition">
          <div className="text-3xl">⚙️</div>
          <div className="text-lg font-semibold mt-2">2</div>
          <div className="text-sm text-gray-600">{t('dashboardOwner.profileSettings')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#f3dcb9] p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-[#243a26] mb-3">📦 {t('dashboardOwner.bookingsChart')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bookingsPerDay}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#b67342" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#f3dcb9] p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-[#243a26] mb-3">💶 {t('dashboardOwner.revenueChart')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bookingsPerDay}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="revenue" stroke="#4d603e" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardOwner;
