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

const PublicRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AuthRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Student Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthRoute isAuthenticated={isAuthenticated}>
              <StudentDashboard />
            </AuthRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <AuthRoute isAuthenticated={isAuthenticated}>
              <QuizListPage />
            </AuthRoute>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <AuthRoute isAuthenticated={isAuthenticated}>
              <QuizAttemptPage />
            </AuthRoute>
          }
        />
        <Route
          path="/results/:attemptId"
          element={
            <AuthRoute isAuthenticated={isAuthenticated}>
              <ResultPage />
            </AuthRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <AuthRoute isAuthenticated={isAuthenticated}>
              <LeaderboardPage />
            </AuthRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <AuthRoute isAuthenticated={isAuthenticated}>
              <NotificationsPage />
            </AuthRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} user={user}>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} user={user}>
              <AdminQuizListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/new"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} user={user}>
              <CreateQuizPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} user={user}>
              <CategoryManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute isAuthenticated={isAuthenticated} user={user}>
              <AnalyticsPage />
            </AdminRoute>
          }
        />

        {/* Redirect unmatched routes to login */}
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