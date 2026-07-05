import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ManageQuestionsPage from './pages/admin/ManageQuestionsPage';

// Public pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditQuizPage from './pages/admin/EditQuizPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import QuizListPage from './pages/student/QuizListPage';
import QuizDetailsPage from './pages/student/QuizDetailPage';
import QuizAttemptPage from './pages/student/QuizAttemptPage';
import ResultPage from './pages/student/ResultPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import NotificationsPage from './pages/student/NotificationsPage';
import CategoryListPage from './pages/student/CategoryListPage';
import CategoryQuizListPage from './pages/student/CategoryQuizListPage';
import AttemptHistoryPage from './pages/student/AttemptHistoryPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminQuizListPage from './pages/admin/QuizListPage';
import CreateQuizPage from './pages/admin/CreateQuizPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

const homeRouteFor = (user) => (user?.role === 'ADMIN' ? '/admin' : '/dashboard');

const PublicRoute = ({ isAuthenticated, user, children }) => {
    return isAuthenticated ? <Navigate to={homeRouteFor(user)} replace /> : children;
};

// Any authenticated user, role-agnostic (kept for routes truly shared by both roles, if any emerge)
const AuthRoute = ({ isAuthenticated, children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Student-only routes: authenticated AND not ADMIN. Admin gets bounced to /admin.
const StudentRoute = ({ isAuthenticated, user, children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return children;
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
                        <PublicRoute isAuthenticated={isAuthenticated} user={user}>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute isAuthenticated={isAuthenticated} user={user}>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/admin/quizzes/:id/questions"
                    element={
                        <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                            <ManageQuestionsPage />
                        </AdminRoute>
                    }
                />
                {/* Root redirect based on role */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to={homeRouteFor(user)} replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Student Protected Routes */}
                <Route path="/dashboard" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><StudentDashboard /></StudentRoute>} />
                <Route path="/quizzes" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><QuizListPage /></StudentRoute>} />
                <Route path="/quizzes/:id/details" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><QuizDetailsPage /></StudentRoute>} />
                <Route path="/quizzes/:id" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><QuizAttemptPage /></StudentRoute>} />
                <Route path="/results/:attemptId" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><ResultPage /></StudentRoute>} />
                <Route path="/leaderboard" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><LeaderboardPage /></StudentRoute>} />
                <Route path="/notifications" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><NotificationsPage /></StudentRoute>} />
                <Route path="/categories" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><CategoryListPage /></StudentRoute>} />
                <Route path="/categories/:id" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><CategoryQuizListPage /></StudentRoute>} />
                <Route path="/history" element={<StudentRoute isAuthenticated={isAuthenticated} user={user}><AttemptHistoryPage /></StudentRoute>} />

                {/* Admin Protected Routes */}
                <Route path="/admin" element={<AdminRoute isAuthenticated={isAuthenticated} user={user}><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/quizzes" element={<AdminRoute isAuthenticated={isAuthenticated} user={user}><AdminQuizListPage /></AdminRoute>} />
                <Route path="/admin/quizzes/new" element={<AdminRoute isAuthenticated={isAuthenticated} user={user}><CreateQuizPage /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute isAuthenticated={isAuthenticated} user={user}><CategoryManagementPage /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute isAuthenticated={isAuthenticated} user={user}><AnalyticsPage /></AdminRoute>} />
                <Route
                    path="/admin/quizzes/:id/edit"
                    element={
                        <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                            <EditQuizPage />
                        </AdminRoute>
                    }
                />

                {/* Redirect unmatched routes */}
                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated ? homeRouteFor(user) : '/login'} replace />}
                />
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