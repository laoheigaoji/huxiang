import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, Settings, Plus, Edit, Trash2, 
  ChevronRight, ArrowLeft, Save, X, Search, ShoppingBag,
  UserCheck, Check, Ban, LogOut, Volume2, Trophy, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Author, Prediction, HistoryItem, Application } from '../types';

const formatPeriod = (period: string) => {
  if (!period) return '';
  let p = period.trim();
  // Remove existing brackets, "第" and "期" to normalize
  p = p.replace(/^【|】$/g, '').replace(/^第/, '').replace(/期$/, '');
  return `【第${p}期】`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('authors');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ authors: [], predictions: [], history: [], users: [], orders: [], applications: [], messages: [], settings: null, withdrawals: [], feedbacks: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalFormData, setModalFormData] = useState<any>({
    mainPicks: [] as number[],
    mainZodiacs: [] as string[],
    ballColors: [] as string[],
    contentPicks: [] as string[],
    contentColors: [] as string[]
  });

  useEffect(() => {
    if (editingItem && activeTab === 'predictions') {
      const picks = editingItem.mainPicks || [];
      const zodiacs = editingItem.mainZodiacs || [];
      const colors = editingItem.ballColors || (picks.length > 0 ? picks.map(() => 'red') : []);
      const cPicks = editingItem.contentPicks || (editingItem.content ? editingItem.content.split(/[\s,，、]+/).filter(Boolean) : []);
      const cColors = editingItem.contentColors || (cPicks.length > 0 ? cPicks.map(() => 'red') : []);
      
      setModalFormData({
        mainPicks: picks,
        mainZodiacs: zodiacs,
        ballColors: colors,
        contentPicks: cPicks,
        contentColors: cColors
      });
    } else if (!editingItem && activeTab === 'predictions') {
      setModalFormData({
        mainPicks: [],
        mainZodiacs: [],
        ballColors: [],
        contentPicks: [],
        contentColors: []
      });
    }
  }, [editingItem, activeTab, isModalOpen]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderCategoryTab, setOrderCategoryTab] = useState<'all' | 'recharge' | 'consumption'>('all');
  const [feedbackStatusTab, setFeedbackStatusTab] = useState<'all' | 'pending' | 'replied'>('all');
  const [withdrawalStatusTab, setWithdrawalStatusTab] = useState<'all' | 'pending' | 'processed'>('all');

  useEffect(() => {
    fetchData();
    setSearchQuery('');
    setOrderCategoryTab('all');
    setFeedbackStatusTab('all');
    setWithdrawalStatusTab('all');
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [authors, predictions, history, users, orders, applications, messages, settings, withdrawals, feedbacks] = await Promise.all([
        api.getAuthors(),
        api.getPredictions(),
        api.getHistory(),
        api.getAdminUsers().catch(() => []),
        api.getAdminOrders().catch(() => []),
        api.getAdminApplications().catch(() => []),
        api.getMessages().catch(() => []),
        api.getSettings().catch(() => null),
        api.getAdminWithdrawals().catch(() => []),
        api.getAdminFeedbacks().catch(() => [])
      ]);
      setData({ authors, predictions, history, users, orders, applications, messages, settings, withdrawals, feedbacks });
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const handleApproveApp = async (id: string, approve: boolean) => {
    try {
      await api.updateAdminApplication(id, approve ? 'approved' : 'rejected');
      await fetchData();
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleApproveWithdrawal = async (id: string, approve: boolean) => {
    try {
      await api.updateAdminWithdrawal(id, approve ? 'approved' : 'rejected');
      await fetchData();
      alert(`已${approve ? '打款' : '拒绝'}`);
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'authors') await api.deleteAuthor(id);
      if (activeTab === 'predictions') await api.deletePrediction(id);
      if (activeTab === 'users') {
        await api.deleteAdminUser(id);
      } else {
        if (activeTab === 'orders') await api.deleteAdminOrder(id);
        if (activeTab === 'history') await api.deleteHistory(id);
        if (activeTab === 'applications') await api.deleteAdminApplication(id);
        if (activeTab === 'messages') await api.deleteAdminMessage(id);
        if (activeTab === 'feedbacks') await api.deleteAdminFeedback(id);
      }
      await fetchData();
    } catch (err) {
      console.log('删除失败');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (activeTab === 'authors') {
        if (editingItem) await api.updateAuthor(editingItem.id, formData);
        else await api.createAuthor(formData);
      } else if (activeTab === 'predictions') {
        const payload = {
          ...editingItem,
          ...formData,
          ...modalFormData, // Spread the complex array fields
          content: modalFormData.contentPicks.join(' '), // Sync to string
          isUnlocked: formData.isUnlocked === 'true',
          isFree: (parseInt(formData.price) || 0) === 0,
          price: parseInt(formData.price) || 0,
          tags: formData.tags ? formData.tags.split(',').map((s: string) => s.trim()) : [],
          time: editingItem?.time || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        };
        if (editingItem) await api.updatePrediction(editingItem.id, payload);
        else await api.createPrediction(payload);
      } else if (activeTab === 'users' && editingItem) {
        await api.updateAdminUser(editingItem.id, { 
          nickname: formData.nickname, 
          balance: parseFloat(formData.balance) 
        });
      } else if (activeTab === 'history') {
        await api.createHistory({
          ...formData,
          numbers: formData.numbers.split(','),
          animals: formData.animals.split(',')
        });
      } else if (activeTab === 'messages') {
        await api.postAdminMessage({
          ...formData,
          userId: formData.userId || 'all',
          type: formData.type || 'system'
        });
      } else if (activeTab === 'settings') {
        const payload = { ...formData };
        if (payload.authorCommissionRate) payload.authorCommissionRate = parseFloat(payload.authorCommissionRate);
        if (payload.inviteCommissionRate) payload.inviteCommissionRate = parseFloat(payload.inviteCommissionRate);
        
        // Remove empty keys to avoid overwriting with empty strings
        if (payload.yipayKey === '') delete payload.yipayKey;
        if (payload.wechatAppSecret === '') delete payload.wechatAppSecret;
        if (payload.adminPassword === '') delete payload.adminPassword;

        await api.updateSettings(payload);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await fetchData();
    } catch (err) {
      alert('保存失败');
    }
  };

  const [expandedApplications, setExpandedApplications] = useState<Record<string, boolean>>({});
  
  const toggleApplication = (id: string) => {
    setExpandedApplications(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const filteredAuthors = data.authors.filter((a: any) => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.phone || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPredictions = data.predictions.filter((p: any) => (p.contentTitle || p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.authorName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.period || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = data.users.filter((u: any) => (u.nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredApplications = data.applications.filter((a: any) => (a.realName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.username || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredOrders = data.orders.filter((o: any) => {
    // console.log("Filtering order:", o);
    const matchesSearch = (o.predictionTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (o.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.out_trade_no || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isConsumption = !!o.predictionId;
    if (orderCategoryTab === 'recharge') return matchesSearch && !isConsumption;
    if (orderCategoryTab === 'consumption') return matchesSearch && isConsumption;
    return matchesSearch;
  });
  const filteredWithdrawals = data.withdrawals.filter((w: any) => {
    const matchesSearch = (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (w.account || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (withdrawalStatusTab === 'pending') return matchesSearch && w.status === 'pending';
    if (withdrawalStatusTab === 'processed') return matchesSearch && w.status !== 'pending';
    return matchesSearch;
  });
  const filteredMessages = data.messages.filter((m: any) => (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (m.content || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFeedbacks = data.feedbacks.filter((f: any) => {
    const userNickname = f.user?.nickname || '';
    const matchesSearch = (f.content || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (f.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          userNickname.toLowerCase().includes(searchQuery.toLowerCase());
    if (feedbackStatusTab === 'pending') return matchesSearch && !f.reply;
    if (feedbackStatusTab === 'replied') return matchesSearch && !!f.reply;
    return matchesSearch;
  });
  const filteredHistory = data.history.filter((h: any) => (h.period || '').toLowerCase().includes(searchQuery.toLowerCase()) || (h.type || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs = [
    { id: 'authors', label: '专家管理', icon: Users },
    { id: 'predictions', label: '文章管理', icon: BookOpen },
    { id: 'applications', label: '入驻审核', icon: UserCheck },
    { id: 'withdrawals', label: '提现审核', icon: ShoppingBag },
    { id: 'orders', label: '订单管理', icon: ShoppingBag },
    { id: 'users', label: '用户管理', icon: Settings },
    { id: 'history', label: '历史录入', icon: Clock },
    { id: 'messages', label: '公告通知', icon: Volume2 },
    { id: 'feedbacks', label: '意见反馈', icon: Volume2 },
    { id: 'settings', label: '基础设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#d32f2f] tracking-tighter">后台管理系统</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  activeTab === tab.id 
                    ? 'bg-[#d32f2f] text-white shadow-lg shadow-red-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 mr-3 transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'
                }`} />
                <span className="font-bold text-sm">{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-50 space-y-2">
            <button
               onClick={() => navigate('/')}
               className="w-full flex items-center px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-900" />
              <span className="font-bold text-sm">返回前台</span>
            </button>
            <button
               onClick={handleLogout}
               className="w-full flex items-center px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold group"
            >
              <LogOut className="w-5 h-5 mr-3 opacity-70" />
              <span className="text-sm">退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 lg:hidden shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black text-gray-900 leading-none">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        {/* Action Header (Desktop & Mobile) */}
        <div className="bg-white border-b border-gray-50 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="hidden lg:block">
            <h1 className="text-xl font-black text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-0.5">管理您的系统数据与配置</p>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <button 
               onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
               className="bg-[#d32f2f] text-white px-5 py-2.5 rounded-2xl flex items-center text-sm font-bold shadow-xl shadow-red-100 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增记录
            </button>
            {activeTab === 'predictions' && (
              <button 
                onClick={async () => {
                  const pass = window.prompt('请输入密码确认公开所有方案（可输入1确认）');
                  if (pass === '1' || pass === 'admin123') {
                    try {
                      await api.unlockAllPredictions();
                      alert('已全部公开');
                      fetchData();
                    } catch (err) {
                      alert('操作失败');
                    }
                  }
                }}
                className="bg-green-500 text-white px-5 py-2.5 rounded-2xl flex items-center text-sm font-bold shadow-xl shadow-green-100 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 mr-2" />
                一键公开
              </button>
            )}
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 max-w-6xl mx-auto">
             {activeTab !== 'settings' && (
              <div className="mb-8 relative group">
                <Search className="w-5 h-5 text-gray-300 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-[#d32f2f] transition-colors" />
                <input 
                  type="text" 
                  placeholder={`在${tabs.find(t => t.id === activeTab)?.label || ''}中快速搜索...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-0 rounded-3xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-xl shadow-gray-200" 
                />
              </div>
            )}
            
            {activeTab === 'orders' && (
                <div className="flex space-x-2 mb-6">
                    {(['all', 'recharge', 'consumption'] as const).map(tab => (
                        <button key={tab} onClick={() => setOrderCategoryTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold ${orderCategoryTab === tab ? 'bg-[#d32f2f] text-white' : 'bg-white text-gray-500'}`}>
                            {tab === 'all' ? '全部' : tab === 'recharge' ? '充值类' : '消费类'}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin shadow-lg"></div>
                <p className="text-gray-400 font-bold text-sm animate-pulse">正在加载数据</p>
              </div>
            ) : (
              <div className="grid gap-6">
            {activeTab === 'authors' && filteredAuthors.map((author: Author) => (
              <div key={author.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                <img src={author.avatar} className="w-12 h-12 rounded-full object-cover mr-4" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{author.name}</h3>
                  <p className="text-xs text-gray-500">粉丝: {author.fans} | 连红: {author.streak}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => { setEditingItem(author); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(author.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'predictions' && filteredPredictions.map((pred: Prediction) => (
              <div key={pred.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                {pred.isHot && (
                  <div className="absolute top-0 left-0 w-8 h-8 bg-orange-500 flex items-center justify-center rounded-br-xl shadow-sm z-10">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex-1 pr-4 pl-8">
                    <span className="text-[#d32f2f] mr-1">{formatPeriod(pred.period)}</span>
                    {pred.title || pred.contentTitle}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={async () => {
                        try {
                          await api.updatePrediction(pred.id, { isHot: !pred.isHot });
                          await fetchData();
                        } catch (err) {
                          alert('操作失败');
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${pred.isHot ? 'bg-orange-100 text-orange-600' : 'text-gray-300 hover:bg-gray-100'}`}
                      title={pred.isHot ? '取消置顶' : '置顶文章'}
                    >
                      <Trophy className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingItem(pred); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pred.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-[11px] text-gray-400 pl-8">
                  <span className="mr-3">作者: {pred.authorName}</span>
                  <span className="mr-3">价格: {pred.isFree ? '免' : pred.price}</span>
                  <span className="mr-3">时间: {pred.time}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${pred.isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    {pred.isUnlocked ? '已公开' : '锁定中'}
                  </span>
                  {pred.result && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${pred.result === '红' ? 'bg-[#d32f2f] text-white' : 'bg-gray-900 text-white'}`}>
                      {pred.result}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {activeTab === 'users' && filteredUsers.map((user: any) => (
              <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover mr-4" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{user.nickname} <span className="text-[10px] text-gray-400 font-normal">@{user.username}</span></h3>
                  <p className="text-xs text-gray-500">余额: ¥{user.balance.toFixed(2)} | ID: {user.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => { setEditingItem(user); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {activeTab === 'applications' && filteredApplications.map((app: Application) => (
              <div key={app.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
                <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => toggleApplication(app.id)}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#d32f2f] font-bold mr-4 text-xl">
                      {app.realName[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{app.realName}</h3>
                      <p className="text-xs text-gray-400 font-bold">账号: {app.username} | {app.time.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'pending' ? 'bg-orange-50 text-orange-500' :
                      app.status === 'approved' ? 'bg-green-50 text-green-500' :
                      'bg-red-50 text-[#d32f2f]'
                    }`}>
                      {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝'}
                    </div>
                  </div>
                </div>

                {expandedApplications[app.id] && (
                  <div className="p-6 border-t border-gray-50 pt-0">
                    <div className="grid grid-cols-2 gap-y-3 bg-gray-50 p-4 rounded-2xl mb-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">联系电话</p>
                        <p className="text-sm font-bold text-gray-700">{app.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">证件类型</p>
                        <p className="text-sm font-bold text-gray-700">{app.idType}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">证件号码</p>
                        <p className="text-sm font-bold text-gray-700">{app.idNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">户籍地址</p>
                        <p className="text-sm font-bold text-gray-700">{app.hometown}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">身份证人像面</p>
                        {app.photoFront ? (
                          <img src={app.photoFront} className="w-full aspect-[1.5/1] object-cover rounded-xl border border-gray-100" alt="正面" />
                        ) : (
                          <div className="w-full aspect-[1.5/1] bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                            <span className="text-[10px] text-gray-300">未上传</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">身份证国徽面</p>
                        {app.photoBack ? (
                          <img src={app.photoBack} className="w-full aspect-[1.5/1] object-cover rounded-xl border border-gray-100" alt="反面" />
                        ) : (
                          <div className="w-full aspect-[1.5/1] bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                            <span className="text-[10px] text-gray-300">未上传</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-3 bg-gray-50 p-4 rounded-2xl mb-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">个人优势/描述</p>
                        <p className="text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">{app.description}</p>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleApproveApp(app.id, true)}
                          className="flex-1 bg-[#d32f2f] text-white py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-100 active:scale-95 transition-all"
                        >
                          通过
                        </button>
                        <button 
                          onClick={() => handleApproveApp(app.id, false)}
                          className="flex-1 bg-gray-100 text-gray-400 py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all"
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {activeTab === 'orders' && filteredOrders.map((order: any) => (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{order.predictionTitle || order.description} (订单号: {order.id}) 状态: {order.status}</h3>
                    <span className="text-xs font-bold text-[#d32f2f]">¥{order.amount}</span>
                  </div>
                  <div className="flex items-center text-[10px] text-gray-400">
                    <span className="mr-3">用户: {order.username} (ID: {order.userId})</span>
                    <span>时间: {order.time ? new Date(order.time).toLocaleString() : ''}</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center">
                  {order.predictionId && order.status !== 'refunded' && (
                    <button onClick={async () => {
                        if(confirm('确定退款?')) {
                            try {
                                await api.refundOrder(order.id);
                                fetchData();
                            } catch(e: any) {
                                alert('退款失败: ' + e.message);
                            }
                        }
                    }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg mr-2" title="退款">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(order.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'history' && filteredHistory.map((item: HistoryItem) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                <div className="flex-1">
                   <h3 className="font-bold text-gray-900">{item.period} - {item.type}</h3>
                   <p className="text-xs text-gray-500">结果: {item.mainPick} | 简报: {item.numbers.join(',')}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {activeTab === 'messages' && filteredMessages.map((msg: any) => (
              <div key={msg.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        msg.type === 'system' ? 'bg-red-100 text-[#d32f2f]' :
                        msg.type === 'activity' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {msg.type === 'system' ? '系统' : msg.type === 'activity' ? '活动' : '通知'}
                      </span>
                      <h3 className="font-bold text-gray-900">{msg.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{msg.content}</p>
                    <div className="mt-2 flex items-center text-[10px] text-gray-400">
                       <span className="mr-3">对象: {msg.userId === 'all' ? '全部用户' : `用户UID: ${msg.userId}`}</span>
                       <span>时间: {msg.time.replace('T', ' ').substring(0, 16)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(msg.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'withdrawals' && (
                <div className="flex space-x-2 mb-6">
                    {(['all', 'pending', 'processed'] as const).map(tab => (
                        <button key={tab} onClick={() => setWithdrawalStatusTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold ${withdrawalStatusTab === tab ? 'bg-[#d32f2f] text-white' : 'bg-white text-gray-500'}`}>
                            {tab === 'all' ? '全部' : tab === 'pending' ? '未处理' : '已处理'}
                        </button>
                    ))}
                </div>
            )}

            {activeTab === 'withdrawals' && filteredWithdrawals.map((w: any) => (
              <div key={w.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">提现 ¥{w.amount}</h3>
                    <p className="text-xs text-gray-500">用户ID: {w.userId}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    w.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    w.status === 'approved' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-[#d32f2f]'
                  }`}>
                    {w.status === 'pending' ? '待审核' : w.status === 'approved' ? '已打款' : '已拒绝'}
                  </div>
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">
                  <p><span className="text-gray-400">收款方式:</span> {w.type === 'alipay' ? '支付宝' : '银行卡'}</p>
                  {w.bankName && <p><span className="text-gray-400">结算银行:</span> {w.bankName}</p>}
                  <p><span className="text-gray-400">收款账号:</span> {w.account}</p>
                  <p><span className="text-gray-400">真实姓名:</span> {w.name}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>申请时间: {new Date(w.time || Date.now()).toLocaleString()}</span>
                  {w.status === 'pending' && (
                    <div className="flex space-x-2">
                       <button onClick={() => handleApproveWithdrawal(w.id, true)} className="px-3 py-1 bg-green-500 text-white rounded font-bold shadow-sm active:scale-95 transition-transform">打款</button>
                       <button onClick={() => handleApproveWithdrawal(w.id, false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded font-bold shadow-sm active:scale-95 transition-transform">拒绝</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeTab === 'feedbacks' && (
                <div className="flex space-x-2 mb-6">
                    {(['all', 'pending', 'replied'] as const).map(tab => (
                        <button key={tab} onClick={() => setFeedbackStatusTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold ${feedbackStatusTab === tab ? 'bg-[#d32f2f] text-white' : 'bg-white text-gray-500'}`}>
                            {tab === 'all' ? '全部' : tab === 'pending' ? '未回复' : '已回复'}
                        </button>
                    ))}
                </div>
            )}

            {activeTab === 'feedbacks' && filteredFeedbacks.map((fb: any) => (
              <div key={fb.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">问题反馈</h3>
                    <div className="flex items-center gap-2 mt-1">
                       {fb.user && (
                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md">
                           <span className="text-[11px] font-bold text-gray-600">用户:</span>
                           <span className="text-[11px] font-medium text-gray-800">{fb.user.nickname}</span>
                         </div>
                       )}
                       <p className="text-xs text-gray-500">反馈场景: {fb.scenario || '通用'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(fb.id)} className="p-2 text-[#d32f2f] hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3 break-words">
                  {fb.content}
                </div>
                {fb.images && fb.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-3">
                    {fb.images.map((img: string, idx: number) => (
                      <img key={idx} src={img} className="h-20 w-20 object-cover rounded border border-gray-200 shrink-0" alt="反馈截图" />
                    ))}
                  </div>
                )}
                {fb.reply && (
                   <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-3">
                      <strong>管理员回复:</strong> {fb.reply}
                   </div>
                )}
                <div className="flex gap-2 mb-3">
                   <input 
                     type="text" 
                     placeholder="回复反馈..."
                     className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
                     id={`reply-input-${fb.id}`}
                   />
                   <button onClick={async () => {
                     const input = document.getElementById(`reply-input-${fb.id}`) as HTMLInputElement;
                     if (input && input.value.trim()) {
                       try {
                         await api.replyToFeedback(fb.id, input.value.trim());
                         input.value = '';
                         fetchData();
                       } catch (err) { alert('回复失败'); }
                     }
                   }} className="bg-[#d32f2f] text-white rounded-lg px-4 text-sm font-bold">回复</button>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>联系电话: {fb.phone || '未提供'}</span>
                  <span>{new Date(fb.time).toLocaleString()}</span>
                </div>
              </div>
            ))}

            {activeTab === 'settings' && data.settings && (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto w-full">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSave(Object.fromEntries(formData.entries()));
                }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">网站名称</label>
                    <input name="siteName" defaultValue={data.settings.siteName} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">文章作者收益比</label>
                      <input name="authorCommissionRate" type="number" step="0.01" defaultValue={data.settings.authorCommissionRate || 0.7} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" required />
                      <p className="text-[10px] text-gray-400 mt-1">如 0.7 表示作者得 70%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">邀请消费分润比</label>
                      <input name="inviteCommissionRate" type="number" step="0.01" defaultValue={data.settings.inviteCommissionRate || 0.1} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" required />
                      <p className="text-[10px] text-gray-400 mt-1">如 0.1 表示推荐人得 10%</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">转卡码生成价格</label>
                    <input name="transferCodePrice" type="number" step="0.01" defaultValue={data.settings.transferCodePrice || 2} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">首页公告</label>
                    <textarea name="announcement" rows={3} defaultValue={data.settings.announcement} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">默认解锁倒计时 (HH:MM:SS)</label>
                    <input name="defaultUnlockDuration" defaultValue={data.settings.defaultUnlockDuration} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="01:25:20" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">联系邮箱</label>
                    <input name="contactEmail" defaultValue={data.settings.contactEmail} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">联系客服链接 (URL或mailto:)</label>
                    <input name="contactLink" defaultValue={data.settings.contactLink} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="https://..." />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-[#d32f2f] rounded-full"></span>
                       易支付配置 (YiPay)
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1 ml-1">易支付 PID</label>
                        <input name="yipayPid" defaultValue={data.settings.yipayPid} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="1000" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1 ml-1">易支付 KEY</label>
                        <input name="yipayKey" className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="输入新密钥将覆盖现有密钥" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1 ml-1">易支付 API URL</label>
                        <input name="yipayApiUrl" defaultValue={data.settings.yipayApiUrl} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="http://yzf.dypm.top/" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-[#d32f2f] rounded-full"></span>
                       微信登录配置 (WeChat)
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1 ml-1">微信 AppID</label>
                        <input name="wechatAppId" defaultValue={data.settings.wechatAppId} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="wxf0..." />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1 ml-1">微信 AppSecret</label>
                        <input name="wechatAppSecret" className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="输入新密钥将覆盖现有密钥" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 font-bold uppercase mb-1 ml-1">微信授权入口 (无限回调地址)</label>
                        <input name="wechatAuthUrl" defaultValue={data.settings.wechatAuthUrl} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="例如: http://wx.auth.com/redirect.php?url=..." />
                        <p className="mt-1 text-[10px] text-gray-400 px-1">如果不填写，则默认使用官方标准授权链接。配置无限回调时，请确保参数名正确。</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">下载APP链接</label>
                    <input name="downloadLink" defaultValue={data.settings.downloadLink} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">后台登录密码 <span className="text-gray-400 text-xs font-normal">(不修改请留空)</span></label>
                    <input name="adminPassword" type="password" className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#d32f2f] transition-all font-medium" placeholder="留空则不修改密码" />
                  </div>
                  <button type="submit" className="w-full bg-[#d32f2f] text-white py-5 rounded-2xl font-black shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all">
                    保存设置
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-2xl w-full ${activeTab === 'predictions' ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] flex flex-col relative z-10 shadow-2xl`}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingItem ? '编辑' : '制作'} {
                    activeTab === 'authors' ? '专家' : 
                    activeTab === 'predictions' ? '文章' : 
                    activeTab === 'users' ? '用户' : 
                    activeTab === 'history' ? '开奖结果' : 
                    activeTab === 'messages' ? '消息通知' : ''
                  }
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSave(Object.fromEntries(formData.entries()));
                }} className="space-y-6">
                  {activeTab === 'authors' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">专家姓名</label>
                        <input name="name" defaultValue={editingItem?.name} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">头像URL</label>
                        <input name="avatar" defaultValue={editingItem?.avatar} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">连红数</label>
                          <input name="streak" type="number" defaultValue={editingItem?.streak} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">粉丝数</label>
                          <input name="fans" type="number" defaultValue={editingItem?.fans} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" />
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'predictions' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column: Basic Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-900 border-l-4 border-red-500 pl-3">基本信息</h3>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">文章大标题</label>
                          <input name="title" defaultValue={editingItem?.title} placeholder="如：独家分析 精准推荐" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">正文小标题</label>
                          <input name="contentTitle" defaultValue={editingItem?.contentTitle} placeholder="如：精准平特一肖 重点推荐" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">作者名称</label>
                          <input name="authorName" defaultValue={editingItem?.authorName} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">价格 (¥)</label>
                            <input name="price" type="number" defaultValue={editingItem?.price} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">期数</label>
                             <input name="period" defaultValue={editingItem?.period} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">公开状态</label>
                            <select name="isUnlocked" defaultValue={editingItem?.isUnlocked ? 'true' : 'false'} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer">
                              <option value="false">锁定中</option>
                              <option value="true">已公开</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">方案结果</label>
                            <select name="result" defaultValue={editingItem?.result || ''} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer">
                              <option value="">未公开</option>
                              <option value="红">红</option>
                              <option value="黑">黑</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">公开倒计时 (HH:MM:SS)</label>
                          <input name="unlockDuration" defaultValue={editingItem?.unlockDuration || data.settings?.defaultUnlockDuration} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" placeholder="01:25:20" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">标签 (逗号分隔)</label>
                          <input name="tags" placeholder="精选推荐,独家分析" defaultValue={editingItem?.tags?.join(',')} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" />
                        </div>
                      </div>

                      {/* Right Column: Numbers Management */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-black text-gray-900 border-l-4 border-orange-500 pl-3">核心数据管理</h3>
                        
                        {/* Main Picks Visual Manager */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">精选号码 & 生肖</label>
                            <button 
                              type="button" 
                              onClick={() => setModalFormData({...modalFormData, mainPicks: [...modalFormData.mainPicks, null], mainZodiacs: [...modalFormData.mainZodiacs, ''], ballColors: [...modalFormData.ballColors, 'red']})}
                              className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              + 新增
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            {modalFormData.mainPicks.map((pick: any, i: number) => (
                              <div key={i} className="flex flex-col space-y-2 p-3 bg-white rounded-xl border border-gray-100 relative group shadow-sm">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const newState = {...modalFormData};
                                    newState.mainPicks.splice(i, 1);
                                    newState.mainZodiacs.splice(i, 1);
                                    newState.ballColors.splice(i, 1);
                                    setModalFormData(newState);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    onClick={() => {
                                      const newColors = [...modalFormData.ballColors];
                                      newColors[i] = newColors[i] === 'red' ? 'blue' : 'red';
                                      setModalFormData({...modalFormData, ballColors: newColors});
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 cursor-pointer transition-transform active:scale-90 ${modalFormData.ballColors[i] === 'blue' ? 'bg-blue-600 shadow-blue-100' : 'bg-red-500 shadow-red-100'}`}
                                  >
                                    <input 
                                      type="text"
                                      value={pick === null ? '' : pick}
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => {
                                        const newPicks = [...modalFormData.mainPicks];
                                        newPicks[i] = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                                        setModalFormData({...modalFormData, mainPicks: newPicks});
                                      }}
                                      className="w-full bg-transparent text-center outline-none border-none text-[12px] font-black"
                                    />
                                  </div>
                                  <input 
                                    value={modalFormData.mainZodiacs[i]}
                                    onChange={e => {
                                      const newZodiacs = [...modalFormData.mainZodiacs];
                                      newZodiacs[i] = e.target.value;
                                      setModalFormData({...modalFormData, mainZodiacs: newZodiacs});
                                    }}
                                    placeholder="生肖"
                                    className="w-full bg-gray-50 rounded-lg px-2 py-1.5 text-[11px] font-black outline-none focus:ring-2 focus:ring-red-100"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Content Picks Visual Manager */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">正文号码 (无需生肖)</label>
                            <button 
                              type="button" 
                              onClick={() => setModalFormData({...modalFormData, contentPicks: [...modalFormData.contentPicks, ''], contentColors: [...modalFormData.contentColors, 'red']})}
                              className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-orange-100 hover:bg-orange-100 transition-colors"
                            >
                              + 新增
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            {modalFormData.contentPicks.map((pick: any, i: number) => (
                              <div key={i} className="relative group bg-white border border-gray-100 p-3 rounded-xl flex items-center space-x-3 shadow-sm">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const newState = {...modalFormData};
                                    newState.contentPicks.splice(i, 1);
                                    newState.contentColors.splice(i, 1);
                                    setModalFormData(newState);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                
                                <div 
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black transition-all cursor-pointer active:scale-90 ${modalFormData.contentColors[i] === 'blue' ? 'bg-blue-600 shadow-blue-100' : 'bg-red-500 shadow-red-100'}`}
                                  onClick={() => {
                                    const newColors = [...modalFormData.contentColors];
                                    newColors[i] = newColors[i] === 'red' ? 'blue' : 'red';
                                    setModalFormData({...modalFormData, contentColors: newColors});
                                  }}
                                >
                                  <input 
                                    type="text"
                                    value={pick}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => {
                                      const newPicks = [...modalFormData.contentPicks];
                                      newPicks[i] = e.target.value;
                                      setModalFormData({...modalFormData, contentPicks: newPicks});
                                    }}
                                    className="w-full bg-transparent text-center outline-none border-none font-black"
                                  />
                                </div>

                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newColors = [...modalFormData.contentColors];
                                    newColors[i] = newColors[i] === 'red' ? 'blue' : 'red';
                                    setModalFormData({...modalFormData, contentColors: newColors});
                                  }}
                                  className={`text-[10px] px-2 py-1 rounded-lg border font-black transition-all ${
                                    modalFormData.contentColors[i] === 'blue' 
                                      ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                      : 'bg-red-50 text-red-600 border-red-100'
                                    }`}
                                >
                                  {modalFormData.contentColors[i] === 'blue' ? '蓝' : '红'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'users' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">用户昵称</label>
                        <input name="nickname" defaultValue={editingItem?.nickname} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">账户余额</label>
                        <input name="balance" type="number" step="0.01" defaultValue={editingItem?.balance} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                    </div>
                  ) : activeTab === 'history' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">期数</label>
                        <input name="period" placeholder="如：第116期" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">类型</label>
                          <input name="type" placeholder="如：全7位" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">核心选型</label>
                          <input name="mainPick" placeholder="如：猴" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">号码 (逗号分隔)</label>
                        <input name="numbers" placeholder="21,16,25..." className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">生肖 (逗号分隔)</label>
                        <input name="animals" placeholder="狗,兔,马..." className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                    </div>
                  ) : activeTab === 'messages' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">消息类型</label>
                        <select name="type" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all">
                          <option value="system">系统公告</option>
                          <option value="activity">优惠活动</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">推送对象 (填写ID或all)</label>
                        <input name="userId" placeholder="all" defaultValue="all" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">标题</label>
                        <input name="title" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">内容</label>
                        <textarea name="content" rows={4} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 transition-all" required />
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="shrink-0 pt-4">
                    <button type="submit" className="w-full bg-[#d32f2f] text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] transition-all">
                      <Save className="w-5 h-5 mr-2" />
                      确认并保存记录
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
