import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  XMarkIcon,
  UserGroupIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const AssetLocations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationType, setLocationType] = useState('office');
  const [locationCapacity, setLocationCapacity] = useState('');

  const queryClient = useQueryClient();

  // Real-time asset locations data
  const { data: locationsData, isLoading, refetch } = useQuery(
    'assetLocations',
    () => {
      const storedLocations = localStorage.getItem('assetLocations');
      if (storedLocations) {
        return JSON.parse(storedLocations);
      }
      
      return [
        {
          _id: 'LOC_001',
          name: 'Main Office',
          description: 'Primary office location for administrative staff',
          address: '123 Business Ave, Suite 100, City, State 12345',
          type: 'office',
          capacity: 50,
          asset_count: 45,
          manager: 'John Smith',
          phone: '+1-555-0101',
          email: 'mainoffice@company.com',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'LOC_002',
          name: 'IT Department',
          description: 'Technology and server room for IT infrastructure',
          address: '123 Business Ave, Suite 200, City, State 12345',
          type: 'office',
          capacity: 15,
          asset_count: 28,
          manager: 'Sarah Johnson',
          phone: '+1-555-0102',
          email: 'itdept@company.com',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'LOC_003',
          name: 'Main Warehouse',
          description: 'Primary storage facility for inventory and equipment',
          address: '456 Storage Rd, City, State 12345',
          type: 'warehouse',
          capacity: 200,
          asset_count: 67,
          manager: 'Mike Wilson',
          phone: '+1-555-0103',
          email: 'warehouse@company.com',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'LOC_004',
          name: 'Branch Office - North',
          description: 'Northern branch office for regional operations',
          address: '789 North St, City, State 12345',
          type: 'office',
          capacity: 25,
          asset_count: 18,
          manager: 'Emily Davis',
          phone: '+1-555-0104',
          email: 'north@company.com',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        },
        {
          _id: 'LOC_005',
          name: 'Storage Room',
          description: 'Secondary storage for unused equipment',
          address: '123 Business Ave, Room 105, City, State 12345',
          type: 'storage',
          capacity: 30,
          asset_count: 12,
          manager: 'John Smith',
          phone: '+1-555-0101',
          email: 'mainoffice@company.com',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2023-01-15T10:00:00Z'
        }
      ];
    },
    {
      refetchInterval: 12000, // Real-time refresh every 12 seconds
      onSuccess: (data) => {
        console.log('Asset locations data refreshed:', data);
      }
    }
  );

  // Mutation for adding new location
  const addLocationMutation = useMutation(
    async (newLocation) => {
      const locations = locationsData || [];
      const locationWithId = {
        ...newLocation,
        _id: `LOC_${Date.now()}`,
        asset_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedLocations = [...locations, locationWithId];
      localStorage.setItem('assetLocations', JSON.stringify(updatedLocations));
      queryClient.setQueryData('assetLocations', updatedLocations);
      return updatedLocations;
    },
    {
      onSuccess: () => {
        toast.success('Location added successfully');
        setShowFormModal(false);
        setEditingLocation(null);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to add location');
      }
    }
  );

  // Mutation for updating location
  const updateLocationMutation = useMutation(
    async (updatedLocation) => {
      const locations = locationsData || [];
      const updatedLocations = locations.map(location => 
        location._id === updatedLocation._id ? { ...updatedLocation, updated_at: new Date().toISOString() } : location
      );
      localStorage.setItem('assetLocations', JSON.stringify(updatedLocations));
      queryClient.setQueryData('assetLocations', updatedLocations);
      return updatedLocations;
    },
    {
      onSuccess: () => {
        toast.success('Location updated successfully');
        setShowFormModal(false);
        setEditingLocation(null);
        resetForm();
        refetch();
      },
      onError: () => {
        toast.error('Failed to update location');
      }
    }
  );

  // Mutation for deleting location
  const deleteLocationMutation = useMutation(
    async (locationId) => {
      const locations = locationsData || [];
      const updatedLocations = locations.filter(location => location._id !== locationId);
      localStorage.setItem('assetLocations', JSON.stringify(updatedLocations));
      queryClient.setQueryData('assetLocations', updatedLocations);
      return updatedLocations;
    },
    {
      onSuccess: () => {
        toast.success('Location deleted successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete location');
      }
    }
  );

  const locations = locationsData || [];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setLocationName('');
    setLocationDescription('');
    setLocationAddress('');
    setLocationType('office');
    setLocationCapacity('');
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLocationDescription(location.description);
    setLocationAddress(location.address);
    setLocationType(location.type);
    setLocationCapacity(location.capacity);
    setShowFormModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const locationData = {
      name: locationName,
      description: locationDescription,
      address: locationAddress,
      type: locationType,
      capacity: parseInt(locationCapacity) || 0
    };

    if (editingLocation) {
      updateLocationMutation.mutate({ ...editingLocation, ...locationData });
    } else {
      addLocationMutation.mutate(locationData);
    }
  };

  const handleDelete = (locationId) => {
    const location = locations.find(l => l._id === locationId);
    if (location && location.asset_count > 0) {
      toast.error(`Cannot delete location "${location.name}" as it contains ${location.asset_count} assets`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteLocationMutation.mutate(locationId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Locations data refreshed');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'office':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'warehouse':
        return <CubeIcon className="h-5 w-5" />;
      case 'storage':
        return <MapPinIcon className="h-5 w-5" />;
      default:
        return <MapPinIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'office':
        return 'bg-blue-100 text-blue-800';
      case 'warehouse':
        return 'bg-green-100 text-green-800';
      case 'storage':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="page-title">Asset Locations</h1>
            <p className="page-subtitle">Assign locations and track where assets are stored</p>
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
                resetForm();
                setEditingLocation(null);
                setShowFormModal(true);
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Locations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredLocations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No locations found</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
            <motion.div
              key={location._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(location.type)}`}>
                    {getTypeIcon(location.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-500">{location.asset_count} assets</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(location)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete"
                    disabled={location.asset_count > 0}
                  >
                    <TrashIcon className={`h-4 w-4 ${location.asset_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{location.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {location.address}
                </div>
                
                {location.manager && (
                  <div className="flex items-center text-gray-500">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Manager: {location.manager}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-gray-500">
                  <span>Type: {location.type.charAt(0).toUpperCase() + location.type.slice(1)}</span>
                  <span>Capacity: {location.capacity}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                <span>Created: {new Date(location.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(location.updated_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add/Edit Location Modal */}
      {showFormModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFormModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="input"
                    placeholder="e.g., Main Office, Warehouse"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    className="input"
                    rows="3"
                    placeholder="Describe this location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="input"
                    placeholder="Full address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="storage">Storage</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={locationCapacity}
                    onChange={(e) => setLocationCapacity(e.target.value)}
                    className="input"
                    placeholder="Maximum number of assets"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addLocationMutation.isLoading || updateLocationMutation.isLoading}
                >
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetLocations;
