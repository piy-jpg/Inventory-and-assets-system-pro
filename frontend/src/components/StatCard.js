import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon 
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, color = 'blue', trend = 'stable', href }) => {
  const colorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-500',
  };

  const trendIcons = {
    up: <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />,
    down: <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />,
    stable: <MinusIcon className="h-4 w-4 text-gray-400" />,
  };

  const Content = () => (
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
        <div className={`${colorClasses[color]} text-white p-2 rounded-md`}>
          {icon}
        </div>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            <div className="ml-2 flex items-center">
              {trendIcons[trend]}
            </div>
          </dd>
        </dl>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`stat-card ${href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      {href ? (
        <Link to={href}>
          <Content />
        </Link>
      ) : (
        <Content />
      )}
    </motion.div>
  );
};

export default StatCard;
