import { toast } from 'react-toastify';

const LS = {
  USERS: 'expense_users',
  TRANSACTIONS: 'expense_transactions',
  CATEGORIES: 'expense_categories',
  AUTH: 'expense_auth',
};

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getAuth() {
  try { return JSON.parse(localStorage.getItem(LS.AUTH)); } catch { return null; }
}

function setAuth(auth) {
  localStorage.setItem(LS.AUTH, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(LS.AUTH);
}

function requireAuth() {
  const auth = getAuth();
  if (!auth) {
    const err = new Error('Not authenticated');
    err.response = { status: 401, data: { error: 'Please log in first' } };
    throw err;
  }
  return auth;
}

function successResponse(data) {
  return { data: { success: true, data } };
}

function makeError(status, message) {
  const err = new Error(message);
  err.response = { status, data: { error: message } };
  return err;
}

function computeDateRange(range) {
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case 'today': start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'yesterday': start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0); const yEnd = new Date(start); yEnd.setHours(23, 59, 59, 999); return { start, end: yEnd };
    case 'last7': start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'last30': start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'thismonth': start.setDate(1); start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'lastmonth': start.setMonth(start.getMonth() - 1, 1); start.setHours(0, 0, 0, 0); const lmEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999); return { start, end: lmEnd };
    case 'week': start.setDate(start.getDate() - 7); return { start, end: now };
    case 'month': start.setDate(1); start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'year': start.setMonth(0, 1); start.setHours(0, 0, 0, 0); return { start, end: now };
    default: return { start: new Date(0), end: now };
  }
}

function isInRange(dateStr, start, end) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(36);
}

