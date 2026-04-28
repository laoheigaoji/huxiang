import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Star, MessageCircle, User, Bell, ChevronLeft, Search, SlidersHorizontal, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Follow from './pages/Follow';
import Message from './pages/Message';
import MessageDetail from './pages/MessageDetail';
import PredictionDetail from './pages/PredictionDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import FAQ from './pages/FAQ';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';
import Footprints from './pages/Footprints';
import AuthorSearch from './pages/AuthorSearch';
import PartnerJoin from './pages/PartnerJoin';
import AuthorProfile from './pages/AuthorProfile';
import Invite from './pages/Invite';
import TopUp from './pages/TopUp';
import BalanceDetails from './pages/BalanceDetails';
import Withdraw from './pages/Withdraw';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import PublishPrediction from './pages/PublishPrediction';
import AuthorDashboard from './pages/AuthorDashboard';
import BindPhone from './pages/BindPhone';
import RealNameAuth from './pages/RealNameAuth';
import UserAgreement from './pages/UserAgreement';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';

const BottomNav = () => {
  const location = useLocation();
  const tabs = [
    { name: '首页', path: '/', icon: HomeIcon },
    { name: '关注', path: '/follow', icon: Star },
    { name: '消息', path: '/message', icon: MessageCircle },
    { name: '我的', path: '/profile', icon: User },
  ];

  const hideNavPaths = ['/publish', '/admin', '/admin/dashboard', '/login', '/register', '/partner-join', '/author/dashboard', '/profile/bind-phone', '/profile/real-name', '/settings', '/user-agreement', '/privacy-policy', '/about-us'];
  if (hideNavPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 items-center bottom-nav-shadow z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link key={tab.path} to={tab.path} className="flex flex-col items-center">
            <tab.icon className={`w-6 h-6 ${isActive ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            <span className={`text-xs mt-1 ${isActive ? 'text-red-500' : 'text-gray-500'}`}>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = localStorage.getItem('user');
    const publicPaths = ['/login', '/register', '/admin'];
    const isAdminPath = location.pathname.startsWith('/admin');
    
    if (isAdminPath) {
      // For /admin/dashboard, check admin auth
      if (location.pathname === '/admin/dashboard') {
        const isAdminAuth = localStorage.getItem('isAdminAuthenticated');
        if (!isAdminAuth) {
          navigate('/admin');
        }
      }
      return; // Skip standard user auth check for admin paths
    }

    if (!user && !publicPaths.includes(location.pathname)) {
       navigate('/login');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen pb-20 max-w-full overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
            <Route path="/follow" element={<Follow />} />
            <Route path="/message" element={<Message />} />
            <Route path="/message/:id" element={<MessageDetail />} />
            <Route path="/prediction/:id" element={<PredictionDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/profile/bind-phone" element={<BindPhone />} />
            <Route path="/profile/real-name" element={<RealNameAuth />} />
            <Route path="/publish" element={<PublishPrediction />} />
            <Route path="/author/dashboard" element={<AuthorDashboard />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/footprints" element={<Footprints />} />
            <Route path="/author-search" element={<AuthorSearch />} />
            <Route path="/partner-join" element={<PartnerJoin />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/topup" element={<TopUp />} />
            <Route path="/balance-details" element={<BalanceDetails />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/user-agreement" element={<UserAgreement />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about-us" element={<AboutUs />} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
      </div>
  );
};

export default App;
