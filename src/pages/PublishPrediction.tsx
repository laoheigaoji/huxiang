import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowRight, Save, Image as ImageIcon, Plus, Trash2, Tag, AlertCircle, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const PublishPrediction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    contentTitle: '',
    tags: ['精选推荐', '独家分析'] as string[],
    price: 0,
    isFree: true,
    content: '',
    contentPicks: [] as string[],
    contentColors: [] as ('red' | 'blue')[],
    mainPicks: [] as number[],
    mainZodiacs: [] as string[],
    ballColors: [] as ('red' | 'blue')[],
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
              contentTitle: pred.contentTitle,
              tags: pred.tags || [],
              price: pred.price || 0,
              isFree: pred.isFree,
              content: pred.content || '',
              contentPicks: pred.contentPicks || (pred.content ? pred.content.split(/[\s,，、]+/).filter(Boolean) : []),
              contentColors: pred.contentColors || (pred.content ? pred.content.split(/[\s,，、]+/).filter(Boolean).map(() => 'red') : []),
              mainPicks: pred.mainPicks || [],
              mainZodiacs: pred.mainZodiacs || [],
              ballColors: pred.ballColors || (pred.mainPicks ? pred.mainPicks.map(() => 'red') : []),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.period) return alert('请填全必填项');
    
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        content: formData.contentPicks.join(' '), // Keep for legacy compatibility
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
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 mr-8">{editId ? '修改方案' : '发布文章方案'}</h1>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-1 h-4 bg-[#d32f2f] rounded-full"></div>
            <h3 className="font-bold text-gray-900">基本信息</h3>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">文章标题</label>
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
              <div className="relative">
                <input 
                  value={formData.unlockDuration}
                  onChange={e => setFormData({...formData, unlockDuration: e.target.value})}
                  placeholder="例如：01:25:20"
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none" 
                />
                <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-bold">必填</span>
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">设定后，文章将在规定时间后自动对所有用户公开。</p>
            </div>
          )}
        </div>

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
                     <p className="text-[10px] text-gray-400">开启后方案内容将对所有人免费公开，无需付费或等待</p>
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

        {/* Content */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-1 h-4 bg-[#d32f2f] rounded-full"></div>
            <h3 className="font-bold text-gray-900">详细分析</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">正文小标题</label>
            <input 
              value={formData.contentTitle}
              onChange={e => setFormData({...formData, contentTitle: e.target.value})}
              placeholder="如：精准平特一肖 重点推荐"
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-[#d32f2f] outline-none" 
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-400 uppercase">精选号码与对应生肖</label>
              <button 
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    mainPicks: [...formData.mainPicks, null],
                    mainZodiacs: [...formData.mainZodiacs, ''],
                    ballColors: [...formData.ballColors, 'red']
                  });
                }}
                className="text-[10px] bg-[#d32f2f] text-white px-2 py-1 rounded-md font-bold flex items-center shadow-sm active:scale-95 transition-transform"
              >
                <Plus className="w-3 h-3 mr-1" />
                新增号码
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.mainPicks.map((_, i) => (
                <div key={i} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 relative group">
                  <button 
                    type="button"
                    onClick={() => {
                      const newPicks = [...formData.mainPicks];
                      const newZodiacs = [...formData.mainZodiacs];
                      const newColors = [...formData.ballColors];
                      newPicks.splice(i, 1);
                      newZodiacs.splice(i, 1);
                      newColors.splice(i, 1);
                      setFormData({...formData, mainPicks: newPicks, mainZodiacs: newZodiacs, ballColors: newColors});
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-col items-center space-y-3">
                    {/* Ball & Type Toggle */}
                    <div className="flex items-center space-x-3 w-full justify-center">
                      <div className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center relative transition-colors ${formData.ballColors[i] === 'blue' ? 'bg-blue-600 shadow-blue-100' : 'bg-[#ef4444] shadow-red-100'}`}>
                        <input 
                          type="text"
                          value={formData.mainPicks[i] || ''}
                          onChange={e => {
                            const newPicks = [...formData.mainPicks];
                            newPicks[i] = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                            setFormData({...formData, mainPicks: newPicks});
                          }}
                          className="w-full h-full bg-transparent text-white text-center font-bold text-sm outline-none border-none placeholder:text-white/50"
                          placeholder="00"
                        />
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          const newColors = [...formData.ballColors];
                          newColors[i] = newColors[i] === 'red' ? 'blue' : 'red';
                          setFormData({...formData, ballColors: newColors});
                        }}
                        className={`text-[10px] px-2 py-1 rounded border font-bold transition-all ${
                          formData.ballColors[i] === 'blue' 
                            ? 'bg-blue-50 text-blue-600 border-blue-200' 
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                      >
                        {formData.ballColors[i] === 'blue' ? '蓝球' : '红球'}
                      </button>
                    </div>

                    <input 
                      value={formData.mainZodiacs[i] || ''}
                      onChange={e => {
                        const newZodiacs = [...formData.mainZodiacs];
                        newZodiacs[i] = e.target.value;
                        setFormData({...formData, mainZodiacs: newZodiacs});
                      }}
                      placeholder="点此输生肖"
                      className="w-full bg-white border border-gray-100 rounded-lg py-1.5 text-[11px] text-center font-bold text-gray-700 focus:ring-1 focus:ring-[#d32f2f] outline-none shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {formData.mainPicks.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-xs text-gray-400">目前没有任何号码，请点击右上方按钮添加</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-400 uppercase">正文公开号码 (点击按钮添加)</label>
              <button 
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    contentPicks: [...formData.contentPicks, ''],
                    contentColors: [...formData.contentColors, 'red']
                  });
                }}
                className="text-[10px] bg-orange-500 text-white px-2 py-1 rounded-md font-bold flex items-center shadow-sm active:scale-95 transition-transform"
              >
                <Plus className="w-3 h-3 mr-1" />
                新增正文号码
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {formData.contentPicks.map((pick, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 relative group bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                  <button 
                    type="button"
                    onClick={() => {
                      const newPicks = [...formData.contentPicks];
                      const newColors = [...formData.contentColors];
                      newPicks.splice(i, 1);
                      newColors.splice(i, 1);
                      setFormData({...formData, contentPicks: newPicks, contentColors: newColors});
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-colors ${formData.contentColors[i] === 'blue' ? 'bg-blue-600 shadow-blue-100' : 'bg-[#ef4444] shadow-red-100'}`}
                    >
                      <input 
                        type="text"
                        value={pick}
                        onChange={e => {
                          const newPicks = [...formData.contentPicks];
                          newPicks[i] = e.target.value;
                          setFormData({...formData, contentPicks: newPicks});
                        }}
                        className="w-full h-full bg-transparent text-white text-center font-bold text-sm outline-none border-none"
                        placeholder="00"
                      />
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        const newColors = [...formData.contentColors];
                        newColors[i] = newColors[i] === 'red' ? 'blue' : 'red';
                        setFormData({...formData, contentColors: newColors});
                      }}
                      className={`text-[10px] px-1.5 py-1 rounded border font-bold transition-all ${
                        formData.contentColors[i] === 'blue' 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {formData.contentColors[i] === 'blue' ? '蓝' : '红'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.contentPicks.length === 0 && (
              <p className="text-[10px] text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">点击上方按钮开始添加内容号码</p>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 shrink-0" />
          <p className="text-[11px] text-yellow-700 leading-relaxed">
            严禁发布违法违规、虚假有害等信息。文章发布后将由系统自动审核，违规可能导致账号永久封禁。
          </p>
        </div>
      </form>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)] focus-within:relative">
        <button 
          onClick={handleSubmit}
          disabled={loading || fetching}
          className="w-full bg-[#d32f2f] text-white font-bold h-14 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (editId ? '正在修改...' : '正在发布...') : (editId ? '保存修改' : '立即发布文章')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default PublishPrediction;
