import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const defaultCategories = [
  { name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: '🍽️' },
  { name: 'Transportation', type: 'expense', color: '#F59E0B', icon: '🚗' },
  { name: 'Shopping', type: 'expense', color: '#8B5CF6', icon: '🛍️' },
  { name: 'Entertainment', type: 'expense', color: '#EC4899', icon: '🎬' },
  { name: 'Bills & Utilities', type: 'expense', color: '#6B7280', icon: '💡' },
  { name: 'Healthcare', type: 'expense', color: '#10B981', icon: '🏥' },
  { name: 'Salary', type: 'income', color: '#059669', icon: '💼' },
  { name: 'Freelance', type: 'income', color: '#0891B2', icon: '💻' },
  { name: 'Investment', type: 'income', color: '#7C3AED', icon: '📈' },
];

const Categories = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#3B82F6', icon: '💰' });
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const r = await api.get('/categories'); return r.data.data; },
  });

  const createMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/categories', d); return r.data; },
    onSuccess: () => { queryClient.invalidateQueries(['categories']); toast.success('Category created'); handleClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...d }) => { const r = await api.put(`/categories/${id}`, d); return r.data; },
    onSuccess: () => { queryClient.invalidateQueries(['categories']); toast.success('Category updated'); handleClose(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/categories/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries(['categories']); toast.success('Category deleted'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing._id, ...form });
    else createMutation.mutate(form);
  };

  const handleEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon }); setModalOpen(true); };

  const handleDelete = (id) => { if (window.confirm('Delete this category?')) deleteMutation.mutate(id); };

  const handleClose = () => { setModalOpen(false); setEditing(null); setForm({ name: '', type: 'expense', color: '#3B82F6', icon: '💰' }); };

  const display = categories?.length > 0 ? categories : defaultCategories;

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border border-foreground/30 border-t-foreground rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium text-foreground">Categories</h1>
          <p className="text-xs text-secondary-foreground mt-0.5">Manage your transaction categories</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-medium rounded-md px-3 py-1.5 hover:opacity-90 active:scale-[0.97] transition-all duration-150">
          <FiPlus className="h-3 w-3" /> Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {display.map((cat, i) => (
          <div key={cat._id || i} className="border border-border rounded-md p-3 flex items-center justify-between group hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg flex-shrink-0">{cat.icon}</span>
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{cat.name}</p>
                <p className="text-2xs text-secondary-foreground capitalize">{cat.type}</p>
              </div>
            </div>
            {cat._id && (
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button onClick={() => handleEdit(cat)} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><FiEdit2 className="h-3 w-3" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><FiTrash2 className="h-3 w-3" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-md border border-border w-full max-w-sm p-4">
            <h2 className="text-sm font-medium text-foreground mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Color</label>
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="block w-full h-9 rounded-md border border-input bg-background p-0.5 cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Icon</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" placeholder="💰" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 text-xs font-medium text-secondary-foreground hover:text-foreground transition-colors border border-border rounded-md">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-xs font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
