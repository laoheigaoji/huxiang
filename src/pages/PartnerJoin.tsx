import React, { useState, useEffect } from 'react';
import { ChevronLeft, Headset, CheckCircle2, User, Send, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

const PartnerJoin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('author'); // 'author' or 'agent'
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    phone: '',
    idType: '身份证',
    idNumber: '',
    hometown: '',
    specialty: '',
    description: '',
    photoFront: '',
    photoBack: ''
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

  const handleFileUpload = (type: 'photoFront' | 'photoBack') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('照片大小不能超过5M');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.realName || !formData.phone || !formData.idNumber || !formData.hometown) {
      alert('请填写完整的必填身份信息');
      return;
    }
    
    if (!agreementAccepted) {
      alert('请阅读并同意用户服务协议');
      return;
    }
    
    setLoading(true);
    try {
      await api.applyForAuthor({
        userId: user.id,
        username: user.username,
        type: selectedType,
        ...formData
      });
      setStep(3); // Success step
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
            {/* Account Information Card - Image 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 flex items-center border-b border-gray-50">
                <div className="w-1 h-4 bg-[#d32f2f] rounded-full mr-2"></div>
                <h3 className="text-[17px] font-black text-[#d32f2f]">账号信息</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center text-[15px]">
                    <span className="text-gray-400 w-24 font-bold">用户昵称</span>
                    <span className="text-gray-800 font-black">{user?.nickname || '全村人的希望'}</span>
                  </div>
                  <div className="flex items-center text-[15px]">
                    <span className="text-gray-400 w-24 font-bold">用户ID</span>
                    <span className="text-gray-800 font-black">{user?.id || '967'}</span>
                  </div>
                  <div className="flex items-center text-[15px]">
                    <span className="text-gray-400 w-24 font-bold">手机号</span>
                    <span className="text-gray-800 font-black">{user?.phone || '暂无'}</span>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                  <img 
                    src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>

            {/* Cooperation Type Card - Image 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-[#d32f2f] rounded-full mr-2"></div>
                  <h3 className="text-[17px] font-black text-[#d32f2f]">合作类型</h3>
                </div>
                <span className="text-[11px] text-[#d32f2f] font-bold">每个账号仅能申请一种类型</span>
              </div>
              
              <div className="px-4 py-2">
                <div 
                  className="py-6 flex items-center border-b border-gray-50 cursor-pointer"
                  onClick={() => setSelectedType('author')}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${selectedType === 'author' ? 'border-[#d32f2f]' : 'border-gray-200'}`}>
                    {selectedType === 'author' && <div className="w-3 h-3 bg-[#d32f2f] rounded-full"></div>}
                  </div>
                  <div className="flex items-center">
                    <span className="text-[16px] font-black text-gray-800 mr-2">优质作者</span>
                    <span className="text-[13px] text-gray-400 font-medium">(分享个人优质内容观点)</span>
                  </div>
                </div>

                <div 
                  className="py-6 flex items-center cursor-pointer"
                  onClick={() => setSelectedType('agent')}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-4 ${selectedType === 'agent' ? 'bg-[#d32f2f] border-2 border-[#d32f2f]' : 'border-2 border-gray-200'}`}>
                    {selectedType === 'agent' && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
                  </div>
                  <div className="flex items-center">
                    <span className="text-[16px] font-black text-gray-800 mr-2">合作代理</span>
                    <span className="text-[13px] text-gray-400 font-medium">(代理商家粉丝团队模式)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center py-4">
              <div className="flex items-center text-[14px] font-bold text-gray-400">
                <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-white text-[12px] mr-2">?</div>
                <span>如有疑问，请</span>
                <span className="text-[#d32f2f] mx-1 cursor-pointer" onClick={() => navigate('/feedback')}>咨询客服</span>
                <span>处理</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mt-4 px-4 space-y-4 pb-32">
            {/* Enterprise Type Selection - Image 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-4 flex items-center border-b border-gray-50">
                <div className="w-1 h-5 bg-[#d32f2f] rounded-full mr-3"></div>
                <h3 className="text-[17px] font-black text-[#d32f2f]">企业类型选择</h3>
              </div>
              <div className="p-5 flex items-center">
                <span className="text-[15px] font-bold text-gray-700 mr-6 tracking-tight"><span className="text-[#d32f2f] mr-1 text-lg font-black">*</span>类型选择</span>
                <div className="flex items-center">
                   <div className="w-5 h-5 rounded-full bg-[#d32f2f] flex items-center justify-center mr-2">
                     <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                   </div>
                   <span className="text-[15px] font-black text-gray-800">个人</span>
                </div>
              </div>
            </div>

            {/* Personal Identity Info - Image 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-4 flex items-center border-b border-gray-50 relative">
                <div className="w-1 h-5 bg-[#d32f2f] rounded-full mr-3"></div>
                <h3 className="text-[17px] font-black text-[#d32f2f]">个人身份信息</h3>
                <span className="absolute right-4 text-[11px] text-orange-400 font-bold bg-orange-50 px-2 py-0.5 rounded">选填:个人身份信息(输入通过率更高)</span>
              </div>
              
              <div className="px-4">
                <div className="flex items-center border-b border-gray-50 py-5">
                  <span className="w-24 text-[15px] font-bold text-gray-700"><span className="text-[#d32f2f] mr-0.5">*</span> 姓名</span>
                  <input 
                    type="text" 
                    value={formData.realName}
                    onChange={(e) => setFormData({...formData, realName: e.target.value})}
                    placeholder="请输入"
                    className="flex-1 text-[15px] outline-none font-bold text-gray-800 placeholder:text-gray-300"
                  />
                </div>
                <div className="flex items-center border-b border-gray-50 py-5">
                  <span className="w-24 text-[15px] font-bold text-gray-700"><span className="text-[#d32f2f] mr-0.5">*</span> 手机号</span>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="请输入个人手机号"
                    className="flex-1 text-[15px] outline-none font-bold text-gray-800 placeholder:text-gray-300"
                  />
                </div>
                <div className="flex items-center border-b border-gray-50 py-5 relative">
                  <span className="w-24 text-[15px] font-bold text-gray-700"><span className="text-[#d32f2f] mr-0.5">*</span> 证件类型</span>
                  <div className="flex-1 flex justify-between items-center text-[15px] font-medium text-gray-800">
                    <span className="font-bold text-gray-700">{formData.idType}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center border-b border-gray-50 py-5">
                  <span className="w-24 text-[15px] font-bold text-gray-700"><span className="text-[#d32f2f] mr-0.5">*</span> 证件号</span>
                  <input 
                    type="text" 
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    placeholder="请输入证件号码"
                    className="flex-1 text-[15px] outline-none font-bold text-gray-800 placeholder:text-gray-300"
                  />
                </div>
                <div className="flex items-center py-5">
                  <span className="w-24 text-[15px] font-bold text-gray-700"><span className="text-[#d32f2f] mr-0.5">*</span> 户籍所在地</span>
                  <input 
                    type="text" 
                    value={formData.hometown}
                    onChange={(e) => setFormData({...formData, hometown: e.target.value})}
                    placeholder="请输入户籍所在地"
                    className="flex-1 text-[15px] outline-none font-bold text-gray-800 placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* ID Photo Upload - Image 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-4 flex items-center border-b border-gray-50 relative">
                <div className="w-1 h-5 bg-white rounded-full mr-3"></div>
                <h3 className="text-[16px] font-black text-gray-800">上传身份证照片</h3>
                <span className="ml-2 text-[12px] text-orange-400 font-bold">可选/上传通过率更高</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="aspect-[1.5/1] bg-[#f9fbfd] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden active:bg-gray-100 transition-all cursor-pointer"
                      onClick={() => document.getElementById('photoFront')?.click()}
                    >
                       <input 
                         id="photoFront"
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleFileUpload('photoFront')}
                       />
                       {formData.photoFront ? (
                         <img src={formData.photoFront} alt="正面" className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <div className="w-14 h-10 bg-white rounded shadow-sm border border-gray-100 flex items-center justify-center mb-2 relative">
                             <div className="w-6 h-6 bg-blue-50/50 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-300" />
                             </div>
                             <div className="absolute top-1 right-2 w-4 h-1 bg-gray-100 rounded-full"></div>
                             <div className="absolute bottom-2 right-2 w-6 h-1 bg-gray-100 rounded-full"></div>
                           </div>
                           <span className="text-[13px] font-black text-gray-400">上传人像面</span>
                         </>
                       )}
                       <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-100"></div>
                       <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-100"></div>
                       <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-100"></div>
                       <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-100"></div>
                    </div>
                    <div 
                      className="aspect-[1.5/1] bg-[#f9fbfd] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden active:bg-gray-100 transition-all cursor-pointer"
                      onClick={() => document.getElementById('photoBack')?.click()}
                    >
                       <input 
                         id="photoBack"
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleFileUpload('photoBack')}
                       />
                       {formData.photoBack ? (
                         <img src={formData.photoBack} alt="反面" className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <div className="w-14 h-10 bg-white rounded shadow-sm border border-gray-100 flex items-center justify-center mb-2 relative">
                             <div className="w-5 h-5 bg-red-50/50 rounded-full border border-red-100/50 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                             </div>
                           </div>
                           <span className="text-[13px] font-black text-gray-400">上传国徽面</span>
                         </>
                       )}
                       <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-100"></div>
                       <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-100"></div>
                       <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-100"></div>
                       <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-100"></div>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center py-2">
              <div className="flex items-center text-[14px] font-bold text-gray-400">
                <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center text-white text-[12px] mr-2">?</div>
                <span>如有疑问，请</span>
                <span className="text-[#d32f2f] mx-1 cursor-pointer" onClick={() => navigate('/feedback')}>咨询客服</span>
                <span>处理</span>
              </div>
            </div>

            {/* 温馨提示 - Image 3 */}
            <div className="bg-[#fffdf2] rounded-xl p-5 border border-orange-50 shadow-sm">
               <div className="flex items-center mb-4">
                 <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center mr-2">
                   <span className="text-white text-xs font-black">!</span>
                 </div>
                 <span className="text-[16px] font-black text-orange-600">温馨提示</span>
               </div>
               <div className="space-y-4">
                 <div className="flex gap-2">
                   <span className="text-orange-400 font-bold text-[14px]">1、</span>
                   <p className="text-[14px] text-gray-500 font-bold leading-relaxed">
                     <span className="text-orange-400">个人信息</span>请确保姓名、身份证号、手机号真实有效。
                   </p>
                 </div>
                 <div className="flex gap-2">
                   <span className="text-orange-400 font-bold text-[14px]">2、</span>
                   <p className="text-[14px] text-gray-500 font-bold leading-relaxed">
                     <span className="text-orange-400">证件上传</span>上传身份证照片可提高审核通过率。
                   </p>
                 </div>
                 <div className="flex gap-2">
                   <span className="text-orange-400 font-bold text-[14px]">3、</span>
                   <p className="text-[14px] text-gray-500 font-bold leading-relaxed">
                     <span className="text-orange-400">审核时效</span>申请提交后，审核结果将在<span className="text-orange-400">3个工作日内</span>通过系统通知告知，请耐心等待。
                   </p>
                 </div>
               </div>
            </div>

            <div className="flex items-center justify-center space-x-2 pt-4">
              <div 
                onClick={() => setAgreementAccepted(!agreementAccepted)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${agreementAccepted ? 'bg-[#d32f2f] border-[#d32f2f]' : 'border-gray-300'}`}
              >
                {agreementAccepted && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
              </div>
              <p className="text-[13px] text-gray-500 font-bold">
                已阅读并同意 <span className="text-[#d32f2f]">《用户服务协议》</span>
              </p>
            </div>
          </div>
        );
      case 3:
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
       default: return null;
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
          <h2 className="text-xl font-bold">申请入驻</h2>
          <Headset className="w-6 h-6 cursor-pointer" onClick={() => navigate('/feedback')} />
        </div>

        <div className="w-full max-w-xs flex items-center justify-between relative px-2 mb-2">
          <div className="absolute top-3 left-8 right-8 h-[1px] bg-white/30 z-0"></div>
          
          {[1, 2, 3].map(s => (
            <div key={s} className="flex flex-col items-center z-10 transition-all duration-300">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${step >= s ? 'bg-white text-[#e53935]' : 'bg-white/30 text-white'}`}>
                {s}
              </div>
              <span className={`text-[11px] font-medium ${step >= s ? 'text-white' : 'text-white/60'}`}>
                {s === 1 ? '合作类型' : s === 2 ? '身份认证' : '审核入驻'}
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

      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 flex space-x-3">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl transition-all active:scale-95"
            >
              上一步
            </button>
          )}
          <button 
            disabled={loading}
            onClick={() => {
              if (step === 2) {
                if (loading) return;
                handleSubmit();
              } else {
                setStep(step + 1);
              }
            }}
            className={`font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${step === 2 ? 'flex-[2] bg-[#d32f2f] text-white shadow-red-100' : 'w-full bg-[#d32f2f] text-white shadow-red-100'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                提交中...
              </div>
            ) : step === 2 ? '立即申请' : '下一步'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PartnerJoin;
