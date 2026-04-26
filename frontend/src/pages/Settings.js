import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from 'react-query';
import { authAPI, demoAPI } from '../services/api';
import toast from 'react-hot-toast';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import RoleManagement from './settings/RoleManagement';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Settings = ({ initialTab = 'profile' }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [systemSettings, setSystemSettings] = useState({
    companyName: 'Smart Inventory Ltd',
    currency: 'USD',
    language: 'English',
    emailNotifications: true,
    lowStockAlerts: true,
  });

  const [demoSummary, setDemoSummary] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);


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
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'roles', label: 'Role Management', icon: ShieldCheckIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="section-card space-y-6">
            <ProfilePhotoUpload 
              currentPhoto={user?.profilePhoto}
              onPhotoUpdate={(newPhoto) => {
                // Update user profile photo in auth context
                queryClient.invalidateQueries('user');
              }}
              userId={user?.user_id}
            />
            
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-500">{user?.role?.toUpperCase()} · {user?.department || 'Not specified'}</p>
                </div>
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
      case 'notifications':
        return (
          <div className="section-card space-y-5">
            <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive workflow and approval updates by email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.emailNotifications}
                  onChange={(e) => setSystemSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <div>
                  <p className="font-medium text-gray-900">Low Stock Alerts</p>
                  <p className="text-sm text-gray-500">Show live stock warnings across inventory and dashboard.</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemSettings.lowStockAlerts}
                  onChange={(e) => setSystemSettings((prev) => ({ ...prev, lowStockAlerts: e.target.checked }))}
                />
              </label>
            </div>
          </div>
        );
      case 'roles':
        return <RoleManagement />;
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
