import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

const BindPhone = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({ phone });
      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, phone }));
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="px-6 pt-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">绑定手机号</h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">请填写手机号和验证码</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 mt-16 space-y-8">
        <div className="relative">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-[20px] px-6 py-5 focus:ring-2 focus:ring-red-500 text-lg font-medium placeholder-gray-300"
            placeholder="请输入手机号"
          />
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-[20px] px-6 py-5 focus:ring-2 focus:ring-red-500 text-lg font-medium placeholder-gray-300"
            placeholder="请输入短信验证码"
          />
          <button 
            type="button" 
            className="absolute right-4 text-red-500 font-bold border border-red-500 px-4 py-1.5 rounded-full text-xs active:scale-95 transition-transform"
          >
            获取验证码
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

        <div className="pt-20">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-5 rounded-full text-xl shadow-xl active:scale-[0.98] transition-all disabled:bg-gray-400"
          >
            {loading ? '保存中...' : '确定'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BindPhone;