function handleAuth(method, path, body) {
  if (path === '/auth/register' && method === 'POST') {
    const users = load(LS.USERS);
    if (users.find(u => u.email === body.email)) {
      throw makeError(400, 'Email already registered');
    }
    const user = {
      _id: genId(),
      name: body.name || body.email.split('@')[0],
      email: body.email,
      password: hashPassword(body.password),
      role: 'user',
      currency: 'USD',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    save(LS.USERS, users);
    const token = btoa(JSON.stringify({ id: user._id, email: user.email }));
    const auth = { token, user: { ...user, password: undefined } };
    setAuth(auth);
    return { data: { success: true, token, user: auth.user } };
  }

  if (path === '/auth/login' && method === 'POST') {
    const users = load(LS.USERS);
    const user = users.find(u => u.email === body.email && u.password === hashPassword(body.password));
    if (!user) {
      throw makeError(401, 'Invalid email or password');
    }
    const token = btoa(JSON.stringify({ id: user._id, email: user.email }));
    const auth = { token, user: { ...user, password: undefined } };
    setAuth(auth);
    return { data: { success: true, token, user: auth.user } };
  }

  if (path === '/auth/me' && method === 'GET') {
    const auth = getAuth();
    if (!auth) {
      throw makeError(401, 'Not authenticated');
    }
    const users = load(LS.USERS);
    const user = users.find(u => u._id === auth.user._id);
    if (!user) {
      clearAuth();
      throw makeError(401, 'User not found');
    }
    const safe = { ...user, password: undefined };
    setAuth({ token: auth.token, user: safe });
    return successResponse(safe);
  }

  if (path === '/auth/logout' && method === 'GET') {
    clearAuth();
    return { data: { success: true, data: {} } };
  }

  if (path === '/auth/updatepassword' && method === 'PUT') {
    const auth = requireAuth();
    const users = load(LS.USERS);
    const idx = users.findIndex(u => u._id === auth.user._id);
    if (idx === -1) throw makeError(404, 'User not found');
    if (users[idx].password !== hashPassword(body.currentPassword)) {
      throw makeError(400, 'Current password is incorrect');
    }
    users[idx].password = hashPassword(body.newPassword);
    save(LS.USERS, users);
    return { data: { success: true, data: {} } };
  }

  if (path === '/user/profile' && method === 'PUT') {
    const auth = requireAuth();
    const users = load(LS.USERS);
    const idx = users.findIndex(u => u._id === auth.user._id);
    if (idx === -1) throw makeError(404, 'User not found');
    Object.assign(users[idx], body);
    save(LS.USERS, users);
    const updated = { ...users[idx], password: undefined };
    setAuth({ token: auth.token, user: updated });
    return successResponse(updated);
  }
}

function handleCategories(method, path, body) {
  const auth = requireAuth();

  if (path === '/categories' && method === 'GET') {
    const cats = load(LS.CATEGORIES).filter(c => c.user === auth.user._id);
    return successResponse(cats);
  }

  if (path === '/categories' && method === 'POST') {
    const cats = load(LS.CATEGORIES);
    const cat = {
      _id: genId(),
      user: auth.user._id,
      name: body.name,
      type: body.type || 'expense',
      color: body.color || '#3B82F6',
      icon: body.icon || '📁',
      createdAt: new Date().toISOString(),
    };
    cats.push(cat);
    save(LS.CATEGORIES, cats);
    return { data: { success: true, data: cat } };
  }

  const updateMatch = path.match(/^\/categories\/([^/]+)$/);
  if (updateMatch && method === 'PUT') {
    const cats = load(LS.CATEGORIES);
    const idx = cats.findIndex(c => c._id === updateMatch[1] && c.user === auth.user._id);
    if (idx === -1) throw makeError(404, 'Category not found');
    Object.assign(cats[idx], body);
    save(LS.CATEGORIES, cats);
    return { data: { success: true, data: cats[idx] } };
  }

  if (updateMatch && method === 'DELETE') {
    let cats = load(LS.CATEGORIES);
    const idx = cats.findIndex(c => c._id === updateMatch[1] && c.user === auth.user._id);
    if (idx === -1) throw makeError(404, 'Category not found');
    cats.splice(idx, 1);
    save(LS.CATEGORIES, cats);
    return successResponse({});
  }
}

function handleTransactions(method, path, body, params) {
  const auth = requireAuth();
  const allTx = load(LS.TRANSACTIONS);

  if (path === '/transactions/summary') {
    const range = params?.range || 'month';
    const { start, end } = computeDateRange(range);
    let tx = allTx.filter(t => t.user === auth.user._id && isInRange(t.date, start, end));

    const totalIncome = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = Math.abs(tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));

    const monthlyMap = {};
    tx.forEach(t => {
      const d = new Date(t.date);
      const month = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
      if (t.type === 'income') monthlyMap[month].income += t.amount;
      else monthlyMap[month].expenses += Math.abs(t.amount);
    });
    const monthlySummary = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

    const categoryMap = {};
    tx.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Math.abs(t.amount);
    });
    const categories = Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));

    const allTxUnsorted = allTx.filter(t => t.user === auth.user._id).sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTransactions = allTxUnsorted.slice(0, 5);

    return successResponse({
      balance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      transactionCount: tx.length,
      monthlySummary,
      categories,
      recentTransactions,
    });
  }

  if (path === '/transactions/filter') {
    const { start, end } = {
      start: new Date(params?.startDate || 0),
      end: params?.endDate ? new Date(params.endDate + 'T23:59:59.999Z') : new Date(),
    };
    const tx = allTx.filter(t => t.user === auth.user._id && isInRange(t.date, start, end));
    return successResponse(tx);
  }

  if (path === '/transactions' && method === 'GET') {
    let tx = allTx.filter(t => t.user === auth.user._id);

    if (params) {
      if (params.type && params.type !== 'all') {
        tx = tx.filter(t => t.type === params.type);
      }
      if (params.category && params.category !== 'all') {
        tx = tx.filter(t => t.category === params.category);
      }
      if (params.dateRange && params.dateRange !== 'all') {
        const { start, end } = computeDateRange(params.dateRange);
        tx = tx.filter(t => isInRange(t.date, start, end));
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        tx = tx.filter(t => t.description.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
      }

      switch (params.sortBy) {
        case 'date_asc': tx.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
        case 'amount_desc': tx.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)); break;
        case 'amount_asc': tx.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount)); break;
        case 'category_asc': tx.sort((a, b) => a.category.localeCompare(b.category)); break;
        default: tx.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } else {
      tx.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const page = parseInt(params?.page) || 1;
    const limit = parseInt(params?.limit) || 10;
    const totalItems = tx.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIdx = (page - 1) * limit;
    const paginated = tx.slice(startIdx, startIdx + limit);

    return successResponse({ transactions: paginated, totalPages, totalItems, currentPage: page });
  }

  const singleMatch = path.match(/^\/transactions\/([a-f0-9-]+)$/i);
  if (singleMatch && method === 'GET') {
    const t = allTx.find(tx => tx._id === singleMatch[1] && tx.user === auth.user._id);
    if (!t) throw makeError(404, 'Transaction not found');
    return successResponse(t);
  }

  if (singleMatch && method === 'PUT') {
    const tx = load(LS.TRANSACTIONS);
    const idx = tx.findIndex(t => t._id === singleMatch[1] && t.user === auth.user._id);
    if (idx === -1) throw makeError(404, 'Transaction not found');
    let amount = parseFloat(body.amount) || 0;
    if (body.type === 'expense' && amount > 0) amount = -amount;
    Object.assign(tx[idx], body, { amount });
    save(LS.TRANSACTIONS, tx);
    return { data: { success: true, data: tx[idx] } };
  }

  if (path === '/transactions' && method === 'POST') {
    const tx = load(LS.TRANSACTIONS);
    let amount = parseFloat(body.amount) || 0;
    if (body.type === 'expense' && amount > 0) amount = -amount;
    const transaction = {
      _id: genId(),
      user: auth.user._id,
      description: body.description,
      amount,
      type: body.type,
      category: body.category,
      date: body.date || new Date().toISOString(),
      account: body.account || 'Cash',
      createdAt: new Date().toISOString(),
    };
    tx.push(transaction);
    save(LS.TRANSACTIONS, tx);
    return { data: { success: true, data: transaction } };
  }

  if (path === '/transactions' && method === 'DELETE') {
    const ids = body?.ids || [];
    let tx = load(LS.TRANSACTIONS);
    tx = tx.filter(t => !ids.includes(t._id) || t.user !== auth.user._id);
    save(LS.TRANSACTIONS, tx);
    return successResponse({});
  }
}

