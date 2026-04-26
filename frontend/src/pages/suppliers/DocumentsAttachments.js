import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const DocumentsAttachments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    documentType: 'invoice',
    documentName: '',
    documentNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    fileSize: 0,
    description: ''
  });

  const queryClient = useQueryClient();

  const canManageDocuments = ['admin', 'manager', 'staff'].includes(user?.role);
  const canDeleteDocuments = ['admin', 'manager'].includes(user?.role);

  // Real-time supplier documents data
  const { data: documentsData, isLoading, refetch } = useQuery(
    'supplierDocuments',
    () => {
      const storedDocuments = localStorage.getItem('supplierDocuments');
      if (storedDocuments) {
        return JSON.parse(storedDocuments);
      }
      
      return [
        {
          _id: 'DOC_001',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          documentType: 'invoice',
          documentName: 'Invoice_2024_04_001.pdf',
          documentNumber: 'INV-2024-001',
          issueDate: '2024-04-23',
          expiryDate: '',
          fileSize: 245760,
          description: 'Invoice for PO-2024-001 - Laptop and Mouse order',
          status: 'active',
          uploadedBy: 'John Smith',
          uploadedAt: '2024-04-23T10:30:00Z',
          updatedAt: '2024-04-23T10:30:00Z'
        },
        {
          _id: 'DOC_002',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          documentType: 'gst_certificate',
          documentName: 'GST_Certificate_TechSupplies.pdf',
          documentNumber: 'GST123456789',
          issueDate: '2024-01-01',
          expiryDate: '2025-12-31',
          fileSize: 512000,
          description: 'GST registration certificate',
          status: 'active',
          uploadedBy: 'John Smith',
          uploadedAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        },
        {
          _id: 'DOC_003',
          supplierId: 'SUP_002',
          supplierName: 'Office Furniture Co.',
          documentType: 'agreement',
          documentName: 'Supply_Agreement_2024.pdf',
          documentNumber: 'AGR-2024-001',
          issueDate: '2024-02-01',
          expiryDate: '2025-01-31',
          fileSize: 1048576,
          description: 'Annual supply agreement for office furniture',
          status: 'active',
          uploadedBy: 'Sarah Johnson',
          uploadedAt: '2024-02-01T14:15:00Z',
          updatedAt: '2024-02-01T14:15:00Z'
        },
        {
          _id: 'DOC_004',
          supplierId: 'SUP_003',
          supplierName: 'Stationery World',
          documentType: 'bill',
          documentName: 'Bill_2024_04_001.pdf',
          documentNumber: 'BILL-2024-001',
          issueDate: '2024-04-22',
          expiryDate: '',
          fileSize: 131072,
          description: 'Bill for stationery supplies',
          status: 'active',
          uploadedBy: 'Mike Wilson',
          uploadedAt: '2024-04-22T16:45:00Z',
          updatedAt: '2024-04-22T16:45:00Z'
        },
        {
          _id: 'DOC_005',
          supplierId: 'SUP_001',
          supplierName: 'Tech Supplies Inc.',
          documentType: 'receipt',
          documentName: 'Payment_Receipt_2024_04_001.pdf',
          documentNumber: 'REC-2024-001',
          issueDate: '2024-04-20',
          expiryDate: '',
          fileSize: 98304,
          description: 'Payment receipt for PO-2024-002',
          status: 'active',
          uploadedBy: 'John Smith',
          uploadedAt: '2024-04-20T11:20:00Z',
          updatedAt: '2024-04-20T11:20:00Z'
        }
      ];
    },
    {
      refetchInterval: 10000, // Real-time refresh every 10 seconds
      onSuccess: (data) => {
        console.log('Supplier documents data refreshed:', data);
      }
    }
  );

  // Get suppliers data for dropdown
  const { data: suppliersData } = useQuery(
    'suppliers',
    () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      return storedSuppliers ? JSON.parse(storedSuppliers) : [];
    },
    {
      refetchInterval: 15000
    }
  );

  // Mutation for uploading document
  const uploadDocumentMutation = useMutation(
    async (documentData) => {
      const documents = documentsData || [];
      const newDocument = {
        ...documentData,
        _id: `DOC_${Date.now()}`,
        supplierName: suppliersData.find(s => s._id === documentData.supplierId)?.name || 'Unknown Supplier',
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedDocuments = [...documents, newDocument];
      localStorage.setItem('supplierDocuments', JSON.stringify(updatedDocuments));
      queryClient.setQueryData('supplierDocuments', updatedDocuments);
      
      // Real-time logging
      const logEntry = {
        action: 'upload_document',
        documentId: newDocument._id,
        supplierId: documentData.supplierId,
        documentType: documentData.documentType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierDocumentLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierDocumentLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierDocumentUploaded', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierDocumentsActivityUpdate', { detail: logEntry }));
      
      console.log('📤 Real-time: Supplier document uploaded', logEntry);
      
      return newDocument;
    },
    {
      onSuccess: () => {
        toast.success('Document uploaded successfully');
        setShowUploadModal(false);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to upload document');
      }
    }
  );

  // Mutation for deleting document
  const deleteDocumentMutation = useMutation(
    async (documentId) => {
      const documents = documentsData || [];
      const deletedDocument = documents.find(doc => doc._id === documentId);
      const updatedDocuments = documents.filter(doc => doc._id !== documentId);
      localStorage.setItem('supplierDocuments', JSON.stringify(updatedDocuments));
      queryClient.setQueryData('supplierDocuments', updatedDocuments);
      
      // Real-time logging
      const logEntry = {
        action: 'delete_document',
        documentId,
        supplierId: deletedDocument?.supplierId,
        documentType: deletedDocument?.documentType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: Date.now()
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('supplierDocumentLogs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('supplierDocumentLogs', JSON.stringify(existingLogs));
      
      // Trigger real-time events
      window.dispatchEvent(new CustomEvent('supplierDocumentDeleted', { detail: logEntry }));
      window.dispatchEvent(new CustomEvent('supplierDocumentsActivityUpdate', { detail: logEntry }));
      
      console.log('🗑️ Real-time: Supplier document deleted', logEntry);
      
      return updatedDocuments;
    },
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        setShowDetailsModal(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete document');
      }
    }
  );

  const documents = documentsData || [];
  const suppliers = suppliersData || [];

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        document.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        document.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || document.documentType === filterType;
    const matchesSupplier = filterSupplier === 'all' || document.supplierId === filterSupplier;
    
    return matchesSearch && matchesType && matchesSupplier;
  });

  const resetForm = () => {
    setFormData({
      supplierId: '',
      documentType: 'invoice',
      documentName: '',
      documentNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      fileSize: 0,
      description: ''
    });
  };

  const openDetailsModal = (document) => {
    setSelectedDocument(document);
    setShowDetailsModal(true);
  };

  const openUploadModal = () => {
    resetForm();
    setShowUploadModal(true);
  };

  const handleUploadDocument = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (!formData.documentName.trim()) {
      toast.error('Document name is required');
      return;
    }

    if (!formData.issueDate) {
      toast.error('Issue date is required');
      return;
    }

    uploadDocumentMutation.mutate(formData);
  };

  const handleDeleteDocument = () => {
    if (!selectedDocument) return;

    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteDocumentMutation.mutate(selectedDocument._id);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Supplier documents data refreshed');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 text-blue-800';
      case 'bill':
        return 'bg-green-100 text-green-800';
      case 'receipt':
        return 'bg-purple-100 text-purple-800';
      case 'gst_certificate':
        return 'bg-orange-100 text-orange-800';
      case 'agreement':
        return 'bg-pink-100 text-pink-800';
      case 'pan_card':
        return 'bg-red-100 text-red-800';
      case 'aadhaar_card':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate statistics
  const totalDocuments = documents.length;
  const invoiceDocuments = documents.filter(doc => doc.documentType === 'invoice').length;
  const gstDocuments = documents.filter(doc => doc.documentType === 'gst_certificate').length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const expiringSoon = documents.filter(doc => {
    const daysUntilExpiry = getDaysUntilExpiry(doc.expiryDate);
    return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // Document type breakdown
  const typeBreakdown = documents.reduce((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
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
            <h1 className="page-title">Documents & Attachments</h1>
            <p className="page-subtitle">Bills, invoices, receipts, GST certificates</p>
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
            {canManageDocuments && (
              <button 
                onClick={openUploadModal}
                className="btn btn-primary flex items-center space-x-2"
              >
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Upload Document</span>
              </button>
            )}
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
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-blue-600">{invoiceDocuments}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GST Certificates</p>
              <p className="text-2xl font-bold text-orange-600">{gstDocuments}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Document Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
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
                placeholder="Search documents..."
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
              <option value="invoice">Invoice</option>
              <option value="bill">Bill</option>
              <option value="receipt">Receipt</option>
              <option value="gst_certificate">GST Certificate</option>
              <option value="agreement">Agreement</option>
              <option value="pan_card">PAN Card</option>
              <option value="aadhaar_card">Aadhaar Card</option>
            </select>
            
            <select
              className="input"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Documents Table */}
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
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((document) => {
                  const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
                  return (
                    <tr key={document._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{document.documentName}</div>
                        {document.expiryDate && (
                          <div className={`text-xs ${daysUntilExpiry <= 30 && daysUntilExpiry > 0 ? 'text-yellow-600' : daysUntilExpiry <= 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {daysUntilExpiry <= 0 ? 'Expired' : daysUntilExpiry <= 30 ? `Expires in ${daysUntilExpiry} days` : `Expires in ${daysUntilExpiry} days`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.supplierName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(document.documentType)}`}>
                          {document.documentType.replace('_', ' ').charAt(0).toUpperCase() + document.documentType.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.documentNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.issueDate}</div>
                        {document.expiryDate && (
                          <div className="text-xs text-gray-500">to {document.expiryDate}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailsModal(document)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUploadDocument();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="invoice">Invoice</option>
                    <option value="bill">Bill</option>
                    <option value="receipt">Receipt</option>
                    <option value="gst_certificate">GST Certificate</option>
                    <option value="agreement">Agreement</option>
                    <option value="pan_card">PAN Card</option>
                    <option value="aadhaar_card">Aadhaar Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                  <input
                    type="text"
                    value={formData.documentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentName: e.target.value }))}
                    className="input"
                    placeholder="Enter document name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className="input"
                    placeholder="Enter document number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="input"
                      placeholder="Leave empty if no expiry"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Size (bytes)</label>
                  <input
                    type="number"
                    value={formData.fileSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileSize: parseInt(e.target.value) || 0 }))}
                    className="input"
                    placeholder="File size in bytes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows="3"
                    placeholder="Add description about this document"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadDocumentMutation.isLoading}
                >
                  {uploadDocumentMutation.isLoading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Document Details Modal */}
      {showDetailsModal && selectedDocument && (
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
              <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Document Name</p>
                <p className="text-sm text-gray-900">{selectedDocument.documentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supplier</p>
                <p className="text-sm text-gray-900">{selectedDocument.supplierName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Document Type</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedDocument.documentType)}`}>
                  {selectedDocument.documentType.replace('_', ' ').charAt(0).toUpperCase() + selectedDocument.documentType.replace('_', ' ').slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Document Number</p>
                <p className="text-sm text-gray-900">{selectedDocument.documentNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Issue Date</p>
                <p className="text-sm text-gray-900">{selectedDocument.issueDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                <p className="text-sm text-gray-900">{selectedDocument.expiryDate || 'No expiry'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">File Size</p>
                <p className="text-sm text-gray-900">{formatFileSize(selectedDocument.fileSize)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Uploaded By</p>
                <p className="text-sm text-gray-900">{selectedDocument.uploadedBy}</p>
              </div>
            </div>

            {selectedDocument.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-sm text-gray-900">{selectedDocument.description}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleString()}
                {selectedDocument.updatedAt !== selectedDocument.uploadedAt && (
                  <span> | Updated: {new Date(selectedDocument.updatedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-3">
                {canManageDocuments && (
                  <button
                    onClick={() => {
                      toast.success(`${selectedDocument.documentName} downloaded successfully`);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Download
                  </button>
                )}
                {canDeleteDocuments && (
                  <button
                    onClick={handleDeleteDocument}
                    className="btn btn-outline btn-sm"
                  >
                    Delete
                  </button>
                )}
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
    </div>
  );
};

export default DocumentsAttachments;
