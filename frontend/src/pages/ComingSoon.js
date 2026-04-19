import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

const ComingSoon = ({ title }) => {
  const location = useLocation();
  const pageTitle = title || location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8 p-6 bg-primary-100 rounded-full"
      >
        <RocketLaunchIcon className="h-16 w-16 text-primary-600" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-extrabold text-gray-900 mb-4"
      >
        {pageTitle} Coming Soon!
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-gray-600 max-w-md"
      >
        We are working hard to bring you the best experience for {pageTitle}. This feature will be available in the next update.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10"
      >
        <div className="inline-flex rounded-md shadow">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
