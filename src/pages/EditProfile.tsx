import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setUser(data);
        setNickname(data.nickname);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await api.updateProfile({ nickname });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('保存成功');
      navigate(-1);
    } catch (err) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-gray-400">加载中...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="bg-white min-h-screen pb-12"
    >
      {/* App Header */}
      <div className="bg-[#d32f2f] px-4 py-4 flex items-center justify-center relative shadow-sm">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[17px] font-bold text-white">个人中心</h2>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-white">
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-5 space-y-3.5">
        {/* Nickname */}
        <div className="bg-[#f8f8f8] rounded-[4px] h-[52px] flex items-center px-4">
          <span className="text-[15px] text-gray-800 font-bold w-20 flex-shrink-0">昵称：</span>
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="flex-1 bg-transparent text-[15px] text-gray-800 font-bold focus:outline-none" 
          />
        </div>

        {/* Phone Number */}
        <div className="flex space-x-2">
          <div className="flex-1 bg-[#f8f8f8] rounded-[4px] h-[52px] flex items-center px-4 overflow-hidden">
            <span className="text-[15px] text-gray-800 font-bold w-20 flex-shrink-0">手机号：</span>
            <input 
              type="tel" 
              value={user?.phone || ""} 
              placeholder="未绑定" 
              readOnly
              className="flex-1 bg-transparent text-[15px] text-gray-800 font-bold focus:outline-none opacity-60 truncate" 
            />
          </div>
          <button 
            onClick={() => navigate('/profile/bind-phone')}
            className="w-24 bg-[#e53935] text-white font-bold rounded-[4px] active:scale-95 transition-transform text-[15px] flex-shrink-0"
          >
            {user?.phone ? "修改" : "绑定"}
          </button>
        </div>

        {/* Password */}
        <div className="flex space-x-2">
          <div className="flex-1 bg-[#f8f8f8] rounded-[4px] h-[52px] flex items-center px-4 overflow-hidden">
            <span className="text-[15px] text-gray-800 font-bold w-20 flex-shrink-0">登录密码：</span>
            <input 
              type="password"
              placeholder="******"
              readOnly
              className="flex-1 bg-transparent text-[15px] text-gray-800 font-bold focus:outline-none opacity-60 truncate"
            />
          </div>
          <button 
            onClick={() => navigate('/profile/bind-phone')}
            className="w-24 bg-[#d32f2f] text-white font-bold rounded-[4px] active:scale-95 transition-transform text-[15px] flex-shrink-0"
          >
            设置
          </button>
        </div>

        {/* ID Verification */}
        <div className="flex space-x-2">
          <div className="flex-1 bg-[#f8f8f8] rounded-[4px] h-[52px] flex items-center px-4">
            <span className="text-[15px] text-gray-800 font-bold w-20 flex-shrink-0">实名认证：</span>
            <span className={`flex-1 text-[15px] font-bold ${user?.isRealNameVerified ? 'text-green-600' : 'text-red-600'}`}>
              {user?.isRealNameVerified ? '已认证' : '未认证'}
            </span>
          </div>
          <button 
            onClick={() => navigate('/profile/real-name')}
            className="w-24 bg-[#d32f2f] text-white font-bold rounded-[4px] active:scale-95 transition-transform text-[15px] flex-shrink-0"
          >
             {user?.isRealNameVerified ? '已认证' : '去认证'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-12 left-0 right-0 px-5 z-50">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#d32f2f] text-white font-bold py-[14px] rounded-full text-[17px] shadow-lg shadow-[#d32f2f]/10 active:scale-95 transition-transform disabled:opacity-70"
        >
          {saving ? '正在保存...' : '保存修改'}
        </button>
      </div>

    </motion.div>
  );
};

export default EditProfile;
