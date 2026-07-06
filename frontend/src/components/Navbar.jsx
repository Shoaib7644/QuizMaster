import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

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
      <nav className="sticky top-0 z-50 h-18 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <Link to={homeTo} className="text-lg font-semibold text-text-primary shrink-0">
            QuizMaster
            {isAdmin && (
                <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Admin
            </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ label, to }) => (
                <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(to)
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                    }`}
                >
                  {label}
                </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user?.firstName && (
                <span className="hidden sm:block text-sm text-text-secondary">
              Hi, {user.firstName}
            </span>
            )}
            <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-danger border border-border rounded-lg px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;