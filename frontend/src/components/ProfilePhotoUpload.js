import React, { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from 'react-query';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate, userId }) => {
  const [previewUrl, setPreviewUrl] = useState(currentPhoto || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadMutation = useMutation(
    (formData) => usersAPI.uploadProfilePhoto(userId, formData),
    {
      onSuccess: (data) => {
        toast.success('Profile photo updated successfully');
        setPreviewUrl(data.data.profilePhoto);
        onPhotoUpdate(data.data.profilePhoto);
        setIsUploading(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload photo');
        setIsUploading(false);
      },
    }
  );

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      uploadPhoto(file);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);
    uploadMutation.mutate(formData);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-6">
        <div className="relative">
          {/* Profile Photo */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                  <span className="text-white text-2xl font-bold">
                    {userId?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                 onClick={openFileDialog}>
              <CameraIcon className="h-8 w-8 text-white" />
            </div>

            {/* Loading Indicator */}
            {isUploading && (
              <div className="absolute inset-0 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Remove Photo Button */}
          {previewUrl && (
            <button
              onClick={removePhoto}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Upload Info */}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload a professional photo. Recommended size: 400x400px. Max file size: 5MB.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supported formats: JPEG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload
            </span>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ProfilePhotoUpload;
