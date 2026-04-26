import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, MoreHorizontal, Headset, Info, CheckCircle2, AlertTriangle, User, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

const PartnerJoin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('author'); // 'author' or 'agent'
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    specialty: '',
    description: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        if (data.isAuthor) {
          navigate('/author/dashboard');
          return;
        }
        setUser(data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.applyForAuthor({
        userId: user.id,
        username: user.username,
        type: selectedType,
        ...formData
      });
      setStep(4); // Success step
    } catch (err) {
      alert('申请提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="mt-4 px-4 space-y-4">
            {/* Section: Account Information */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 flex items-center bg-[#fff8f8]">
                <div className="w-1 h-4 bg-[#e53935] rounded-full mr-2"></div>
                <h3 className="text-[15px] font-bold text-[#b71c1c]">账号信息</h3>
              </div>
              <div className="p-4 flex items-center justify-between relative">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center text-[14px]">
                    <span className="text-gray-400 w-24">用户昵称</span>
                    <span className="text-gray-800 font-medium ml-4">{user?.nickname}</span>
                  </div>
                  <div className="flex items-center text-[14px]">
                    <span className="text-gray-400 w-24">用户ID</span>
                    <span className="text-gray-800 font-medium ml-4">{user?.id}</span>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img 
                    src={user?.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>

            {/* Section: Cooperation Type */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 flex items-center justify-between bg-[#fff8f8]">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-[#e53935] rounded-full mr-2"></div>
                  <h3 className="text-[15px] font-bold text-[#b71c1c]">合作类型</h3>
                </div>
              </div>
              
              <div className="px-4 py-2">
                <div 
                  className="py-5 flex items-center border-b border-gray-50 cursor-pointer"
                  onClick={() => setSelectedType('author')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${selectedType === 'author' ? 'border-[#e53935]' : 'border-gray-200'}`}>
                    {selectedType === 'author' && <div className="w-3 h-3 bg-[#e53935] rounded-full"></div>}
                  </div>
                  <div className="flex items-center">
                    <span className="text-[16px] font-bold text-gray-800 mr-2">优质作者</span>
                    <span className="text-[13px] text-gray-400">(分享个人优质内容观点)</span>
                  </div>
                </div>

                <div 
                  className="py-5 flex items-center cursor-pointer"
                  onClick={() => setSelectedType('agent')}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${selectedType === 'agent' ? 'border-[#e53935]' : 'border-gray-200'}`}>
                    {selectedType === 'agent' && <div className="w-3 h-3 bg-[#e53935] rounded-full"></div>}
                  </div>
                  <div className="flex items-center">
                    <span className="text-[16px] font-bold text-gray-800 mr-2">合作代理</span>
                    <span className="text-[13px] text-gray-400">(代理商家粉丝团队模式)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mt-4 px-4 space-y-4">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
              <div className="flex items-center">
                <div className="w-1 h-4 bg-[#e53935] rounded-full mr-2"></div>
                <h3 className="text-[15px] font-bold text-[#b71c1c]">基本信息</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
                  <input 
                    type="text" 
                    value={formData.realName}
                    onChange={(e) => setFormData({...formData, realName: e.target.value})}
                    placeholder="请输入真实姓名"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">擅长领域</label>
                  <input 
                    type="text" 
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="如：英超、亚盘专家"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介/经历</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="简要描述您的预测经历或优势"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500 outline-none resize-none" 
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mt-4 px-4 pt-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Send className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">确认提交吗？</h3>
            <p className="text-gray-500 text-center px-10 text-sm leading-relaxed">
              提交后我们将会在1-3个工作日内完成审核。审核结果将通过站内信通知您。
            </p>
          </div>
        );
      case 4:
        return (
          <div className="mt-4 px-4 pt-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">申请已提交</h3>
            <p className="text-gray-500 text-center px-10 text-sm leading-relaxed mb-10">
              您的申请正在审核中，请耐心等待。
            </p>
            <button 
              onClick={() => navigate('/profile')}
              className="px-10 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg"
            >
              返回个人中心
            </button>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="bg-[#fff9f9] min-h-screen pb-12"
    >
      <div className="bg-gradient-to-b from-[#d32f2f] to-[#e53935] px-4 py-8 flex flex-col items-center relative shadow-md">
        <div className="w-full flex items-center justify-between text-white mb-6">
          <ChevronLeft className="w-7 h-7 cursor-pointer" onClick={() => navigate(-1)} />
          <h2 className="text-xl font-bold">入驻合作</h2>
          <Headset className="w-6 h-6 cursor-pointer" />
        </div>

        <div className="w-full max-w-xs flex items-center justify-between relative px-2 mb-2">
          <div className="absolute top-3 left-8 right-8 h-[1px] bg-white/30 z-0"></div>
          
          {[1, 2, 3].map(s => (
            <div key={s} className="flex flex-col items-center z-10 transition-all duration-300">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${step >= s ? 'bg-white text-[#e53935]' : 'bg-white/30 text-white'}`}>
                {s}
              </div>
              <span className={`text-[11px] font-medium ${step >= s ? 'text-white' : 'text-white/60'}`}>
                {s === 1 ? '合作类型' : s === 2 ? '基本信息' : '提交申请'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={step}
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -10 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {step < 4 && (
        <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
          <button 
            disabled={loading}
            onClick={() => {
              if (step === 3) handleSubmit();
              else setStep(step + 1);
            }}
            className="w-full bg-[#d32f2f] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-red-100 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? '提交中...' : step === 3 ? '立即提交' : '下一步'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PartnerJoin;
