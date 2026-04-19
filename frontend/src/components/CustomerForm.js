import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from 'react-query';
import { customersAPI } from '../services/api';
import toast from 'react-hot-toast';

const defaultState = {
  name: '',
  phone: '',
  email: '',
  company_name: '',
  gst_number: '',
  credit_limit: 0,
  outstanding_balance: 0,
  payment_status: 'paid',
  group: 'retail',
  status: 'active',
  notes: '',
  tags: ['retail'],
  follow_up_reminder: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
  },
};

const CustomerForm = ({ customer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(defaultState);
  const isEditing = Boolean(customer);

  useEffect(() => {
    if (customer) {
      setFormData({
        ...defaultState,
        ...customer,
        credit_limit: customer.credit_limit || 0,
        outstanding_balance: customer.outstanding_balance || 0,
        tags: customer.tags?.length ? customer.tags : [customer.group || 'retail'],
        follow_up_reminder: customer.follow_up_reminder ? customer.follow_up_reminder.split('T')[0] : '',
        address: {
          ...defaultState.address,
          ...(customer.address || {}),
        },
      });
    }
  }, [customer]);

  const createMutation = useMutation(customersAPI.create, {
    onSuccess: () => {
      toast.success('Customer added successfully');
      onSuccess();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add customer'),
  });

  const updateMutation = useMutation(
    (payload) => customersAPI.update(customer._id, payload),
    {
      onSuccess: () => {
        toast.success('Customer updated successfully');
        onSuccess();
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to update customer'),
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.replace('address.', '');
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (value) => {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      credit_limit: Number(formData.credit_limit || 0),
      outstanding_balance: Number(formData.outstanding_balance || 0),
      follow_up_reminder: formData.follow_up_reminder || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const loading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Customer' : 'Add Customer'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="text" name="phone" className="input" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Company Name</label>
              <input type="text" name="company_name" className="input" value={formData.company_name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">GST Number</label>
              <input type="text" name="gst_number" className="input" value={formData.gst_number} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Credit Limit</label>
              <input type="number" name="credit_limit" className="input" value={formData.credit_limit} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Outstanding Balance</label>
              <input type="number" name="outstanding_balance" className="input" value={formData.outstanding_balance} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Payment Status</label>
              <select name="payment_status" className="input" value={formData.payment_status} onChange={handleChange}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="label">Customer Type</label>
              <select name="group" className="input" value={formData.group} onChange={handleChange}>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="input" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="label">Follow-up Reminder</label>
              <input type="date" name="follow_up_reminder" className="input" value={formData.follow_up_reminder} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Tags / Segments</label>
              <input
                type="text"
                className="input"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="vip, wholesale, regular customer"
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="address.street" className="input" value={formData.address.street} onChange={handleChange} placeholder="Street" />
              <input type="text" name="address.city" className="input" value={formData.address.city} onChange={handleChange} placeholder="City" />
              <input type="text" name="address.state" className="input" value={formData.address.state} onChange={handleChange} placeholder="State" />
              <input type="text" name="address.zip" className="input" value={formData.address.zip} onChange={handleChange} placeholder="ZIP / PIN" />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              className="input min-h-[120px]"
              value={formData.notes}
              onChange={handleChange}
              placeholder="regular customer, VIP, prefers WhatsApp follow-up..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Saving...' : isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerForm;
