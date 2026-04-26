import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, Settings, Plus, Edit, Trash2, 
  ChevronRight, ArrowLeft, Save, X, Search, ShoppingBag,
  UserCheck, Check, Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Author, Prediction, HistoryItem, Application } from '../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('authors');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ authors: [], predictions: [], history: [], users: [], orders: [], applications: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [authors, predictions, history, users, orders, applications] = await Promise.all([
        api.getAuthors(),
        api.getPredictions(),
        api.getHistory(),
        api.getAdminUsers().catch(() => []),
        api.getAdminOrders().catch(() => []),
        api.getAdminApplications().catch(() => [])
      ]);
      setData({ authors, predictions, history, users, orders, applications });
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApp = async (id: string, approve: boolean) => {
    try {
      await api.updateAdminApplication(id, approve ? 'approved' : 'rejected');
      await fetchData();
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      if (activeTab === 'authors') await api.deleteAuthor(id);
      if (activeTab === 'predictions') await api.deletePrediction(id);
      if (activeTab === 'users') await api.deleteAdminUser(id);
      if (activeTab === 'orders') await api.deleteAdminOrder(id);
      if (activeTab === 'history') await api.deleteHistory(id);
      await fetchData();
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (activeTab === 'authors') {
        if (editingItem) await api.updateAuthor(editingItem.id, formData);
        else await api.createAuthor(formData);
      } else if (activeTab === 'predictions') {
        if (editingItem) await api.updatePrediction(editingItem.id, formData);
        else await api.createPrediction(formData);
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
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await fetchData();
    } catch (err) {
      alert('保存失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 leading-none">管理后台</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
             onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
             className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新增
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 overflow-x-auto scrollbar-hide flex">
        {[
          { id: 'authors', label: '专家管理', icon: Users },
          { id: 'predictions', label: '预测管理', icon: BookOpen },
          { id: 'applications', label: '入驻审核', icon: UserCheck },
          { id: 'orders', label: '订单管理', icon: ShoppingBag },
          { id: 'users', label: '用户管理', icon: Settings },
          { id: 'history', label: '历史录入', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-red-500 text-red-500 font-bold' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-red-500' : 'text-gray-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTab === 'authors' && data.authors.map((author: Author) => (
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
                  <button onClick={() => handleDelete(author.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'predictions' && data.predictions.map((pred: Prediction) => (
              <div key={pred.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex-1 pr-4">{pred.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => { setEditingItem(pred); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pred.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-[11px] text-gray-400">
                  <span className="mr-3">作者: {pred.authorName}</span>
                  <span className="mr-3">价格: {pred.isFree ? '免' : pred.price}</span>
                  <span>时间: {pred.time}</span>
                </div>
              </div>
            ))}

            {activeTab === 'users' && data.users.map((user: any) => (
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
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'applications' && data.applications.map((app: Application) => (
              <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 font-bold mr-3">
                      {app.realName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{app.realName}</h3>
                      <p className="text-[10px] text-gray-400">用户: {app.username} | {app.time.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    app.status === 'approved' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {app.status === 'pending' ? '审核中' : app.status === 'approved' ? '已通过' : '已拒绝'}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-600"><span className="font-bold">擅长:</span> {app.specialty}</p>
                  <p className="text-xs text-gray-600 leading-relaxed"><span className="font-bold">介绍:</span> {app.description}</p>
                </div>
                {app.status === 'pending' && (
                  <div className="flex space-x-2 pt-3 border-t border-gray-50">
                    <button 
                      onClick={() => handleApproveApp(app.id, true)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 mr-1" /> 通过
                    </button>
                    <button 
                      onClick={() => handleApproveApp(app.id, false)}
                      className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center"
                    >
                      <Ban className="w-3 h-3 mr-1" /> 拒绝
                    </button>
                  </div>
                )}
              </div>
            ))}

            {activeTab === 'orders' && data.orders.map((order: any) => (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{order.predictionTitle}</h3>
                    <span className="text-xs font-bold text-red-500">¥{order.amount}</span>
                  </div>
                  <div className="flex items-center text-[10px] text-gray-400">
                    <span className="mr-3">用户: {order.username} (ID: {order.userId})</span>
                    <span>时间: {order.time}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <button onClick={() => handleDelete(order.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'history' && data.history.map((item: HistoryItem) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                <div className="flex-1">
                   <h3 className="font-bold text-gray-900">{item.period} - {item.type}</h3>
                   <p className="text-xs text-gray-500">结果: {item.mainPick} | 简报: {item.numbers.join(',')}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
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
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingItem ? '编辑' : '制作'} {
                    activeTab === 'authors' ? '专家' : 
                    activeTab === 'predictions' ? '预测' : 
                    activeTab === 'users' ? '用户' : 
                    activeTab === 'history' ? '开奖结果' : ''
                  }
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSave(Object.fromEntries(formData.entries()));
                }} className="space-y-4">
                  {activeTab === 'authors' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">专家姓名</label>
                        <input name="name" defaultValue={editingItem?.name} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">头像URL</label>
                        <input name="avatar" defaultValue={editingItem?.avatar} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">连红数</label>
                          <input name="streak" type="number" defaultValue={editingItem?.streak} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">粉丝数</label>
                          <input name="fans" type="number" defaultValue={editingItem?.fans} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" />
                        </div>
                      </div>
                    </>
                  ) : activeTab === 'predictions' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">预测标题</label>
                        <input name="title" defaultValue={editingItem?.title} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">作者名称</label>
                        <input name="authorName" defaultValue={editingItem?.authorName} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">价格</label>
                          <input name="price" type="number" defaultValue={editingItem?.price} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">期数</label>
                           <input name="period" defaultValue={editingItem?.period} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" />
                        </div>
                      </div>
                    </>
                  ) : activeTab === 'users' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">用户昵称</label>
                        <input name="nickname" defaultValue={editingItem?.nickname} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">账户余额</label>
                        <input name="balance" type="number" step="0.01" defaultValue={editingItem?.balance} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                    </>
                  ) : activeTab === 'history' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">期数</label>
                        <input name="period" placeholder="如：第116期" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">类型</label>
                          <input name="type" placeholder="如：全7位" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">核心选型</label>
                          <input name="mainPick" placeholder="如：猴" className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">号码 (逗号分隔)</label>
                        <input name="numbers" placeholder="21,16,25..." className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">生肖 (逗号分隔)</label>
                        <input name="animals" placeholder="狗,兔,马..." className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm" required />
                      </div>
                    </>
                  ) : null}
                  
                  <button type="submit" className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-100 flex items-center justify-center">
                    <Save className="w-4 h-4 mr-2" />
                    保存修改
                  </button>
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
