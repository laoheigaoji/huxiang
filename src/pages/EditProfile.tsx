import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, X, MoreHorizontal, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setUser(data);
        setNickname(data.nickname);
        setAvatar(data.avatar);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    setUploading(true);
    try {
      // 1. Get Qiniu Token
      const { token, domain } = await api.getQiniuToken();
      
      // 2. Prepare FormData
      const formData = new FormData();
      const key = `avatar/${Date.now()}-${file.name}`;
      formData.append('file', file);
      formData.append('token', token);
      formData.append('key', key);

      // 3. Upload to Qiniu (using the correct region endpoint for your bucket)
      const res = await fetch('https://up-z2.qiniup.com', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      if (res.ok && result.key) {
        const avatarUrl = domain.startsWith('http') ? `${domain}/${result.key}` : `https://${domain}/${result.key}`;
        setAvatar(avatarUrl);
      } else {
        console.error('Qiniu Upload Error Result:', result);
        throw new Error(result.error || '上传失败');
      }
    } catch (err: any) {
      console.error('Upload failed full error:', err);
      alert(`头像上传失败: ${err.message || '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await api.updateProfile({ nickname, avatar });
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
        <div 
          onClick={handleAvatarClick}
          className="w-24 h-24 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-2 border-white relative cursor-pointer group"
        >
          <img 
            src={avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"} 
            alt="Avatar" 
            className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`} 
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        <p className="text-gray-400 text-xs mt-3 font-medium">点击更换头像</p>
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
