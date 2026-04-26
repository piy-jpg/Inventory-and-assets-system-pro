import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  XMarkIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetDocuments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAsset, setFilterAsset] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const queryClient = useQueryClient();

  // Real-time asset documents data
  const { data: documentsData, isLoading, refetch } = useQuery(
    'assetDocuments',
    () => {
      const storedDocuments = localStorage.getItem('assetDocuments');
      if (storedDocuments) {
        return JSON.parse(storedDocuments);
      }
      
      return [
        {
          _id: 'DOC_001',
          asset_id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          document_type: 'invoice',
          title: 'Purchase Invoice - Laptop Pro 15"',
          description: 'Original purchase invoice from Tech Supplies Inc.',
          file_name: 'invoice_laptop_001.pdf',
          file_size: 245760,
          file_type: 'pdf',
          upload_date: '2023-01-15',
          expiry_date: '2025-01-15',
          uploaded_by: 'John Smith',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'DOC_002',
          asset_id: 'AST_001',
          asset_name: 'Laptop Pro 15"',
          asset_tag: 'LAPTOP-001',
          document_type: 'warranty',
          title: 'Warranty Certificate - Laptop Pro 15"',
          description: 'Manufacturer warranty certificate for 2 years coverage',
          file_name: 'warranty_laptop_001.pdf',
          file_size: 156789,
          file_type: 'pdf',
          upload_date: '2023-01-15',
          expiry_date: '2025-01-15',
          uploaded_by: 'John Smith',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'DOC_003',
          asset_id: 'AST_002',
          asset_name: 'Office Chair Ergonomic',
          asset_tag: 'CHAIR-001',
          document_type: 'manual',
          title: 'User Manual - Ergonomic Chair',
          description: 'Assembly and maintenance instructions for the ergonomic chair',
          file_name: 'manual_chair_001.pdf',
          file_size: 892345,
          file_type: 'pdf',
          upload_date: '2023-02-20',
          expiry_date: null,
          uploaded_by: 'Sarah Johnson',
          created_at: '2023-02-20T10:00:00Z',
          updated_at: '2023-02-20T10:00:00Z'
        },
        {
          _id: 'DOC_004',
          asset_id: 'AST_003',
          asset_name: 'Desktop Computer',
          asset_tag: 'DESKTOP-001',
          document_type: 'maintenance',
          title: 'Service Report - Hardware Upgrade',
          description: 'Detailed service report for RAM and SSD upgrade',
          file_name: 'service_desktop_001.pdf',
          file_size: 123456,
          file_type: 'pdf',
          upload_date: '2024-05-03',
          expiry_date: null,
          uploaded_by: 'Mike Wilson',
          created_at: '2024-05-03T15:30:00Z',
          updated_at: '2024-05-03T15:30:00Z'
        },
        {
          _id: 'DOC_005',
          asset_id: 'AST_004',
          asset_name: 'Conference Table',
          asset_tag: 'TABLE-001',
          document_type: 'specification',
          title: 'Technical Specifications - Conference Table',
          description: 'Complete technical specifications and dimensions',
          file_name: 'specs_table_001.pdf',
          file_size: 567890,
          file_type: 'pdf',
          upload_date: '2022-05-15',
          expiry_date: null,
          uploaded_by: 'John Smith',
          created_at: '2022-05-15T10:00:00Z',
          updated_at: '2022-05-15T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 11000, // Real-time refresh every 11 seconds
      onSuccess: (data) => {
        console.log('Asset documents data refreshed:', data);
      }
    }
  );

  // Mock assets data
  const { data: assetsData } = useQuery(
    'documentsAssets',
    () => {
      return [
        { _id: 'AST_001', asset_name: 'Laptop Pro 15"', asset_tag: 'LAPTOP-001' },
        { _id: 'AST_002', asset_name: 'Office Chair Ergonomic', asset_tag: 'CHAIR-001' },
        { _id: 'AST_003', asset_name: 'Desktop Computer', asset_tag: 'DESKTOP-001' },
        { _id: 'AST_004', asset_name: 'Conference Table', asset_tag: 'TABLE-001' }
      ];
    }
  );

  // Mutation for uploading document
  const uploadDocumentMutation = useMutation(
    async (documentData) => {
      const documents = documentsData || [];
      const newDocument = {
        ...documentData,
        _id: `DOC_${Date.now()}`,
        file_size: selectedFile?.size || 0,
        file_type: selectedFile?.type?.split('/')[1] || 'unknown',
        upload_date: new Date().toISOString().split('T')[0],
        uploaded_by: 'Current User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedDocuments = [...documents, newDocument];
      localStorage.setItem('assetDocuments', JSON.stringify(updatedDocuments));
      queryClient.setQueryData('assetDocuments', updatedDocuments);
      return updatedDocuments;
    },
    {
      onSuccess: () => {
        toast.success('Document uploaded successfully');
        setShowUploadModal(false);
        resetUploadForm();
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
      const updatedDocuments = documents.filter(doc => doc._id !== documentId);
      localStorage.setItem('assetDocuments', JSON.stringify(updatedDocuments));
      queryClient.setQueryData('assetDocuments', updatedDocuments);
      return updatedDocuments;
    },
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete document');
      }
    }
  );

  const documents = documentsData || [];
  const assets = assetsData || [];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesAsset = filterAsset === 'all' || doc.asset_id === filterAsset;
    
    return matchesSearch && matchesType && matchesAsset;
  });

  const resetUploadForm = () => {
    setSelectedAsset(null);
    setDocumentType('');
    setDocumentTitle('');
    setDocumentDescription('');
    setSelectedFile(null);
  };

  const openDetailsModal = (document) => {
    setSelectedDocument(document);
    setShowDetailsModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!documentTitle) {
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = () => {
    if (!selectedAsset || !documentType || !documentTitle || !selectedFile) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    const documentData = {
      asset_id: selectedAsset._id,
      asset_name: selectedAsset.asset_name,
      asset_tag: selectedAsset.asset_tag,
      document_type: documentType,
      title: documentTitle,
      description: documentDescription,
      file_name: selectedFile.name
    };

    uploadDocumentMutation.mutate(documentData);
  };

  const handleDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleDownload = (document) => {
    // Simulate document download
    const link = document.createElement('a');
    link.href = '#';
    link.download = document.file_name;
    link.click();
    toast.success(`Downloading ${document.file_name}`);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Documents data refreshed');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 text-blue-800';
      case 'warranty':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'specification':
        return 'bg-gray-100 text-gray-800';
      case 'insurance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate statistics
  const totalDocuments = documents.length;
  const totalFileSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
  const expiringSoon = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    const expiryDate = new Date(doc.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const expiredDocuments = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    return new Date(doc.expiry_date) < new Date();
  }).length;

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Asset Documents</h1>
            <p className="page-subtitle">Upload invoices, warranty, manuals and attach files to assets</p>
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
              onClick={() => {
                resetUploadForm();
                setShowUploadModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              <span>Upload Document</span>
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
              <p className="text-sm font-medium text-gray-600">Total Storage</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalFileSize)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <PaperClipIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{expiringSoon}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{expiredDocuments}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <XMarkIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
              <option value="warranty">Warranty</option>
              <option value="manual">Manual</option>
              <option value="maintenance">Maintenance</option>
              <option value="specification">Specification</option>
              <option value="insurance">Insurance</option>
            </select>
            
            <select
              className="input"
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
            >
              <option value="all">All Assets</option>
              {assets.map(asset => (
                <option key={asset._id} value={asset._id}>
                  {asset.asset_name}
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
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getFileIcon(doc.file_type)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.file_name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.asset_name}</div>
                      <div className="text-xs text-gray-500">Tag: {doc.asset_tag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.document_type)}`}>
                        {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.upload_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doc.expiry_date || '-'}
                      </div>
                      {doc.expiry_date && (
                        <div className={`text-xs ${
                          new Date(doc.expiry_date) < new Date() ? 'text-red-600' :
                          new Date(doc.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {new Date(doc.expiry_date) < new Date() ? 'Expired' :
                           new Date(doc.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' :
                           'Valid'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.uploaded_by}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(doc)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-green-600 hover:text-green-900"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
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
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset *</label>
                <select
                  className="input"
                  value={selectedAsset?._id || ''}
                  onChange={(e) => setSelectedAsset(assets.find(a => a._id === e.target.value))}
                  required
                >
                  <option value="">Select an asset</option>
                  {assets.map(asset => (
                    <option key={asset._id} value={asset._id}>
                      {asset.asset_name} ({asset.asset_tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                <select
                  className="input"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="invoice">Invoice</option>
                  <option value="warranty">Warranty</option>
                  <option value="manual">Manual</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="specification">Specification</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  className="input"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Document title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Document description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                  type="file"
                  className="input"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  required
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="btn btn-primary"
                disabled={uploadDocumentMutation.isLoading}
              >
                Upload Document
              </button>
            </div>
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
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Title</p>
                <p className="text-sm text-gray-900">{selectedDocument.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Asset</p>
                <p className="text-sm text-gray-900">{selectedDocument.asset_name}</p>
                <p className="text-xs text-gray-500">Tag: {selectedDocument.asset_tag}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedDocument.document_type)}`}>
                  {selectedDocument.document_type.charAt(0).toUpperCase() + selectedDocument.document_type.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">File</p>
                <p className="text-sm text-gray-900">{selectedDocument.file_name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedDocument.file_size)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upload Date</p>
                  <p className="text-sm text-gray-900">{selectedDocument.upload_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                  <p className="text-sm text-gray-900">{selectedDocument.expiry_date || 'No expiry'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Uploaded By</p>
                <p className="text-sm text-gray-900">{selectedDocument.uploaded_by}</p>
              </div>

              {selectedDocument.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-sm text-gray-900">{selectedDocument.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(selectedDocument.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Updated</p>
                  <p className="text-sm text-gray-900">{new Date(selectedDocument.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleDownload(selectedDocument);
                }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetDocuments;
