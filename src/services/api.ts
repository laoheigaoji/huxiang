import { Author, Prediction, HistoryItem } from '../types';

const API_BASE = '/api';

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  if (!res.ok) {
    if (contentType && contentType.includes('application/json')) {
      const error = await res.json();
      throw new Error(error.error || `Request failed with status ${res.status}`);
    } else {
      const text = await res.text();
      if (text.includes('Rate exceeded')) {
        throw new Error('操作过于频繁，请稍后再试 (Rate exceeded)');
      }
      throw new Error(text || `Request failed with status ${res.status}`);
    }
  }

  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
};

export const api = {
  async getAuthors(): Promise<Author[]> {
    const res = await fetch(`${API_BASE}/authors`);
    return handleResponse(res);
  },

  async getAuthorById(id: string): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors/${id}`);
    return handleResponse(res);
  },

  async getPredictions(): Promise<Prediction[]> {
    const res = await fetch(`${API_BASE}/predictions`);
    return handleResponse(res);
  },

  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },

  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    return handleResponse(res);
  },

  async updateSettings(data: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getHistory(): Promise<HistoryItem[]> {
    const res = await fetch(`${API_BASE}/history`);
    return handleResponse(res);
  },

  async getPredictionById(id: string): Promise<Prediction> {
    const res = await fetch(`${API_BASE}/predictions/${id}`);
    return handleResponse(res);
  },

  async getProfile() {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    if (!userId) throw new Error('未登录');
    const res = await fetch(`${API_BASE}/profile?userId=${userId}`);
    return handleResponse(res);
  },

  async updateProfile(data: any) {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/profile${userId ? `?userId=${userId}` : ''}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async followAuthor(id: string) {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/authors/follow/${id}${userId ? `?userId=${userId}` : ''}`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  async createPayment(amount: number, type: string, orderName: string, userId?: string, predictionId?: string, returnUrl?: string) {
    const res = await fetch(`${API_BASE}/pay/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type, orderName, userId, predictionId, returnUrl })
    });
    return handleResponse(res);
  },

  async getMessages() {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/messages${userId ? `?userId=${userId}` : ''}`);
    return handleResponse(res);
  },

  async getTransactions() {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/transactions${userId ? `?userId=${userId}` : ''}`);
    return handleResponse(res);
  },

  async withdraw(data: any) {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId })
    });
    return handleResponse(res);
  },

  async purchasePrediction(predictionId: string) {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predictionId, userId })
    });
    return handleResponse(res);
  },

  async getPurchasedPredictions(): Promise<Prediction[]> {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/purchased-predictions${userId ? `?userId=${userId}` : ''}`);
    return handleResponse(res);
  },

  async adminLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  async wechatLogin(code: string, nickname?: string, avatar?: string, referrer?: string) {
    const res = await fetch(`${API_BASE}/wechat-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, nickname, avatar, referrer })
    });
    return handleResponse(res);
  },

  async register(username: string, password: string, nickname: string, referrerId?: string) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname, referrerId })
    });
    return handleResponse(res);
  },

  async getInvitedFriends() {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/invited-friends${userId ? `?userId=${userId}` : ''}`);
    return handleResponse(res);
  },

  async logout() {
    await fetch(`${API_BASE}/logout`, { method: 'POST' });
    localStorage.removeItem('user');
  },

  // Admin APIs
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    return handleResponse(res);
  },

  async updateAdminUser(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAdminUser(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async getAdminOrders() {
    const res = await fetch(`${API_BASE}/admin/orders`);
    return handleResponse(res);
  },

  async deleteAdminOrder(id: string) {
    const res = await fetch(`${API_BASE}/admin/orders/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async createHistory(data: any) {
    const res = await fetch(`${API_BASE}/admin/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteHistory(id: string) {
    const res = await fetch(`${API_BASE}/admin/history/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async createAuthor(data: any) {
    const res = await fetch(`${API_BASE}/admin/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAuthor(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/authors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAuthor(id: string) {
    const res = await fetch(`${API_BASE}/admin/authors/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async createPrediction(data: any) {
    const res = await fetch(`${API_BASE}/admin/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updatePrediction(id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/predictions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deletePrediction(id: string) {
    const res = await fetch(`${API_BASE}/admin/predictions/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async markAsPublic(id: string) {
    const res = await fetch(`${API_BASE}/predictions/${id}/public`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  async applyForAuthor(data: any) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAdminApplications() {
    const res = await fetch(`${API_BASE}/admin/applications`);
    return handleResponse(res);
  },

  async deleteAdminApplication(id: string) {
    const res = await fetch(`${API_BASE}/admin/applications/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async updateAdminApplication(id: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getAdminWithdrawals() {
    const res = await fetch(`${API_BASE}/admin/withdrawals`);
    return handleResponse(res);
  },

  async updateAdminWithdrawal(id: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async submitFeedback(data: any) {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId })
    });
    return handleResponse(res);
  },

  async getAdminFeedbacks() {
    const res = await fetch(`${API_BASE}/admin/feedbacks`);
    return handleResponse(res);
  },

  async deleteAdminFeedback(id: string) {
    const res = await fetch(`${API_BASE}/admin/feedbacks/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async getAuthorPredictions(authorId: string): Promise<Prediction[]> {
    const res = await fetch(`${API_BASE}/author/predictions/${authorId}`);
    return handleResponse(res);
  },

  async deleteAuthorPrediction(id: string) {
    const res = await fetch(`${API_BASE}/author/predictions/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async updateAuthorPrediction(id: string, data: any) {
    const res = await fetch(`${API_BASE}/author/predictions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async unlockAllPredictions() {
    const res = await fetch(`${API_BASE}/admin/predictions/unlock-all`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Admin Message APIs
  async postAdminMessage(data: any) {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAdminMessage(id: string) {
    const res = await fetch(`${API_BASE}/admin/messages/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async refundOrder(orderId: string) {
    const res = await fetch(`${API_BASE}/admin/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    return handleResponse(res);
  }
};

