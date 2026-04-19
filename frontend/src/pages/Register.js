import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Registration form submitted with:', formData);
    setLoading(true);

    try {
      const result = await register(formData);
      console.log('Registration result:', result);
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl font-bold text-primary-600">SI</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the Smart Inventory System
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="label">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="input rounded-md"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="label">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="input rounded-md"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input rounded-md"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input rounded-md"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength="6"
              className="input rounded-md"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="label">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                className="input rounded-md"
                placeholder="IT"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                className="input rounded-md"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register;
