import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AnalyticsPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Analytics functionality coming soon.</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
