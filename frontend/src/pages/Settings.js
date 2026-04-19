import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from 'react-query';
import { authAPI, demoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  LockClosedIcon, 
  BellIcon, 
  BuildingStorefrontIcon,
  ArrowPathIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [systemSettings, setSystemSettings] = useState({
    companyName: 'Smart Inventory Ltd',
    currency: 'USD',
    language: 'English',
    emailNotifications: true,
    lowStockAlerts: true,
  });

  const [loading, setLoading] = useState(false);
  const [demoSummary, setDemoSummary] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const demoMutation = useMutation(
    () => demoAPI.seedGroceryStoreMonth({ replaceExisting: true }),
    {
      onSuccess: (response) => {
        setDemoSummary(response.data.summary || response.data.data?.summary || null);
        toast.success('Loaded one-month grocery store demo dataset');
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to load grocery demo dataset');
      },
    }
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'system', label: 'System Settings', icon: BuildingStorefrontIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="section-card space-y-5">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                <p className="text-gray-500">{user?.role.toUpperCase()} • {user?.department}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Username</label>
                <div className="input bg-gray-50 text-gray-500 cursor-not-allowed">{user?.username}</div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <div className="input bg-gray-50 text-gray-500 cursor-not-allowed">{user?.email}</div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <form onSubmit={handlePasswordChange} className="section-card space-y-5">
            <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" name="currentPassword" required className="input" value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" name="newPassword" required className="input" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" name="confirmPassword" required className="input" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        );
      case 'system':
        return (
          <div className="space-y-5">
            <div className="section-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Company Name</label>
                <input type="text" className="input" value={systemSettings.companyName} onChange={(e) => setSystemSettings({...systemSettings, companyName: e.target.value})} />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" value={systemSettings.currency} onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-bold text-gray-900">Automatic Backup</h4>
                <p className="text-sm text-gray-500">Run database backup every 24 hours</p>
              </div>
              <div className="h-6 w-11 bg-primary-600 rounded-full relative">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
              </div>
            </div>
            </div>

            <div className="section-card space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Grocery Demo Dataset</h3>
                  <p className="text-sm text-gray-600">
                    Load a connected 30-day grocery store workflow with products, suppliers, customers, purchases, sales, expenses, assets, alerts, and payment accounts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => demoMutation.mutate()}
                  disabled={demoMutation.isLoading}
                  className="btn btn-primary"
                >
                  {demoMutation.isLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CircleStackIcon className="h-4 w-4" />}
                  {demoMutation.isLoading ? 'Loading Dataset...' : 'Load Grocery Month'}
                </button>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This replaces existing demo/business records in inventory, sales, purchases, expenses, alerts, assets, warehouses, payment accounts, and metadata.
              </div>
              {demoSummary ? (
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 px-3 py-3"><span className="block text-gray-500">Inventory</span><span className="font-semibold text-gray-900">{demoSummary.inventoryItems}</span></div>
                  <div className="rounded-lg bg-gray-50 px-3 py-3"><span className="block text-gray-500">Sales</span><span className="font-semibold text-gray-900">{demoSummary.sales}</span></div>
                  <div className="rounded-lg bg-gray-50 px-3 py-3"><span className="block text-gray-500">Purchases</span><span className="font-semibold text-gray-900">{demoSummary.purchases}</span></div>
                  <div className="rounded-lg bg-gray-50 px-3 py-3"><span className="block text-gray-500">Alerts</span><span className="font-semibold text-gray-900">{demoSummary.activeAlerts}</span></div>
                </div>
              ) : null}
            </div>
          </div>
        );
      default:
        return <div className="p-8 text-center text-gray-500">Coming soon...</div>;
    }
  };

  return (
    <div className="page-stack">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, system preferences, and demo workspace data</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Settings;
