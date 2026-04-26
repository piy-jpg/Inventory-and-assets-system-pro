import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MoonIcon,
  SunIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [formData, setFormData] = useState({
    emailNotifications: {
      enabled: true,
      lowStockAlerts: true,
      paymentReminders: true,
      systemAlerts: true,
      backupAlerts: true,
      securityAlerts: true,
      weeklyReports: false,
      monthlyReports: true
    },
    smsAlerts: {
      enabled: false,
      lowStockAlerts: true,
      paymentReminders: true,
      systemAlerts: false,
      backupAlerts: false,
      securityAlerts: true
    },
    inAppAlerts: {
      enabled: true,
      lowStockAlerts: true,
      paymentReminders: true,
      systemAlerts: true,
      backupAlerts: true,
      securityAlerts: true,
      desktopNotifications: true
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York'
    }
  });

  const queryClient = useQueryClient();

  // Mock notification settings data
  const { data: notificationData, isLoading, refetch } = useQuery(
    'notificationSettings',
    () => {
      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        emailNotifications: {
          enabled: true,
          lowStockAlerts: true,
          paymentReminders: true,
          systemAlerts: true,
          backupAlerts: true,
          securityAlerts: true,
          weeklyReports: false,
          monthlyReports: true
        },
        smsAlerts: {
          enabled: false,
          lowStockAlerts: true,
          paymentReminders: true,
          systemAlerts: false,
          backupAlerts: false,
          securityAlerts: true
        },
        inAppAlerts: {
          enabled: true,
          lowStockAlerts: true,
          paymentReminders: true,
          systemAlerts: true,
          backupAlerts: true,
          securityAlerts: true,
          desktopNotifications: true
        },
        doNotDisturb: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'America/New_York'
        },
        recentNotifications: [
          {
            id: 1,
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: 'Product "Laptop Pro" is running low on stock (5 units remaining)',
            timestamp: '2024-04-23T09:15:00Z',
            read: false,
            channels: ['email', 'in_app']
          },
          {
            id: 2,
            type: 'payment_reminder',
            title: 'Payment Due Reminder',
            message: 'Customer "ABC Corp" has an overdue payment of $5,000',
            timestamp: '2024-04-23T08:30:00Z',
            read: true,
            channels: ['email', 'sms']
          },
          {
            id: 3,
            type: 'system_alert',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will occur on April 25, 2024',
            timestamp: '2024-04-22T16:45:00Z',
            read: true,
            channels: ['email', 'in_app']
          },
          {
            id: 4,
            type: 'backup_alert',
            title: 'Backup Completed',
            message: 'Daily backup completed successfully',
            timestamp: '2024-04-23T02:00:00Z',
            read: false,
            channels: ['email', 'in_app']
          },
          {
            id: 5,
            type: 'security_alert',
            title: 'New Login Detected',
            message: 'New login from Chrome on Windows',
            timestamp: '2024-04-23T10:30:00Z',
            read: false,
            channels: ['email', 'in_app']
          }
        ],
        statistics: {
          totalSent: 1247,
          emailSent: 856,
          smsSent: 234,
          inAppSent: 157,
          deliveryRate: 98.5,
          openRate: 67.2,
          clickRate: 23.8
        }
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        setFormData({
          emailNotifications: data.emailNotifications,
          smsAlerts: data.smsAlerts,
          inAppAlerts: data.inAppAlerts,
          doNotDisturb: data.doNotDisturb
        });
      }
    }
  );

  // Notification settings update mutation
  const updateNotificationMutation = useMutation(
    async (settings) => {
      const updatedSettings = {
        ...notificationData,
        ...settings,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      queryClient.setQueryData('notificationSettings', updatedSettings);
      return updatedSettings;
    },
    {
      onSuccess: () => {
        toast.success('Notification settings updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update notification settings');
      }
    }
  );

  // Test notification mutation
  const testNotificationMutation = useMutation(
    async (channel) => {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { success: true, channel };
    },
    {
      onSuccess: (data) => {
        toast.success(`Test ${data.channel} notification sent successfully`);
      },
      onError: () => {
        toast.error('Failed to send test notification');
      }
    }
  );

  const notifications = notificationData || {};

  const handleToggle = (category, field) => {
    const updatedData = {
      ...formData,
      [category]: {
        ...formData[category],
        [field]: !formData[category][field]
      }
    };
    setFormData(updatedData);
    updateNotificationMutation.mutate(updatedData);
  };

  const handleTimeChange = (field, value) => {
    const updatedData = {
      ...formData,
      doNotDisturb: {
        ...formData.doNotDisturb,
        [field]: value
      }
    };
    setFormData(updatedData);
    updateNotificationMutation.mutate(updatedData);
  };

  const handleTestNotification = (channel) => {
    testNotificationMutation.mutate(channel);
  };

  const handleSaveNotifications = () => {
    updateNotificationMutation.mutate(formData);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'payment_reminder':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'system_alert':
        return <BellIcon className="h-5 w-5 text-purple-500" />;
      case 'backup_alert':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'security_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'in_app':
        return <SpeakerWaveIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const isInDoNotDisturbPeriod = () => {
    if (!formData.doNotDisturb.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = formData.doNotDisturb.startTime.split(':').map(Number);
    const [endHour, endMin] = formData.doNotDisturb.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Manage your notification preferences and alert settings</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.statistics?.totalSent || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email Sent</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.statistics?.emailSent || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SMS Sent</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.statistics?.smsSent || 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DevicePhoneMobileIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.statistics?.deliveryRate || 0}%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          {/* Email Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications.enabled}
                    onChange={() => handleToggle('emailNotifications', 'enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button
                  onClick={() => handleTestNotification('email')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={!formData.emailNotifications.enabled}
                >
                  Test
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Get notified when products are running low' },
                { key: 'paymentReminders', label: 'Payment Reminders', description: 'Remind about overdue payments' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications' },
                { key: 'backupAlerts', label: 'Backup Alerts', description: 'Backup completion and failure notifications' },
                { key: 'securityAlerts', label: 'Security Alerts', description: 'Security-related notifications' },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary reports' },
                { key: 'monthlyReports', label: 'Monthly Reports', description: 'Monthly comprehensive reports' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications[item.key]}
                      onChange={() => handleToggle('emailNotifications', item.key)}
                      disabled={!formData.emailNotifications.enabled}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      !formData.emailNotifications.enabled ? 'bg-gray-100' : 'bg-gray-200 peer-checked:bg-blue-600'
                    }`}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">SMS Alerts</h3>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.smsAlerts.enabled}
                    onChange={() => handleToggle('smsAlerts', 'enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button
                  onClick={() => handleTestNotification('sms')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={!formData.smsAlerts.enabled}
                >
                  Test
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Critical stock level alerts' },
                { key: 'paymentReminders', label: 'Payment Reminders', description: 'Urgent payment reminders' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Critical system issues only' },
                { key: 'backupAlerts', label: 'Backup Alerts', description: 'Backup failures only' },
                { key: 'securityAlerts', label: 'Security Alerts', description: 'Security threats only' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smsAlerts[item.key]}
                      onChange={() => handleToggle('smsAlerts', item.key)}
                      disabled={!formData.smsAlerts.enabled}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      !formData.smsAlerts.enabled ? 'bg-gray-100' : 'bg-gray-200 peer-checked:bg-blue-600'
                    }`}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* In-App Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">In-App Alerts</h3>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inAppAlerts.enabled}
                    onChange={() => handleToggle('inAppAlerts', 'enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button
                  onClick={() => handleTestNotification('in_app')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={!formData.inAppAlerts.enabled}
                >
                  Test
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Real-time stock alerts' },
                { key: 'paymentReminders', label: 'Payment Reminders', description: 'Payment due notifications' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'All system notifications' },
                { key: 'backupAlerts', label: 'Backup Alerts', description: 'Backup status notifications' },
                { key: 'securityAlerts', label: 'Security Alerts', description: 'Security-related notifications' },
                { key: 'desktopNotifications', label: 'Desktop Notifications', description: 'Browser desktop notifications' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inAppAlerts[item.key]}
                      onChange={() => handleToggle('inAppAlerts', item.key)}
                      disabled={!formData.inAppAlerts.enabled}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      !formData.inAppAlerts.enabled ? 'bg-gray-100' : 'bg-gray-200 peer-checked:bg-blue-600'
                    }`}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Do Not Disturb & Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Do Not Disturb */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MoonIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Do Not Disturb</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.doNotDisturb.enabled}
                  onChange={() => handleToggle('doNotDisturb', 'enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.doNotDisturb.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="input"
                  disabled={!formData.doNotDisturb.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.doNotDisturb.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  className="input"
                  disabled={!formData.doNotDisturb.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={formData.doNotDisturb.timezone}
                  onChange={(e) => handleTimeChange('timezone', e.target.value)}
                  className="input"
                  disabled={!formData.doNotDisturb.enabled}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className={`p-3 rounded-lg ${
                isInDoNotDisturbPeriod() ? 'bg-blue-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  {isInDoNotDisturbPeriod() ? (
                    <MoonIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <SunIcon className="h-4 w-4 text-gray-600" />
                  )}
                  <p className={`text-sm ${
                    isInDoNotDisturbPeriod() ? 'text-blue-800' : 'text-gray-600'
                  }`}>
                    {isInDoNotDisturbPeriod() 
                      ? 'Currently in Do Not Disturb period' 
                      : 'Do Not Disturb is not active'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
              </div>
              <span className="text-sm text-gray-500">
                {notifications.recentNotifications?.filter(n => !n.read).length || 0} unread
              </span>
            </div>

            <div className="space-y-3">
              {notifications.recentNotifications?.slice(0, 5).map((notification) => (
                <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-1">
                          {notification.channels.map((channel, index) => (
                            <span key={index} className="text-gray-400">
                              {getChannelIcon(channel)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSaveNotifications}
              className="btn btn-primary flex items-center space-x-2"
              disabled={updateNotificationMutation.isLoading}
            >
              {updateNotificationMutation.isLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
