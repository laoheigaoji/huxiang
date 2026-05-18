import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowRight, AlertCircle, X, Plus, Clock, Check, Headset } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const PublishPrediction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [tempTime, setTempTime] = useState({ h: '00', m: '00', s: '00' });
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    contentTitle: '',
    tags: ['精选推荐', '独家分析'] as string[],
    price: 0,
    isFree: true,
    content: '',
    unlockDuration: '',
    isUnlocked: false,
    result: undefined as '红' | '黑' | undefined,
    time: ''
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        const [profileData, settingsData] = await Promise.all([
          api.getProfile(),
          api.getSettings().catch(() => null)
        ]);
        
        if (!profileData.isAuthor) {
          alert('您还不是认证作者，请先申请入驻');
          navigate('/partner-join');
          return;
        }
        setUser(profileData);
        if (!editId && settingsData?.defaultUnlockDuration) {
          setFormData(prev => ({...prev, unlockDuration: settingsData.defaultUnlockDuration}));
        }

        if (editId) {
          setFetching(true);
          try {
            const pred = await api.getPredictionById(editId);
            setFormData({
              title: pred.title,
              period: pred.period,
              contentTitle: pred.contentTitle || pred.title,
              tags: pred.tags || [],
              price: pred.price || 0,
              isFree: pred.isFree,
              content: pred.content || '',
              unlockDuration: pred.unlockDuration || '',
              isUnlocked: pred.isUnlocked || false,
              result: pred.result,
              time: pred.time
            });
          } catch (err) {
            console.error('Failed to fetch prediction for edit', err);
          } finally {
            setFetching(false);
          }
        }
      } catch (err) {
        navigate('/login');
      }
    };
    initPage();
  }, [navigate, editId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.title || !formData.period) return alert('请填全必填项');
    if (!formData.content) return alert('请填写详情内容');
    
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        authorId: user.authorId,
        authorName: user.nickname || user.username,
        authorAvatar: user.avatar,
      };

      if (editId) {
        await api.updateAuthorPrediction(editId, {
          ...dataToSubmit,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
        alert('修改成功！');
      } else {
        await api.createPrediction({
          ...dataToSubmit,
          authorFans: 0,
          authorRecentRecord: "精选",
          authorStreak: 0,
          time: new Date().toISOString().replace('T', ' ').slice(0, 16),
          viewCount: 0
        });
        alert('发布成功！');
      }
      navigate('/author/dashboard');
    } catch (err) {
      alert(`${editId ? '修改' : '发布'}失败，请重试`);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = prompt('输入标签名称');
    if (tag && !formData.tags.includes(tag)) {
      setFormData({...formData, tags: [...formData.tags, tag]});
    }
  };

  const removeTag = (tag: string) => {
    setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-gray-50 min-h-screen pb-24"
    >
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 ml-8">{editId ? '修改方案' : '发布文章方案'}</h1>
        <button type="button" onClick={() => navigate('/feedback')} className="p-2">
          <Headset className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center p-20 text-gray-400">
          <div className="w-8 h-8 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 pb-32 space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1 h-4 bg-[#d32f2f] rounded-full"></div>
              <h3 className="font-bold text-gray-900">基本信息</h3>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">文章列表标题</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="例如：独家分析 精准推荐"
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">文章期数</label>
                <input 
                  value={formData.period}
                  onChange={e => setFormData({...formData, period: e.target.value})}
                  placeholder="第116期"
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">标签设置</label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(t => (
                    <span key={t} className="bg-red-50 text-[#d32f2f] text-[10px] px-2 py-1 rounded-md flex items-center">
                      {t}
                      <X className="w-2.5 h-2.5 ml-1 cursor-pointer" onClick={() => removeTag(t)} />
                    </span>
                  ))}
                  <button type="button" onClick={addTag} className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1 h-4 bg-[#d32f2f] rounded-full"></div>
              <h3 className="font-bold text-gray-900">定价设置</h3>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">设为免费方案</span>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isFree: !formData.isFree, price: formData.isFree ? 286 : 0})}
                className={`w-12 h-6 rounded-full relative transition-colors ${formData.isFree ? 'bg-[#d32f2f]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isFree ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {!formData.isFree && (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">价格 (金币)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none" 
                  />
                  <span className="absolute right-4 top-3.5 text-sm text-gray-400">币</span>
                </div>
              </div>
            )}

            {!formData.isFree && (
              <div className="pt-2 border-t border-gray-50">
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-tighter">解锁公开倒计时 (HH:MM:SS)</label>
                <div 
                  onClick={() => {
                    const [h, m, s] = (formData.unlockDuration || '00:00:00').split(':');
                    setTempTime({ h: h || '00', m: m || '00', s: s || '00' });
                    setIsTimePickerOpen(true);
                  }}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={formData.unlockDuration ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                    {formData.unlockDuration || '请选择时间'}
                  </span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <p className="mt-1.5 text-[10px] text-gray-400">设定后，文章将在规定时间后自动对所有用户公开。</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1 h-4 bg-[#d32f2f] rounded-full"></div>
              <h3 className="font-bold text-gray-900">方案结果与公开</h3>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">方案结果 (红/黑)</label>
                  <div className="flex space-x-4">
                     {['红', '黑'].map((r) => (
                        <button
                           key={r}
                           type="button"
                           onClick={() => setFormData({...formData, result: r as any})}
                           className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                              formData.result === r 
                                 ? (r === '红' ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-md' : 'bg-gray-900 text-white border-gray-900 shadow-md') 
                                 : 'bg-white text-gray-400 border-gray-200'
                           }`}
                        >
                           {r}
                        </button>
                     ))}
                     <button
                        type="button"
                        onClick={() => setFormData({...formData, result: undefined})}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                           !formData.result ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white text-gray-400 border-gray-200'
                        }`}
                     >
                        未公开
                     </button>
                  </div>
               </div>

               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                     <h4 className="text-sm font-bold text-gray-800">直接公开内容</h4>
                     <p className="text-[10px] text-gray-400">开启后内容将直接对所有人免费公开</p>
                  </div>
                  <button 
                     type="button"
                     onClick={() => setFormData({...formData, isUnlocked: !formData.isUnlocked})}
                     className={`w-12 h-6 rounded-full relative transition-colors ${formData.isUnlocked ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isUnlocked ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>
            </div>
          </div>

          {/* Article Detailed Content */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1 h-4 bg-[#d32f2f] rounded-full"></div>
              <h3 className="font-bold text-gray-900">详情内容</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">详情页文章标题</label>
              <input 
                value={formData.contentTitle}
                onChange={e => setFormData({...formData, contentTitle: e.target.value})}
                placeholder="例如：本期精准分析 助你旗开得胜"
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase">正文内容 (支持富文本编辑器)</label>
              <div className="rich-editor-container">
                <ReactQuill 
                  theme="snow"
                  value={formData.content}
                  onChange={(val) => setFormData({...formData, content: val})}
                  modules={modules}
                  className="bg-gray-50 rounded-xl overflow-hidden min-h-[300px]"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 shrink-0" />
            <p className="text-[11px] text-yellow-700 leading-relaxed">
              严禁发布违法违规、虚假有害等信息。文章发布后将由系统自动审核，违规可能导致账号永久封禁。
            </p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#d32f2f] text-white font-bold h-14 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-center">
                {loading ? (editId ? '正在修改...' : '正在发布...') : (editId ? '保存修改' : '立即发布文章')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </button>
          </div>
        </form>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .rich-editor-container .ql-container {
          min-height: 250px;
          font-size: 14px;
        }
        .rich-editor-container .ql-toolbar {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border-color: #f3f4f6;
          background: #fff;
        }
        .rich-editor-container .ql-container {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          border-color: #f3f4f6;
        }
      `}</style>

      {/* Time Picker Bottom Sheet */}
      <div className="fixed inset-0 z-[60] pointer-events-none">
        {isTimePickerOpen && (
          <div className="absolute inset-0 flex items-end justify-center pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsTimePickerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter">选择公开倒计时</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">设置文章自动公开的时间间隔</p>
                </div>
                <button type="button" onClick={() => setIsTimePickerOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-4 mb-8">
                {[
                  { label: '小时', key: 'h', max: 24 },
                  { label: '分钟', key: 'm', max: 60 },
                  { label: '秒', key: 's', max: 60 }
                ].map((col) => (
                  <div key={col.key} className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">{col.label}</label>
                    <div className="h-48 overflow-y-auto bg-gray-50 rounded-2xl p-2 snap-y scroll-py-2 scrollbar-hide">
                      {Array.from({ length: col.max }).map((_, i) => {
                        const val = i.toString().padStart(2, '0');
                        const isSelected = tempTime[col.key as keyof typeof tempTime] === val;
                        return (
                          <div 
                            key={i}
                            onClick={() => setTempTime({ ...tempTime, [col.key]: val })}
                            className={`h-12 flex items-center justify-center rounded-xl cursor-pointer text-base font-bold transition-all snap-start ${
                              isSelected ? 'bg-[#d32f2f] text-white shadow-lg shadow-red-100 scale-105' : 'text-gray-400 hover:text-gray-900'
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl mb-8 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">当前选择:</span>
                <span className="text-2xl font-black text-[#d32f2f] tracking-widest">
                  {tempTime.h}:{tempTime.m}:{tempTime.s}
                </span>
              </div>

              <button 
                type="button"
                onClick={() => {
                  const duration = `${tempTime.h}:${tempTime.m}:${tempTime.s}`;
                  setFormData({ ...formData, unlockDuration: duration });
                  setIsTimePickerOpen(false);
                }}
                className="w-full bg-[#d32f2f] text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Check className="w-5 h-5 mr-2" />
                确认选择
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PublishPrediction;
