import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  SignalIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { SOCKET_URL, usersAPI } from '../../services/api';

const LOGIN_HISTORY_KEY = 'loginHistory';
const LOGIN_HISTORY_EVENT = 'local-login-history-updated';

const getCurrentSessionUser = () => {
  const storedMockUser = localStorage.getItem('mockUser');
  const storedUser = localStorage.getItem('user');
  const rawUser = storedMockUser || storedUser;

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const getCurrentSessionName = (currentUser) =>
  [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
  currentUser?.username ||
  currentUser?.email ||
  'Current User';

const formatUserName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || user?.email || user?.name || 'Unknown User';

const UserLogs = () => {
  const currentUser = getCurrentSessionUser();
  const currentUserId = currentUser?._id || currentUser?.user_id || '';
  const isAdmin = currentUser?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState(isAdmin ? 'all' : 'current');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setFilterUser(isAdmin ? 'all' : 'current');
  }, [isAdmin]);

  const { data: userLogsData, isLoading, refetch } = useQuery(
    ['userLogs'],
    async () => {
      const response = await usersAPI.getLoginHistory({ limit: 300 });
      return response?.data?.data?.logs || [];
    },
    {
      refetchInterval: 15000,
      onSuccess: (data) => {
        console.log('User login history refreshed:', data);
      },
    }
  );

  const { data: usersData } = useQuery(
    ['users'],
    async () => {
      const response = await usersAPI.getAll({ limit: 200 });
      return response?.data?.data?.users || [];
    },
    {
      refetchInterval: 30000,
    }
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsLiveConnected(true);
    });

    socket.on('disconnect', () => {
      setIsLiveConnected(false);
    });

    socket.on('connect_error', () => {
      setIsLiveConnected(false);
    });

    socket.on('user:login', (newLog) => {
      queryClient.setQueryData(['userLogs'], (previousLogs = []) => {
        const alreadyPresent = previousLogs.some((log) => log._id === newLog._id);
        if (alreadyPresent) {
          return previousLogs;
        }

        return [newLog, ...previousLogs];
      });

      toast.success(`${newLog.userName} logged in`);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  useEffect(() => {
    const syncFromLocalHistory = (incomingLog) => {
      if (incomingLog) {
        queryClient.setQueryData(['userLogs'], (previousLogs = []) => {
          const alreadyPresent = previousLogs.some((log) => log._id === incomingLog._id);
          if (alreadyPresent) {
            return previousLogs;
          }

          return [incomingLog, ...previousLogs];
        });
        return;
      }

      const rawHistory = localStorage.getItem(LOGIN_HISTORY_KEY);
      if (!rawHistory) {
        return;
      }

      try {
        const history = JSON.parse(rawHistory);
        queryClient.setQueryData(['userLogs'], history);
      } catch (error) {
        console.error('Failed to parse local login history:', error);
      }
    };

    const handleStorage = (event) => {
      if (event.key === LOGIN_HISTORY_KEY) {
        syncFromLocalHistory();
      }
    };

    const handleLocalLoginHistory = (event) => {
      syncFromLocalHistory(event.detail);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(LOGIN_HISTORY_EVENT, handleLocalLoginHistory);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LOGIN_HISTORY_EVENT, handleLocalLoginHistory);
    };
  }, [queryClient]);

  const userLogs = userLogsData || [];
  const users = usersData || [];

  const filteredLogs = useMemo(
    () =>
      userLogs.filter((log) => {
        const matchesSearch =
          log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUser =
          filterUser === 'all' ||
          (filterUser === 'current' ? log.user_id === currentUserId : log.user_id === filterUser);

        const matchesAction = filterAction === 'all' || log.action === filterAction;

        let matchesDate = true;
        if (filterDate !== 'all') {
          const logDate = new Date(log.timestamp).toDateString();
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const weekAgo = new Date(Date.now() - 604800000);

          switch (filterDate) {
            case 'today':
              matchesDate = logDate === today;
              break;
            case 'yesterday':
              matchesDate = logDate === yesterday;
              break;
            case 'week':
              matchesDate = new Date(log.timestamp) >= weekAgo;
              break;
            default:
              matchesDate = true;
          }
        }

        return matchesSearch && matchesUser && matchesAction && matchesDate;
      }),
    [currentUserId, filterAction, filterDate, filterUser, searchTerm, userLogs]
  );

  const openDetailsModal = (log) => {
    setSelectedLog(log);
    setShowActionMenu(null);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries(['userLogs']);
    toast.success('User login history refreshed');
  };

  const handleMenuAction = (action, log) => {
    switch (action) {
      case 'view':
        openDetailsModal(log);
        return;
      case 'focus-user':
        setFilterUser(log.user_id);
        setShowActionMenu(null);
        toast.success(`Filtered logs for ${log.userName}`);
        return;
      default:
        setShowActionMenu(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalLogs = userLogs.length;
  const successLogs = userLogs.filter((log) => log.status === 'success').length;
  const errorLogs = userLogs.filter((log) => log.status === 'error').length;
  const todayLogs = userLogs.filter((log) => new Date(log.timestamp).toDateString() === new Date().toDateString()).length;

  const actionBreakdown = userLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-stack">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">User Logs</h1>
            <p className="page-subtitle">Administrator live login history with user, date, time, IP address, and browser details</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${isLiveConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              <SignalIcon className="h-4 w-4" />
              <span>{isLiveConnected ? 'Live updates on' : 'Polling mode'}</span>
            </div>
            <button onClick={handleRefresh} className="btn btn-secondary flex items-center space-x-2" disabled={isLoading}>
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Current Session User</p>
        <p className="text-lg font-semibold text-gray-900">{getCurrentSessionName(currentUser)}</p>
        <p className="text-xs text-gray-500">{currentUserId || 'No active user id detected'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{totalLogs}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success</p>
              <p className="text-2xl font-bold text-green-600">{successLogs}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{errorLogs}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-yellow-600">{todayLogs}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(actionBreakdown).slice(0, 8).map(([action, count]) => (
          <div key={action} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{action.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search users, email, IP, or action..." className="input pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="input" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              {!isAdmin && <option value="current">Current User</option>}
              <option value="all">All Users</option>
              {users.map((user) => {
                const userId = user.user_id || user._id;
                return (
                  <option key={userId} value={userId}>
                    {formatUserName(user)}
                  </option>
                );
              })}
            </select>
            <select className="input" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="failed_login">Failed Login</option>
              <option value="logout">Logout</option>
            </select>
            <select className="input" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No logs found</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">ID: {log.user_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.ip_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openDetailsModal(log)} style={{ backgroundColor: '#6b7280', color: 'white', border: '2px solid #4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          VIEW
                        </button>
                        <div className="relative">
                          <button type="button" onClick={() => setShowActionMenu(showActionMenu === log._id ? null : log._id)} style={{ backgroundColor: '#6b7280', color: 'white', border: '2px solid #4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', minWidth: '50px' }}>
                            MORE
                          </button>
                          {showActionMenu === log._id && (
                            <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="py-1">
                                <button onClick={() => handleMenuAction('view', log)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <EyeIcon className="h-4 w-4 mr-2 text-gray-600" />
                                  View Log
                                </button>
                                <button onClick={() => handleMenuAction('focus-user', log)} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <UserGroupIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  Filter This User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showDetailsModal && selectedLog && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">User</p>
                <p className="text-sm text-gray-900">{selectedLog.userName}</p>
                <p className="text-xs text-gray-500">ID: {selectedLog.user_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Action</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                  {selectedLog.action.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{selectedLog.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-sm text-gray-900 capitalize">{selectedLog.role || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedLog.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                  {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">IP Address</p>
                <p className="text-sm text-gray-900">{selectedLog.ip_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">User Agent</p>
                <p className="text-sm text-gray-900 break-words">{selectedLog.user_agent}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Timestamp</p>
              <p className="text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">Log ID: {selectedLog._id}</div>
              <div className="flex space-x-3">
                <button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary btn-sm">Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserLogs;