function route(method, url, sendData, config) {
  const base = url.startsWith('http') ? url : 'http://localhost' + url;
  const parsed = new URL(base);
  const path = parsed.pathname;
  const params = Object.fromEntries(parsed.searchParams.entries());

  const extraParams = config?.params || {};
  const mergedParams = { ...extraParams, ...params };
  const body = sendData || config?.data;
  const allConfig = config || {};

  try {
    if (path.startsWith('/auth/') || path === '/user/profile') {
      return handleAuth(method, path, body);
    }
    if (path.startsWith('/categories')) {
      return handleCategories(method, path, body);
    }
    if (path.startsWith('/transactions')) {
      return handleTransactions(method, path, body, mergedParams);
    }
    throw makeError(404, 'Not found');
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      let message = data?.error || 'An error occurred';
      if (status === 401 && window.location.pathname !== '/login') {
        toast.error(message);
        setTimeout(() => { window.location.href = '/login'; }, 500);
      } else if (status >= 400) {
        toast.error(message);
      }
    }
    return Promise.reject(err);
  }
}

const api = {
  get(url, config) { return route('GET', url, null, config); },
  post(url, data, config) { return route('POST', url, data, config); },
  put(url, data, config) { return route('PUT', url, data, config); },
  delete(url, config) { return route('DELETE', url, null, config); },
};

export default api;
