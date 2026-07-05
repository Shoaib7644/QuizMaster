import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STUDENT_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Quizzes', to: '/quizzes' },
  { label: 'Categories', to: '/categories' },
  { label: 'History', to: '/history' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Notifications', to: '/notifications' },
];

const ADMIN_LINKS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Quizzes', to: '/admin/quizzes' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Analytics', to: '/admin/analytics' },
];

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;
  const homeTo = isAdmin ? '/admin' : '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to;

  return (
      <nav className={isAdmin ? 'bg-gray-900 p-4' : 'bg-gray-800 p-4'}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to={homeTo} className="text-white text-xl font-bold shrink-0">
              QuizMaster{isAdmin && <span className="text-yellow-400 text-sm ml-2">Admin</span>}
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {links.map(({ label, to }) => (
                  <Link
                      key={to}
                      to={to}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          isActive(to)
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                  >
                    {label}
                  </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.firstName && (
                <span className="hidden sm:block text-gray-400 text-sm">Hi, {user.firstName}</span>
            )}
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;