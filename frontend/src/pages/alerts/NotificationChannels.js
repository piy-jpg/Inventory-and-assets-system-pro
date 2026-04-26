import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const NotificationChannels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    enabled: true,
    settings: {}
  });

  const queryClient = useQueryClient();

  // Real-time notification channels data
  const { data: channelsData, isLoading, refetch } = useQuery(
    'notificationChannels',
    () => {
      const storedChannels = localStorage.getItem('notificationChannels');
      if (storedChannels) {
        return JSON.parse(storedChannels);
      }
      
      return [
        {
          _id: 'CHANNEL_001',
          name: 'Primary Email',
          type: 'email',
          description: 'Main email notification channel for all alerts',
          enabled: true,
          settings: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            username: 'alerts@inventory.com',
            fromEmail: 'alerts@inventory.com',
            fromName: 'Inventory System',
            useTLS: true,
            recipients: ['admin@inventory.com', 'manager@inventory.com'],
            templates: {
              subject: '[{severity}] {title}',
              body: 'Alert: {message}\n\nDetails: {details}\n\nTime: {timestamp}'
            }
          },
          statistics: {
            sentToday: 45,
            sentThisWeek: 234,
            successRate: 98.5,
            lastUsed: '2024-04-23T10:30:00Z'
          }
        },
        {
          _id: 'CHANNEL_002',
          name: 'SMS Notifications',
          type: 'sms',
          description: 'SMS alerts for critical system issues',
          enabled: true,
          settings: {
            provider: 'twilio',
            apiKey: 'masked',
            phoneNumber: '+1234567890',
            recipients: ['+1234567890', '+0987654321'],
            maxCharacters: 160,
            templates: {
              message: '[{severity}] {title}: {message}'
            }
          },
          statistics: {
            sentToday: 12,
            sentThisWeek: 67,
            successRate: 95.2,
            lastUsed: '2024-04-23T09:15:00Z'
          }
        },
        {
          _id: 'CHANNEL_003',
          name: 'In-App Notifications',
          type: 'in_app',
          description: 'Real-time notifications within the application',
          enabled: true,
          settings: {
            maxNotifications: 100,
            autoDismiss: true,
            dismissAfter: 5000,
            soundEnabled: true,
            desktopNotifications: true,
            templates: {
              title: '{title}',
              body: '{message}',
              icon: 'bell'
            }
          },
          statistics: {
            sentToday: 156,
            sentThisWeek: 892,
            successRate: 100,
            lastUsed: '2024-04-23T10:45:00Z'
          }
        },
        {
          _id: 'CHANNEL_004',
          name: 'Webhook Integration',
          type: 'webhook',
          description: 'Webhook notifications for external systems',
          enabled: false,
          settings: {
            url: 'https://api.external-system.com/webhooks/alerts',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer masked'
            },
            timeout: 30000,
            retryAttempts: 3,
            templates: {
              payload: {
                alert_id: '{id}',
                title: '{title}',
                message: '{message}',
                severity: '{severity}',
                timestamp: '{timestamp}'
              }
            }
          },
          statistics: {
            sentToday: 0,
            sentThisWeek: 0,
            successRate: 0,
            lastUsed: null
          }
        },
        {
          _id: 'CHANNEL_005',
          name: 'Slack Integration',
          type: 'slack',
          description: 'Slack channel notifications for team collaboration',
          enabled: true,
          settings: {
            webhookUrl: 'https://hooks.slack.com/services/masked',
            channel: '#alerts',
            username: 'Inventory Bot',
            iconEmoji: ':warning:',
            templates: {
              text: '[{severity}] {title}',
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: '*{title}*\n{message}'
                  }
                }
              ]
            }
          },
          statistics: {
            sentToday: 28,
            sentThisWeek: 145,
            successRate: 97.8,
            lastUsed: '2024-04-23T08:30:00Z'
          }
        },
        {
          _id: 'CHANNEL_006',
          name: 'WhatsApp Business',
          type: 'whatsapp',
          description: 'WhatsApp notifications for mobile users',
          enabled: false,
          settings: {
            provider: 'twilio',
            apiKey: 'masked',
            phoneNumber: '+1234567890',
            recipients: ['+1234567890'],
            templates: {
              message: '*{title}*\n{message}'
            }
          },
          statistics: {
            sentToday: 0,
            sentThisWeek: 0,
            successRate: 0,
            lastUsed: null
          }
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Notification channels data refreshed:', data);
      }
    }
  );

  // Mutation for creating notification channel
  const createChannelMutation = useMutation(
    async (channelData) => {
      const channels = channelsData || [];
      const newChannel = {
        ...channelData,
        _id: `CHANNEL_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        statistics: {
          sentToday: 0,
          sentThisWeek: 0,
          successRate: 0,
          lastUsed: null
        }
      };
      const updatedChannels = [...channels, newChannel];
      localStorage.setItem('notificationChannels', JSON.stringify(updatedChannels));
      queryClient.setQueryData('notificationChannels', updatedChannels);
      return newChannel;
    },
    {
      onSuccess: () => {
        toast.success('Notification channel created successfully');
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to create notification channel');
      }
    }
  );

  // Mutation for updating notification channel
  const updateChannelMutation = useMutation(
    async (updatedChannel) => {
      const channels = channelsData || [];
      const updatedChannels = channels.map(channel => 
        channel._id === updatedChannel._id ? {
          ...updatedChannel,
          updated_at: new Date().toISOString()
        } : channel
      );
      localStorage.setItem('notificationChannels', JSON.stringify(updatedChannels));
      queryClient.setQueryData('notificationChannels', updatedChannels);
      return updatedChannels;
    },
    {
      onSuccess: () => {
        toast.success('Notification channel updated successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update notification channel');
      }
    }
  );

  // Mutation for deleting notification channel
  const deleteChannelMutation = useMutation(
    async (channelId) => {
      const channels = channelsData || [];
      const updatedChannels = channels.filter(channel => channel._id !== channelId);
      localStorage.setItem('notificationChannels', JSON.stringify(updatedChannels));
      queryClient.setQueryData('notificationChannels', updatedChannels);
      return updatedChannels;
    },
    {
      onSuccess: () => {
        toast.success('Notification channel deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete notification channel');
      }
    }
  );

  // Mutation for toggling notification channel
  const toggleChannelMutation = useMutation(
    async ({ channelId, enabled }) => {
      const channels = channelsData || [];
      const updatedChannels = channels.map(channel => 
        channel._id === channelId ? {
          ...channel,
          enabled,
          updated_at: new Date().toISOString()
        } : channel
      );
      localStorage.setItem('notificationChannels', JSON.stringify(updatedChannels));
      queryClient.setQueryData('notificationChannels', updatedChannels);
      return updatedChannels;
    },
    {
      onSuccess: () => {
        toast.success('Notification channel updated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update notification channel');
      }
    }
  );

  // Mutation for testing notification channel
  const testChannelMutation = useMutation(
    async (channelId) => {
      // Simulate test notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Test notification sent successfully' };
    },
    {
      onSuccess: (data) => {
        toast.success(data.message);
        setShowTestModal(false);
      },
      onError: () => {
        toast.error('Failed to send test notification');
      }
    }
  );

  const channels = channelsData || [];

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        channel.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || channel.type === filterType;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'enabled' ? channel.enabled : !channel.enabled);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      enabled: true,
      settings: {}
    });
  };

  const openDetailsModal = (channel) => {
    setSelectedChannel(channel);
    setShowDetailsModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openTestModal = (channel) => {
    setSelectedChannel(channel);
    setShowTestModal(true);
  };

  const handleCreateChannel = () => {
    if (!formData.name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    if (!formData.type) {
      toast.error('Channel type is required');
      return;
    }

    createChannelMutation.mutate(formData);
  };

  const handleUpdateChannel = () => {
    if (!selectedChannel) return;

    if (!formData.name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    updateChannelMutation.mutate({
      ...selectedChannel,
      ...formData
    });
  };

  const handleDeleteChannel = () => {
    if (!selectedChannel) return;

    if (window.confirm('Are you sure you want to delete this notification channel? This action cannot be undone.')) {
      deleteChannelMutation.mutate(selectedChannel._id);
    }
  };

  const handleToggleChannel = (channelId, enabled) => {
    toggleChannelMutation.mutate({
      channelId,
      enabled
    });
  };

  const handleTestChannel = () => {
    if (!selectedChannel) return;

    testChannelMutation.mutate(selectedChannel._id);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Notification channels data refreshed');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'in_app':
        return 'bg-purple-100 text-purple-800';
      case 'webhook':
        return 'bg-orange-100 text-orange-800';
      case 'slack':
        return 'bg-pink-100 text-pink-800';
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'in_app':
        return <ComputerDesktopIcon className="h-4 w-4" />;
      case 'webhook':
        return <PaperAirplaneIcon className="h-4 w-4" />;
      case 'slack':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'whatsapp':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    if (rate > 0) return 'text-orange-600';
    return 'text-gray-600';
  };

  // Calculate statistics
  const totalChannels = channels.length;
  const enabledChannels = channels.filter(channel => channel.enabled).length;
  const disabledChannels = channels.filter(channel => !channel.enabled).length;
  const totalSentToday = channels.reduce((sum, channel) => sum + channel.statistics.sentToday, 0);
  const avgSuccessRate = channels.length > 0 
    ? (channels.reduce((sum, channel) => sum + channel.statistics.successRate, 0) / channels.length).toFixed(1)
    : 0;

  // Type breakdown
  const typeBreakdown = channels.reduce((acc, channel) => {
    acc[channel.type] = (acc[channel.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Notification Channels</h1>
            <p className="page-subtitle">Email alerts, SMS alerts, In-app notifications, WhatsApp (optional advanced)</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={openCreateModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Channel</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Channels</p>
              <p className="text-2xl font-bold text-gray-900">{totalChannels}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enabled</p>
              <p className="text-2xl font-bold text-green-600">{enabledChannels}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent Today</p>
              <p className="text-2xl font-bold text-blue-600">{totalSentToday}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <PaperAirplaneIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className={`text-2xl font-bold ${getSuccessRateColor(avgSuccessRate)}`}>{avgSuccessRate}%</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Channel Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon(type)}
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notification channels..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-App</option>
              <option value="webhook">Webhook</option>
              <option value="slack">Slack</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Channels Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent Today
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChannels.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No notification channels found
                  </td>
                </tr>
              ) : (
                filteredChannels.map((channel) => (
                  <tr key={channel._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                      <div className="text-xs text-gray-500">ID: {channel._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(channel.type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(channel.type)}`}>
                          {channel.type.replace('_', ' ').charAt(0).toUpperCase() + channel.type.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{channel.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{channel.statistics.sentToday}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getSuccessRateColor(channel.statistics.successRate)}`}>
                        {channel.statistics.successRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleChannel(channel._id, !channel.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          channel.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            channel.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(channel)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openTestModal(channel)}
                          className="text-green-600 hover:text-green-900"
                          title="Test Channel"
                          disabled={!channel.enabled}
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Notification Channel</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateChannel();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter channel name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select channel type</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="in_app">In-App</option>
                    <option value="webhook">Webhook</option>
                    <option value="slack">Slack</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="2"
                    placeholder="Enter channel description"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enable channel</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createChannelMutation.isLoading}
                >
                  {createChannelMutation.isLoading ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Channel Details Modal */}
      {showDetailsModal && selectedChannel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Channel Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Channel Name</p>
                  <p className="text-sm text-gray-900">{selectedChannel.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Channel Type</p>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedChannel.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedChannel.type)}`}>
                      {selectedChannel.type.replace('_', ' ').charAt(0).toUpperCase() + selectedChannel.type.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-sm text-gray-900">{selectedChannel.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedChannel.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedChannel.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(selectedChannel.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm text-gray-900">{new Date(selectedChannel.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent Today</p>
                  <p className="text-sm text-gray-900">{selectedChannel.statistics.sentToday}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent This Week</p>
                  <p className="text-sm text-gray-900">{selectedChannel.statistics.sentThisWeek}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className={`text-sm font-medium ${getSuccessRateColor(selectedChannel.statistics.successRate)}`}>
                    {selectedChannel.statistics.successRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Used</p>
                  <p className="text-sm text-gray-900">
                    {selectedChannel.statistics.lastUsed 
                      ? new Date(selectedChannel.statistics.lastUsed).toLocaleDateString() 
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>

            {selectedChannel.settings && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Channel Settings</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedChannel.settings, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    // Open edit modal with current channel data
                    setFormData({
                      name: selectedChannel.name,
                      type: selectedChannel.type,
                      description: selectedChannel.description,
                      enabled: selectedChannel.enabled,
                      settings: selectedChannel.settings
                    });
                    setShowCreateModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteChannel}
                  className="btn btn-outline btn-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Test Channel Modal */}
      {showTestModal && selectedChannel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTestModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Notification Channel</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Channel</p>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedChannel.type)}
                  <span className="text-sm text-gray-900">{selectedChannel.name}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Test Message</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    This is a test notification from the Inventory Management System.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  A test notification will be sent to verify the channel configuration.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTestModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleTestChannel}
                className="btn btn-primary"
                disabled={testChannelMutation.isLoading}
              >
                {testChannelMutation.isLoading ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationChannels;
