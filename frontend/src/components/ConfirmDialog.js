import React from 'react';
import {
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  type = 'delete',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className={`flex items-center gap-3 px-6 py-4 ${
          type === 'delete' ? 'bg-red-600' : 'bg-yellow-600'
        } text-white rounded-t-lg`}>
          {type === 'delete' ? (
            <TrashIcon className="h-5 w-5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5" />
          )}
          <h3 className="text-lg font-semibold">
            {title || 'Confirm Action'}
          </h3>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Alert Message */}
            <div className={`p-4 rounded-lg ${
              type === 'delete' 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              <p className="text-sm">
                {message || `Are you sure you want to delete this ${type}?`}
              </p>
            </div>
            
            {/* Item Details */}
            {itemName && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Item to be {type === 'delete' ? 'deleted' : 'actioned'}:
                </p>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {itemName}
                  </p>
                </div>
              </div>
            )}
            
            {/* Warning Text */}
            <p className="text-sm text-gray-600">
              {type === 'delete' 
                ? 'This action cannot be undone. All associated data will be permanently removed.'
                : 'This action will modify the current state.'
              }
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
              type === 'delete' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {type === 'delete' ? (
                  <TrashIcon className="h-4 w-4" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4" />
                )}
                {type === 'delete' ? 'Delete' : 'Confirm'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
