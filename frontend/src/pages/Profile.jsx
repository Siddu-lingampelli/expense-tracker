import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUser, FiLock, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', currency: user?.currency || 'USD' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const profileMutation = useMutation({
    mutationFn: async (d) => { const r = await api.put('/user/profile', d); return r.data; },
    onSuccess: () => { queryClient.invalidateQueries(['user']); toast.success('Profile updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: async (d) => { const r = await api.put('/auth/updatepassword', { currentPassword: d.currentPassword, newPassword: d.newPassword }); return r.data; },
    onSuccess: () => { toast.success('Password updated'); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const handleProfileSubmit = (e) => { e.preventDefault(); profileMutation.mutate(profileForm); };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    passwordMutation.mutate(passwordForm);
  };

  const handleLogout = async () => { await logout(); toast.success('Logged out'); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-base font-medium text-foreground">Settings</h1>
        <p className="text-xs text-secondary-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              activeTab === t.id ? 'bg-foreground text-background' : 'text-secondary-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="border border-border rounded-md p-4">
          <h2 className="text-xs font-medium text-foreground mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Name</label>
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Email</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Currency</label>
              <select value={profileForm.currency} onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1">
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code} &mdash; {c.name} ({c.symbol})</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-secondary-foreground">
                {theme === 'dark' ? <FiMoon className="h-3.5 w-3.5" /> : <FiSun className="h-3.5 w-3.5" />}
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </div>
              <button type="button" onClick={toggleTheme} className={`relative w-9 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-foreground' : 'bg-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 text-xs font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                {profileMutation.isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="border border-border rounded-md p-4">
            <h2 className="text-xs font-medium text-foreground mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" required minLength={6} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1" required minLength={6} />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-4 py-2 text-xs font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                  {passwordMutation.isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>

          <div className="border border-border rounded-md p-4">
            <h2 className="text-xs font-medium text-foreground mb-4">Account</h2>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline underline-offset-2">
              <FiLogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
