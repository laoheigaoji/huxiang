import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, PawPrint, Star, Heart, 
  Headset, Handshake, Download, Settings, 
  HelpCircle, ArrowRight, X, MoreHorizontal, 
  Gift, Mail, ArrowUpRight, FileText, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const ProfileMenuItem = ({ icon: Icon, label, color, bgColor, path }: { icon: any, label: string, color: string, bgColor: string, path?: string }) => (
  <Link to={path || '#'} className="flex flex-col items-center justify-center py-4 cursor-pointer active:opacity-70 transition-opacity">
    <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center mb-2 shadow-sm`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-[12px] text-gray-700 font-medium">{label}</span>
  </Link>
);

const ServiceItem = ({ icon: Icon, label, path, target }: { icon: any, label: string, path?: string, target?: string }) => {
  const isExternal = path?.startsWith('http') || path?.startsWith('mailto:');
  return isExternal ? (
    <a href={path || '#'} target={target || "_blank"} className="flex flex-col items-center justify-center py-4 cursor-pointer active:opacity-70 transition-opacity">
      <Icon className="w-7 h-7 text-gray-800 mb-2" strokeWidth={1.5} />
      <span className="text-[12px] text-gray-600 font-medium">{label}</span>
    </a>
  ) : (
    <Link to={path || '#'} className="flex flex-col items-center justify-center py-4 cursor-pointer active:opacity-70 transition-opacity">
      <Icon className="w-7 h-7 text-gray-800 mb-2" strokeWidth={1.5} />
      <span className="text-[12px] text-gray-600 font-medium">{label}</span>
    </Link>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userData, apps, settingsData] = await Promise.all([
          api.getProfile(),
          api.getAdminApplications().catch(() => []),
          api.getSettings().catch(() => null)
        ]);
        setUser(userData);
        setSettings(settingsData);
        const userApp = apps.find((a: any) => a.userId === userData.id);
        setApplication(userApp);
      } catch (err: any) {
        console.error('Failed to fetch profile', err);
        if (err.message.includes('User not found') || err.message.includes('未登录')) {
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-4 border-[#b71c1c] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-gray-50 min-h-screen pb-0"
    >
      {/* Header Profile Section */}
      <div className="relative pt-12 pb-12 bg-white overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e1f5fe]/60 via-white/40 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#e3f2fd] to-white/0 opacity-60"></div>
        
        <div className="relative z-10 px-6 flex items-start justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={user?.avatar} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover" 
              />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{user?.nickname || user?.username}</h2>
              <div className="text-xs text-gray-500 mt-1 font-medium">ID: {user?.id}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium truncate">引荐达人: {user?.referrerNickname || '无'}</div>
            </div>
          </div>
          <Link to="/profile/edit" className="bg-[#6ec9f9] text-white text-[11px] px-4 py-1.5 rounded-full font-bold shadow-sm active:scale-95 transition-transform mt-2 ml-4 shrink-0">
            点击编辑资料
          </Link>
        </div>

        {/* Balance Display */}
        <div className="relative z-10 grid grid-cols-3 gap-3 px-6 mt-10">
          <div className="bg-white/60 p-4 rounded-2xl text-center shadow-sm border border-white">
            <div className="text-[10px] text-gray-400 font-black uppercase mb-1">账户余额</div>
            <div className="text-xl font-black text-gray-900">¥{user?.balance?.toFixed(2) || '0.00'}</div>
            <Link to="/topup" className="inline-block mt-3 bg-[#b71c1c] text-white text-[10px] px-4 py-1 rounded-full font-bold shadow-md active:scale-95 transition-transform">
              充值
            </Link>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl text-center shadow-sm border border-white">
            <div className="text-[10px] text-gray-400 font-black uppercase mb-1">邀请收益</div>
            <div className="text-xl font-black text-gray-900">¥{(user?.totalInvitedEarnings || 0).toFixed(2)}</div>
            <Link to="/invite" className="inline-block mt-3 bg-orange-500 text-white text-[10px] px-4 py-1 rounded-full font-bold shadow-md active:scale-95 transition-transform">
              去邀请
            </Link>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl text-center shadow-sm border border-white">
            <div className="text-[10px] text-gray-400 font-black uppercase mb-1">累计收益</div>
            <div className="text-xl font-black text-gray-900">¥{(user?.totalEarnings || 0).toFixed(2)}</div>
            <Link to="/balance-details" className="inline-block mt-3 bg-blue-500 text-white text-[10px] px-4 py-1 rounded-full font-bold shadow-md active:scale-95 transition-transform">
              明细
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Actions */}
      <div className="px-4 -mt-2 relative z-20 space-y-3">
        {/* Bento Grid Quick Actions */}
        <div className="flex gap-4">
          <Link 
            to={user?.isAuthor ? "/publish" : "/partner-join"} 
            className="flex-1 bg-[#dff3ff] p-4 rounded-2xl relative overflow-hidden h-24 flex flex-col justify-between shadow-sm"
          >
            <div className="relative z-10">
              <h3 className="text-[#3b82f6] font-bold text-lg leading-tight">发文方案</h3>
              <p className="text-[10px] text-blue-400 mt-0.5 font-medium">
                {user?.isAuthor ? "发布方案，极速盈利" : "入驻作者，分享盈利"}
              </p>
            </div>
            <div className="flex items-center text-[10px] text-blue-400 font-bold relative z-10">
              {user?.isAuthor ? "去发文" : "申请入驻"} <ArrowRight className="w-3 h-3 ml-1" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center shadow-sm">
               <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </Link>

          <Link to="/invite" className="flex-1 bg-[#fff8e1] p-4 rounded-2xl relative overflow-hidden h-24 flex flex-col justify-between shadow-sm">
            <div className="relative z-10">
              <h3 className="text-[#ffa000] font-bold text-lg leading-tight">分享邀请</h3>
              <p className="text-[10px] text-amber-500/60 mt-0.5 font-medium">分享好料，邀请好友</p>
            </div>
            <div className="flex items-center text-[10px] text-amber-500 font-bold relative z-10">
              去分享 <ArrowRight className="w-3 h-3 ml-1" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12">
               <Gift className="w-12 h-12 text-[#ffd54f] opacity-90" strokeWidth={1} />
            </div>
          </Link>
        </div>

        {/* My Records Section */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
          <div className="px-5 py-4">
            <h3 className="font-bold text-gray-900 text-lg">我的记录</h3>
          </div>
          
          <div className="grid grid-cols-4 px-2 pb-2">
            <ProfileMenuItem 
              icon={ClipboardList} 
              label="我的订单" 
              color="text-blue-500" 
              bgColor="bg-blue-50" 
              path="/orders"
            />
            <ProfileMenuItem 
              icon={PawPrint} 
              label="浏览足迹" 
              color="text-[#00c853]" 
              bgColor="bg-green-50" 
              path="/footprints"
            />
            <ProfileMenuItem 
              icon={Star} 
              label="关注列表" 
              color="text-amber-400" 
              bgColor="bg-amber-50" 
              path="/follow"
            />
            <ProfileMenuItem 
              icon={Heart} 
              label="邀请记录" 
              color="text-rose-400" 
              bgColor="bg-rose-50" 
              path="/invite"
            />
          </div>

          <div className="grid grid-cols-4 px-2 pb-6">
            <ServiceItem icon={Headset} label="平台客服" path={settings?.contactLink || `mailto:${settings?.contactEmail || 'admin@example.com'}`} />
            <ServiceItem icon={FileText} label="意见反馈" path="/feedback" />
            <ServiceItem 
              icon={user?.isAuthor ? ClipboardList : Handshake} 
              label={
                user?.isAuthor 
                  ? "文章管理" 
                  : (application 
                    ? (application.status === 'pending' ? "审核中" : (application.status === 'rejected' ? "已拒绝" : "已入驻")) 
                    : "入驻合作")
              } 
              path={user?.isAuthor ? "/author/dashboard" : "/partner-join"} 
            />
            <ServiceItem icon={Download} label="下载APP" path={settings?.downloadLink || '#'} />
            <ServiceItem icon={Settings} label="系统设置" path="/settings" />
            <ServiceItem icon={HelpCircle} label="常见问题" path="/faq" />
          </div>
        </div>

        {/* Bottom Promotion Banner */}
        <div className="h-24 bg-gradient-to-r from-[#81d4fa] via-[#e1f5fe] to-[#f8bbd0] rounded-[24px] p-6 relative overflow-hidden flex items-center shadow-sm">
          <div className="relative z-10">
            <h4 className="text-2xl font-black text-white italic tracking-tight italic">
              发文章 享好料
            </h4>
            <p className="text-[10px] text-white font-bold tracking-widest mt-1 opacity-90 uppercase">
              智选精研·智料汇享
            </p>
          </div>
          <div className="ml-auto relative z-10">
            <div className="w-12 h-12 bg-white/30 rounded-full border border-white/60 flex items-center justify-center backdrop-blur-md shadow-md">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;
