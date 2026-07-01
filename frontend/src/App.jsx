import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Public pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import QuizListPage from './pages/student/QuizListPage';
import QuizAttemptPage from './pages/student/QuizAttemptPage';
import ResultPage from './pages/student/ResultPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import NotificationsPage from './pages/student/NotificationsPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminQuizListPage from './pages/admin/QuizListPage';
import CreateQuizPage from './pages/admin/CreateQuizPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function AppRoutes() {
  const { token } = useAuth();

  // Helper components for protected routes
  const PublicRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? <Navigate to="/dashboard" replace /> : children;
  };

  const AuthRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
  };

  const AdminRoute = ({ children }) => {
    const { token, user } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      {token && <Navbar />}
      <Routes>
        /* Public Routes */
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        /* Student Protected Routes */
        <Route path="/dashboard" element={<AuthRoute><StudentDashboard /></AuthRoute>} />
        <Route path="/quizzes" element={<AuthRoute><QuizListPage /></AuthRoute>} />
        <Route path="/quizzes/:id" element={<AuthRoute><QuizAttemptPage /></AuthRoute>} />
        <Route path="/results/:attemptId" element={<AuthRoute><ResultPage /></AuthRoute>} />
        <Route path="/leaderboard" element={<AuthRoute><LeaderboardPage /></AuthRoute>} />
        <Route path="/notifications" element={<AuthRoute><NotificationsPage /></AuthRoute>} />

        /* Admin Protected Routes */
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/quizzes" element={<AdminRoute><AdminQuizListPage /></AdminRoute>} />
        <Route path="/admin/quizzes/new" element={<AdminRoute><CreateQuizPage /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><CategoryManagementPage /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />

        /* Redirect root to login */
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;