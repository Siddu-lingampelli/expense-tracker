import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Shopping', 'Housing', 'Transportation', 'Entertainment',
  'Healthcare', 'Education', 'Utilities', 'Insurance', 'Personal Care',
  'Gifts & Donations', 'Travel', 'Business', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Stocks', 'Bitcoin', 'Bank', 'YouTube', 'Other'
];

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  const { isLoading: loadingTx } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => { const r = await api.get(`/transactions/${id}`); return r.data.data; },
    onSuccess: (data) => {
      if (!form) setForm({
        description: data.description,
        amount: Math.abs(data.amount).toString(),
        type: data.type,
        category: data.category,
        date: new Date(data.date).toISOString().split('T')[0],
        account: data.account || 'Cash',
      });
    },
    onError: () => { toast.error('Failed to load transaction'); navigate('/dashboard/transactions'); },
  });

  const mutation = useMutation({
    mutationFn: async (data) => { const r = await api.put(`/transactions/${id}`, data); return r.data; },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Transaction updated');
      navigate('/dashboard/transactions');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Required';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    if (!form.date) e.date = 'Select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ ...form, amount: parseFloat(form.amount), date: new Date(form.date).toISOString() });
  };

  if (loadingTx || !form) {
    return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border border-foreground/30 border-t-foreground rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard/transactions')} className="inline-flex items-center gap-1.5 text-xs text-secondary-foreground hover:text-foreground transition-colors mb-4">
          <FiArrowLeft className="h-3 w-3" /> back
        </button>
        <h1 className="text-base font-medium text-foreground">Edit Transaction</h1>
        <p className="text-xs text-secondary-foreground mt-0.5">Update the details of your transaction.</p>
      </div>

      <form onSubmit={handleSubmit} className="border border-border rounded-md p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-foreground">Type</label>
          <div className="flex gap-3 mt-1">
            {['expense', 'income'].map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} className="h-3.5 w-3.5 text-foreground focus:ring-foreground border-border" />
                <span className="text-sm text-foreground capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="text-xs font-medium text-foreground">Description</label>
          <input id="description" name="description" type="text" value={form.description} onChange={handleChange} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="amount" className="text-xs font-medium text-foreground">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-foreground pointer-events-none">$</span>
            <input id="amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} className="block w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" placeholder="0.00" />
          </div>
          {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="category" className="text-xs font-medium text-foreground">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1">
            <option value="">Select...</option>
            {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="date" className="text-xs font-medium text-foreground">Date</label>
            <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="account" className="text-xs font-medium text-foreground">Account</label>
            <select id="account" name="account" value={form.account} onChange={handleChange} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1">
              {['Cash', 'Bank Account', 'Credit Card', 'Digital Wallet'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => navigate('/dashboard/transactions')} className="px-4 py-2 text-xs font-medium text-secondary-foreground hover:text-foreground transition-colors border border-border rounded-md">Cancel</button>
            <button type="submit" disabled={mutation.isLoading} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-foreground text-background rounded-md hover:opacity-90 active:scale-[0.97] transition-all duration-150 disabled:opacity-50">
            {mutation.isLoading ? <>Saving...</> : <><FiSave className="h-3 w-3" /> Update</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransaction;
