import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../utils/api';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Housing', 'Transportation', 'Entertainment',
  'Healthcare', 'Education', 'Utilities', 'Insurance', 'Personal Care',
  'Gifts & Donations', 'Travel', 'Business', 'Other'
];

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'thismonth', label: 'This Month' },
  { value: 'lastmonth', label: 'Last Month' },
  { value: 'all', label: 'All Time' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Amount (high)' },
  { value: 'amount_asc', label: 'Amount (low)' },
  { value: 'category_asc', label: 'Category (A-Z)' },
];

const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || 'all';
  const dateRange = searchParams.get('dateRange') || 'thismonth';
  const sortBy = searchParams.get('sortBy') || 'date_desc';
  const search = searchParams.get('search') || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', { page, limit, type, category, dateRange, sortBy, search }],
    queryFn: async () => {
      const { data } = await api.get('/transactions', {
        params: { page, limit, type: type !== 'all' ? type : undefined, category: category !== 'all' ? category : undefined, dateRange: dateRange !== 'all' ? dateRange : undefined, sortBy, search: search || undefined },
      });
      return data.data;
    },
    keepPreviousData: true,
  });

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (!value || value === 'all') p.delete(key); else p.set(key, value);
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleSearch = (e) => { e.preventDefault(); setParam('search', searchInput); };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    queryClient.invalidateQueries(['transactions']);
    queryClient.invalidateQueries(['dashboard']);
    toast.success('Transaction deleted');
  };

  const handleBulkDelete = async () => {
    await api.delete('/transactions', { data: { ids: selected } });
    setSelected([]);
    queryClient.invalidateQueries(['transactions']);
    queryClient.invalidateQueries(['dashboard']);
    toast.success(`${selected.length} transactions deleted`);
  };

  const filtersActive = type !== 'all' || category !== 'all' || dateRange !== 'thismonth' || search;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium text-foreground">Transactions</h1>
          <p className="text-xs text-secondary-foreground mt-0.5">Manage your income and expenses</p>
        </div>
        <Link
          to="/dashboard/transactions/new"
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1.5 hover:opacity-90 active:scale-[0.97] transition-all duration-150"
        >
          <FiPlus className="h-3 w-3" /> Add
        </Link>
      </div>

      <div className="border border-border rounded-md">
        <div className="p-3 border-b border-border space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              placeholder="Search transactions..."
            />
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <select value={type} onChange={(e) => setParam('type', e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={category} onChange={(e) => setParam('category', e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="all">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={dateRange} onChange={(e) => setParam('dateRange', e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setParam('sortBy', e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {filtersActive && (
              <button onClick={() => setSearchParams({})} className="text-xs text-secondary-foreground hover:text-foreground underline underline-offset-2">
                Reset
              </button>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="px-3 py-2 border-b border-border bg-secondary/50 flex items-center justify-between">
            <span className="text-xs text-secondary-foreground">{selected.length} selected</span>
            <div className="flex gap-2">
              <button onClick={handleBulkDelete} className="text-xs text-destructive hover:underline underline-offset-2">Delete</button>
              <button onClick={() => setSelected([])} className="text-xs text-secondary-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="px-4 py-12 text-center text-xs text-destructive">Failed to load transactions.</div>
        ) : data?.transactions?.length > 0 ? (
          <div>
            {data.transactions.map((t) => (
              <div key={t._id} className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/40 transition-colors duration-150 ${selected.includes(t._id) ? 'bg-secondary/50' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.includes(t._id)}
                    onChange={() => toggleSelect(t._id)}
                    className="h-3.5 w-3.5 rounded border-border text-foreground focus:ring-primary flex-shrink-0"
                  />
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-success' : 'bg-destructive'}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{t.description}</p>
                    <p className="text-2xs text-secondary-foreground">{t.category} &middot; {format(new Date(t.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2 sm:ml-4">
                  <span className={`text-sm tabular-nums ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                  </span>
                  <Link to={`/dashboard/transactions/${t._id}/edit`} className="text-muted-foreground hover:text-foreground transition-colors">
                    <FiEdit2 className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => handleDelete(t._id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-xs text-muted-foreground">No transactions found.</p>
            <Link to="/dashboard/transactions/new" className="text-xs text-foreground underline underline-offset-2 mt-1 inline-block">Add your first</Link>
          </div>
        )}

        {data?.totalPages > 1 && (
          <div className="flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 border-t border-border">
            <p className="text-xs text-secondary-foreground">
              Page {data.currentPage} of {data.totalPages} ({data.totalItems} transactions)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setParam('page', String(page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-secondary-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <FiChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                let n; const tp = data.totalPages;
                if (tp <= 5) n = i + 1;
                else if (page <= 3) n = i + 1;
                else if (page >= tp - 2) n = tp - 4 + i;
                else n = page - 2 + i;
                return (
                  <button
                    key={n}
                    onClick={() => setParam('page', String(n))}
                    className={`w-7 h-7 text-xs rounded transition-colors ${page === n ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground hover:bg-secondary'}`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                onClick={() => setParam('page', String(page + 1))}
                disabled={page === data.totalPages}
                className="p-1.5 rounded text-secondary-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <FiChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
