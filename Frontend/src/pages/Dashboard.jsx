import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: '📋',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Amount',
      value: `₹${stats?.total_amount?.toLocaleString() || 0}`,
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: 'Successful Transactions',
      value: stats?.successful_transactions || 0,
      icon: '✅',
      color: 'bg-emerald-500',
    },
    {
      title: 'Failed Transactions',
      value: stats?.failed_transactions || 0,
      icon: '❌',
      color: 'bg-red-500',
    },
    {
      title: 'Pending Transactions',
      value: stats?.pending_transactions || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Transactions',
      value: stats?.total_transactions || 0,
      icon: '💳',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your payment transactions and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/transactions"
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            <span className="text-2xl mr-3">💳</span>
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                View All Transactions
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Browse and filter transaction history
              </p>
            </div>
          </a>
          
          <a
            href="/school-transactions"
            className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            <span className="text-2xl mr-3">🏫</span>
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                School Transactions
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                View transactions by school
              </p>
            </div>
          </a>
          
          <a
            href="/status-check"
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
          >
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <h3 className="font-medium text-purple-900 dark:text-purple-100">
                Check Transaction Status
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Look up specific transaction status
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
