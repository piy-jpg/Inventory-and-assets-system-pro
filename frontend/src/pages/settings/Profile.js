import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    address: '',
    language: 'en',
    timezone: 'UTC',
    bio: '',
    avatar: ''
  });

  const queryClient = useQueryClient();

  // Mock profile data
  const { data: profileData, isLoading, refetch } = useQuery(
    'userProfile',
    () => {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
      
      return {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Administrator',
        department: 'IT Department',
        phone: '+1 (555) 123-4567',
        address: '123 Business Ave, Suite 100, New York, NY 10001',
        language: 'en',
        timezone: 'America/New_York',
        bio: 'Experienced administrator with expertise in inventory management and system optimization.',
        avatar: 'https://picsum.photos/seed/user-avatar/200/200.jpg',
        createdAt: '2024-01-15T00:00:00Z',
        lastLogin: '2024-04-23T10:30:00Z',
        loginCount: 342,
        accountStatus: 'active',
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          role: data.role || '',
          department: data.department || '',
          phone: data.phone || '',
          address: data.address || '',
          language: data.language || 'en',
          timezone: data.timezone || 'UTC',
          bio: data.bio || '',
          avatar: data.avatar || ''
        });
      }
    }
  );

  // Profile update mutation
  const updateProfileMutation = useMutation(
    async (profileData) => {
      const updatedProfile = {
        ...profileData,
        updatedAt: new Date().toISOString(),
        updatedBy: 'user'
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      queryClient.setQueryData('userProfile', updatedProfile);
      return updatedProfile;
    },
    {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        refetch();
      },
      onError: () => {
        toast.error('Failed to update profile');
      }
    }
  );

  const profile = profileData || {};

  const calculateCompletion = () => {
    const fields = ['fullName', 'email', 'role', 'department', 'phone', 'address', 'bio'];
    const completedFields = fields.filter(field => formData[field] && formData[field].trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: profile.fullName || '',
      email: profile.email || '',
      role: profile.role || '',
      department: profile.department || '',
      phone: profile.phone || '',
      address: profile.address || '',
      language: profile.language || 'en',
      timezone: profile.timezone || 'UTC',
      bio: profile.bio || '',
      avatar: profile.avatar || ''
    });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const completionPercentage = calculateCompletion();
  const completionColor = completionPercentage >= 80 ? 'bg-green-500' : 
                           completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' }
  ];

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="page-subtitle">Manage your personal information and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} flex items-center space-x-2`}
            >
              {isEditing ? (
                <>
                  <XCircleIcon className="h-4 w-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="btn btn-primary flex items-center space-x-2"
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Profile Completion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
          <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${completionColor}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Complete your profile to get the most out of your account
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={formData.avatar || 'https://picsum.photos/seed/default-avatar/200/200.jpg'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto border-4 border-gray-200"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <CameraIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4">{formData.fullName || 'Your Name'}</h3>
              <p className="text-gray-600">{formData.role || 'Your Role'}</p>
              <p className="text-sm text-gray-500 mt-1">{formData.department || 'Your Department'}</p>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {profile.emailVerified ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {profile.phoneVerified ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.accountStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="text-gray-900">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login</span>
                    <span className="text-gray-900">
                      {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Logins</span>
                    <span className="text-gray-900">{profile.loginCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      disabled={!isEditing}
                      placeholder="Your role"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      disabled={!isEditing}
                      placeholder="Your department"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Tell us about yourself"
                />
              </div>

              {/* Preferences */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                        disabled={!isEditing}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                        disabled={!isEditing}
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Security Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Verification</p>
                        <p className="text-xs text-gray-500">
                          {profile.emailVerified ? 'Verified' : 'Not verified'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.emailVerified ? 'Verified' : 'Action Required'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone Verification</p>
                        <p className="text-xs text-gray-500">
                          {profile.phoneVerified ? 'Verified' : 'Not verified'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.phoneVerified ? 'Verified' : 'Action Required'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">
                          {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile.twoFactorEnabled ? 'Enabled' : 'Recommended'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="btn btn-primary flex items-center space-x-2"
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? (
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
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
