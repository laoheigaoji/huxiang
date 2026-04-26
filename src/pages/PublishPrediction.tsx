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
    content: ''
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        const data = await api.getProfile();
        if (!data.isAuthor) {
          alert('您还不是认证作者，请先申请入驻');
          navigate('/partner-join');
          return;
        }
        setUser(data);

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
              content: pred.content || ''
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
      if (editId) {
        await api.updateAuthorPrediction(editId, {
          ...formData,
          authorId: user.authorId,
          authorName: user.nickname || user.username,
          authorAvatar: user.avatar,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
        alert('修改成功！');
      } else {
        await api.createPrediction({
          ...formData,
          authorId: user.authorId,
          authorName: user.nickname || user.username,
          authorAvatar: user.avatar,
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
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            <h3 className="font-bold text-gray-900">基本信息</h3>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">文章标题</label>
            <input 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="例如：独家分析 精准推荐"
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-red-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">预测期数</label>
              <input 
                value={formData.period}
                onChange={e => setFormData({...formData, period: e.target.value})}
                placeholder="第116期"
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-red-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">标签设置</label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(t => (
                  <span key={t} className="bg-red-50 text-red-500 text-[10px] px-2 py-1 rounded-md flex items-center">
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
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            <h3 className="font-bold text-gray-900">定价设置</h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">设为免费方案</span>
            <button 
              type="button"
              onClick={() => setFormData({...formData, isFree: !formData.isFree, price: formData.isFree ? 286 : 0})}
              className={`w-12 h-6 rounded-full relative transition-colors ${formData.isFree ? 'bg-red-500' : 'bg-gray-200'}`}
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
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-red-500 outline-none" 
                />
                <span className="absolute right-4 top-3.5 text-sm text-gray-400">币</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            <h3 className="font-bold text-gray-900">详细分析</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">正文小标题</label>
            <input 
              value={formData.contentTitle}
              onChange={e => setFormData({...formData, contentTitle: e.target.value})}
              placeholder="如：精准平特一肖 重点推荐"
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-red-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">预测分析详情</label>
            <textarea 
              rows={8}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="请输入您的分析逻辑、支持数据等观点..."
              className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm focus:ring-1 focus:ring-red-500 outline-none resize-none" 
            ></textarea>
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
          className="w-full bg-red-500 text-white font-bold h-14 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (editId ? '正在修改...' : '正在发布...') : (editId ? '保存修改' : '立即发布文章')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default PublishPrediction;
