import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Integrations = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTestStep, setCurrentTestStep] = useState('');
  const [showApiKeys, setShowApiKeys] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    type: 'payment',
    provider: '',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    enabled: true,
    sandbox: true
  });

  const queryClient = useQueryClient();

  // Mock integrations data
  const { data: integrationsData, isLoading, refetch } = useQuery(
    'integrationsSettings',
    () => {
      const storedSettings = localStorage.getItem('integrationsSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      return {
        paymentGateways: [
          {
            id: 'pg_001',
            name: 'Razorpay',
            type: 'payment',
            provider: 'razorpay',
            apiKey: 'rzp_test_1234567890abcdef',
            secretKey: 'sk_test_1234567890abcdef',
            webhookUrl: 'https://yourapp.com/webhook/razorpay',
            enabled: true,
            sandbox: true,
            status: 'connected',
            lastTest: '2024-04-23T10:00:00Z',
            transactions: 1250,
            successRate: 98.5,
            currency: 'USD',
            supportedMethods: ['card', 'upi', 'netbanking', 'wallet']
          },
          {
            id: 'pg_002',
            name: 'Stripe',
            type: 'payment',
            provider: 'stripe',
            apiKey: 'sk_test_1234567890abcdef',
            secretKey: 'sk_live_1234567890abcdef',
            webhookUrl: 'https://yourapp.com/webhook/stripe',
            enabled: false,
            sandbox: false,
            status: 'disconnected',
            lastTest: null,
            transactions: 0,
            successRate: 0,
            currency: 'USD',
            supportedMethods: ['card', 'apple_pay', 'google_pay', 'bank_transfer']
          }
        ],
        emailServices: [
          {
            id: 'email_001',
            name: 'SendGrid',
            type: 'email',
            provider: 'sendgrid',
            apiKey: 'SG.1234567890abcdef',
            fromEmail: 'noreply@yourapp.com',
            fromName: 'Smart Inventory',
            enabled: true,
            sandbox: false,
            status: 'connected',
            lastTest: '2024-04-23T09:30:00Z',
            emailsSent: 5680,
            deliveryRate: 97.2,
            openRate: 45.8,
            templates: ['welcome', 'invoice', 'reminder', 'alert']
          },
          {
            id: 'email_002',
            name: 'SMTP',
            type: 'email',
            provider: 'smtp',
            host: 'smtp.gmail.com',
            port: 587,
            username: 'yourapp@gmail.com',
            password: 'app_password',
            fromEmail: 'noreply@yourapp.com',
            fromName: 'Smart Inventory',
            enabled: false,
            sandbox: false,
            status: 'disconnected',
            lastTest: null,
            emailsSent: 0,
            deliveryRate: 0,
            openRate: 0,
            templates: []
          }
        ],
        smsServices: [
          {
            id: 'sms_001',
            name: 'Twilio',
            type: 'sms',
            provider: 'twilio',
            apiKey: 'AC1234567890abcdef',
            secretKey: 'auth_token_1234567890abcdef',
            fromNumber: '+1234567890',
            enabled: true,
            sandbox: true,
            status: 'connected',
            lastTest: '2024-04-23T08:45:00Z',
            smsSent: 2340,
            deliveryRate: 96.8,
            countries: ['US', 'CA', 'UK', 'AU', 'IN']
          }
        ],
        cloudStorage: [
          {
            id: 'cloud_001',
            name: 'AWS S3',
            type: 'cloud',
            provider: 'aws',
            accessKey: 'AKIAIOSFODNN7EXAMPLE',
            secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            bucket: 'smart-inventory-backups',
            region: 'us-east-1',
            enabled: true,
            sandbox: false,
            status: 'connected',
            lastTest: '2024-04-23T07:00:00Z',
            storageUsed: '45.2 GB',
            filesStored: 15680,
            lastBackup: '2024-04-23T02:00:00Z'
          },
          {
            id: 'cloud_002',
            name: 'Google Drive',
            type: 'cloud',
            provider: 'google',
            apiKey: 'ya29.a0AfH6SMC1234567890abcdef',
            folderId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms7dyF',
            enabled: false,
            sandbox: false,
            status: 'disconnected',
            lastTest: null,
            storageUsed: '0 GB',
            filesStored: 0,
            lastBackup: null
          }
        ],
        statistics: {
          totalIntegrations: 7,
          activeIntegrations: 4,
          totalTransactions: 1250,
          totalEmails: 5680,
          totalSms: 2340,
          totalStorage: '45.2 GB',
          avgSuccessRate: 97.5
        }
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        console.log('Integrations data refreshed:', data);
      }
    }
  );

  // Add integration mutation
  const addIntegrationMutation = useMutation(
    async (integrationData) => {
      const newIntegration = {
        ...integrationData,
        id: `${integrationData.type}_${Date.now()}`,
        status: 'disconnected',
        lastTest: null,
        transactions: 0,
        successRate: 0
      };

      const updatedData = {
        ...integrationsData,
        [`${integrationData.type}Gateways`]: [
          ...(integrationsData[`${integrationData.type}Gateways`] || []),
          newIntegration
        ]
      };
      localStorage.setItem('integrationsSettings', JSON.stringify(updatedData));
      queryClient.setQueryData('integrationsSettings', updatedData);
      
      return newIntegration;
    },
    {
      onSuccess: () => {
        toast.success('Integration added successfully');
        setShowAddModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to add integration');
      }
    }
  );

  // Test integration mutation
  const testIntegrationMutation = useMutation(
    async (integrationId) => {
      setShowTestModal(true);
      setTestProgress(0);
      
      // Simulate testing process
      const steps = [
        { name: 'Validating API credentials', duration: 2000 },
        { name: 'Testing connection to provider', duration: 1500 },
        { name: 'Verifying webhook endpoint', duration: 1000 },
        { name: 'Checking service availability', duration: 1000 },
        { name: 'Validating configuration', duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentTestStep(steps[i].name);
        setTestProgress((i + 1) / steps.length * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Update integration status
      const updatedData = { ...integrationsData };
      const allIntegrations = [
        ...updatedData.paymentGateways,
        ...updatedData.emailServices,
        ...updatedData.smsServices,
        ...updatedData.cloudStorage
      ];
      
      const integration = allIntegrations.find(int => int.id === integrationId);
      if (integration) {
        integration.status = 'connected';
        integration.lastTest = new Date().toISOString();
      }
      
      localStorage.setItem('integrationsSettings', JSON.stringify(updatedData));
      queryClient.setQueryData('integrationsSettings', updatedData);
      
      setTestProgress(100);
      setCurrentTestStep('Test completed successfully');
      
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Integration test completed successfully');
        setTimeout(() => setShowTestModal(false), 2000);
        refetch();
      },
      onError: () => {
        toast.error('Integration test failed');
        setShowTestModal(false);
      }
    }
  );

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation(
    async (integrationId) => {
      const updatedData = { ...integrationsData };
      
      // Remove from all categories
      ['paymentGateways', 'emailServices', 'smsServices', 'cloudStorage'].forEach(category => {
        updatedData[category] = updatedData[category]?.filter(int => int.id !== integrationId) || [];
      });
      
      localStorage.setItem('integrationsSettings', JSON.stringify(updatedData));
      queryClient.setQueryData('integrationsSettings', updatedData);
      
      return updatedData;
    },
    {
      onSuccess: () => {
        toast.success('Integration deleted successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete integration');
      }
    }
  );

  const integrations = integrationsData || {};

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'payment',
      provider: '',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      enabled: true,
      sandbox: true
    });
  };

  const handleAddIntegration = () => {
    if (!formData.name.trim() || !formData.provider.trim()) {
      toast.error('Name and provider are required');
      return;
    }

    addIntegrationMutation.mutate(formData);
  };

  const handleTestIntegration = (integrationId) => {
    setSelectedIntegration(integrationId);
    testIntegrationMutation.mutate(integrationId);
  };

  const handleDeleteIntegration = (integrationId) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      deleteIntegrationMutation.mutate(integrationId);
    }
  };

  const toggleApiKeyVisibility = (integrationId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntegrationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'cloud':
        return <CloudArrowUpIcon className="h-5 w-5" />;
      default:
        return <KeyIcon className="h-5 w-5" />;
    }
  };

  const providers = {
    payment: ['razorpay', 'stripe', 'paypal', 'square', 'braintree'],
    email: ['sendgrid', 'mailgun', 'smtp', 'ses', 'postmark'],
    sms: ['twilio', 'plivo', 'messagebird', 'nexmo', 'clickatell'],
    cloud: ['aws', 'google', 'azure', 'dropbox', 'onedrive']
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
            <h1 className="page-title">Integrations</h1>
            <p className="page-subtitle">Configure payment gateways, email services, SMS API, and cloud storage</p>
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
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Integration</span>
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
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.statistics?.totalIntegrations || 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <KeyIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{integrations.statistics?.activeIntegrations || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.statistics?.totalTransactions || 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCardIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.statistics?.avgSuccessRate || 0}%</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Gateways */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Gateways</h3>
          <CreditCardIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {integrations.paymentGateways?.map((gateway) => (
            <div key={gateway.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{gateway.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{gateway.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gateway.status)}`}>
                    {gateway.status}
                  </span>
                  {gateway.sandbox && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Sandbox
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Transactions</p>
                  <p className="font-medium text-gray-900">{gateway.transactions || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Success Rate</p>
                  <p className="font-medium text-gray-900">{gateway.successRate || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Currency</p>
                  <p className="font-medium text-gray-900">{gateway.currency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Test</p>
                  <p className="font-medium text-gray-900">
                    {gateway.lastTest ? new Date(gateway.lastTest).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">API Key:</span>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {showApiKeys[gateway.id] ? gateway.apiKey : gateway.apiKey?.slice(0, 8) + '...'}
                      </code>
                      <button
                        onClick={() => toggleApiKeyVisibility(gateway.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showApiKeys[gateway.id] ? (
                          <EyeSlashIcon className="h-3 w-3" />
                        ) : (
                          <EyeIcon className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestIntegration(gateway.id)}
                    className="btn btn-secondary btn-sm"
                    disabled={testIntegrationMutation.isLoading}
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(gateway.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Email Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Email Services</h3>
          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {integrations.emailServices?.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{service.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Emails Sent</p>
                  <p className="font-medium text-gray-900">{service.emailsSent || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Delivery Rate</p>
                  <p className="font-medium text-gray-900">{service.deliveryRate || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Open Rate</p>
                  <p className="font-medium text-gray-900">{service.openRate || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-600">From Email</p>
                  <p className="font-medium text-gray-900">{service.fromEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Templates:</span>
                    <span className="text-xs text-gray-900">
                      {service.templates?.length || 0} available
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestIntegration(service.id)}
                    className="btn btn-secondary btn-sm"
                    disabled={testIntegrationMutation.isLoading}
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(service.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* SMS Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SMS Services</h3>
          <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {integrations.smsServices?.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{service.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  {service.sandbox && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Sandbox
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">SMS Sent</p>
                  <p className="font-medium text-gray-900">{service.smsSent || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Delivery Rate</p>
                  <p className="font-medium text-gray-900">{service.deliveryRate || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-600">From Number</p>
                  <p className="font-medium text-gray-900">{service.fromNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Countries</p>
                  <p className="font-medium text-gray-900">{service.countries?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Countries:</span>
                    <span className="text-xs text-gray-900">
                      {service.countries?.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestIntegration(service.id)}
                    className="btn btn-secondary btn-sm"
                    disabled={testIntegrationMutation.isLoading}
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(service.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cloud Storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cloud Storage</h3>
          <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {integrations.cloudStorage?.map((storage) => (
            <div key={storage.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <CloudArrowUpIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{storage.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{storage.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storage.status)}`}>
                    {storage.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Storage Used</p>
                  <p className="font-medium text-gray-900">{storage.storageUsed || '0 GB'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Files Stored</p>
                  <p className="font-medium text-gray-900">{storage.filesStored || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Region</p>
                  <p className="font-medium text-gray-900">{storage.region || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Backup</p>
                  <p className="font-medium text-gray-900">
                    {storage.lastBackup ? new Date(storage.lastBackup).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  {storage.bucket && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Bucket:</span>
                      <span className="text-xs text-gray-900">{storage.bucket}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestIntegration(storage.id)}
                    className="btn btn-secondary btn-sm"
                    disabled={testIntegrationMutation.isLoading}
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(storage.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Integration</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddIntegration();
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Integration Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter integration name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, provider: '' }))}
                      className="input"
                      required
                    >
                      <option value="payment">Payment Gateway</option>
                      <option value="email">Email Service</option>
                      <option value="sms">SMS Service</option>
                      <option value="cloud">Cloud Storage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select provider</option>
                    {providers[formData.type]?.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="input"
                    placeholder="Enter API key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={formData.secretKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                    className="input"
                    placeholder="Enter secret key (if required)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    className="input"
                    placeholder="https://yourapp.com/webhook/endpoint"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable integration</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sandbox}
                        onChange={(e) => setFormData(prev => ({ ...prev, sandbox: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Use sandbox mode</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addIntegrationMutation.isLoading}
                >
                  {addIntegrationMutation.isLoading ? 'Adding...' : 'Add Integration'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Test Integration Modal */}
      {showTestModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Testing Integration</h3>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                    style={{ transform: 'rotate(45deg)' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{currentTestStep}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(testProgress)}% Complete</p>
              </div>
              
              {testProgress === 100 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Integration test completed successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Integrations;
