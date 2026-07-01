import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">
        Welcome, {user?.firstName}. You have access to the following admin functionalities:
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="font-semibold text-lg mb-2">Quiz Management</h2>
          <p className="text-gray-600 mb-4">
            Create, update, delete quizzes and manage questions.
          </p>
          <a
            href="/admin/quizzes"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Manage Quizzes
          </a>
        </div>
        <div
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="font-semibold text-lg mb-2">Category Management</h2>
          <p className="text-gray-600 mb-4">
            Create and manage categories for quizzes.
          </p>
          <a
            href="/admin/categories"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Manage Categories
          </a>
        </div>
        <div
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="font-semibold text-lg mb-2">Analytics</h2>
          <p className="text-gray-600 mb-4">
            View quiz attempts, scores, and other statistics.
          </p>
          <a
            href="/admin/analytics"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Analytics
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
