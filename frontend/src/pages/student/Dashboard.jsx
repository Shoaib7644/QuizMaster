import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes } from '../../services/quizApi';
import { getStudentDashboard } from '../../services/dashboardApi';
import DashboardCard from './DashboardCard';
import QuickActionCard from './QuickActionCard';
import RecentAttemptTable from './RecentAttemptTable';

const DIFFICULTY_STYLES = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD: 'bg-red-100 text-red-700',
};

const RECOMMENDED_COUNT = 3;

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes]               = useState([]);
    const [stats, setStats]                   = useState(null);
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const [quizData, dashboardData] = await Promise.all([
                    getQuizzes(),
                    getStudentDashboard(),
                ]);

                if (!isMounted) return;

                setQuizzes(Array.isArray(quizData) ? quizData : []);
                setStats(dashboardData.stats);
                setRecentAttempts(dashboardData.recentAttempts ?? []);
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Unable to load dashboard data. Please try again.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadDashboardData();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * "Recommended" = published quizzes not present in recentAttempts.
     *
     * KNOWN LIMITATION: recentAttempts is a short recent-activity slice
     * (5 items per the current dashboardApi payload), not the student's
     * full attempt history. A quiz attempted 20 attempts ago — outside
     * that recent window — will still show up here as "recommended"
     * even though it isn't truly unattempted. Closing this properly
     * requires the dashboard endpoint to return the full set of
     * attempted quiz IDs (or a dedicated /api/recommendations once
     * FR-11 is built in Sprint 2). Flagging this rather than silently
     * shipping a claim ("unattempted") the data can't fully back up.
     */
    const recommendedQuizzes = useMemo(() => {
        const attemptedQuizIds = new Set(
            recentAttempts
                .map((a) => a.quizId ?? a.quiz?.id)
                .filter((id) => id !== undefined && id !== null)
        );
        const unattempted = quizzes.filter((q) => !attemptedQuizIds.has(q.id));
        const pool = unattempted.length > 0 ? unattempted : quizzes;
        return pool.slice(0, RECOMMENDED_COUNT);
    }, [quizzes, recentAttempts]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Loading dashboard...
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="p-6">
                <p role="alert" className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    // ── Page ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* Welcome Banner */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                </h1>
                <p className="text-gray-500 mt-1">Here's a snapshot of your quiz activity.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DashboardCard
                    title="Completed Quizzes"
                    value={stats?.completedQuizCount ?? 0}
                    colorClass="text-blue-600"
                />
                <DashboardCard
                    title="Average Score"
                    value={`${(stats?.averageScore ?? 0).toFixed(1)}%`}
                    colorClass="text-green-600"
                />
                <DashboardCard
                    title="Best Score"
                    value={`${(stats?.bestScore ?? 0).toFixed(1)}%`}
                    colorClass="text-purple-600"
                />
            </div>

            {/* Recommended Quizzes — a curated slice, not the full catalog.
          Full browsing (search/filter by category & difficulty) lives on
          /quizzes; this section's job is "what should I do next," not
          "show me everything." */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Recommended for You</h2>
                    <Link
                        to="/quizzes"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        Browse all quizzes →
                    </Link>
                </div>
                {recommendedQuizzes.length === 0 ? (
                    <p className="text-gray-500 text-center">No quizzes available yet.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {recommendedQuizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition
                           cursor-pointer border border-gray-100 group"
                                onClick={() => navigate(`/quizzes/${quiz.id}/details`)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <span
                                        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${DIFFICULTY_STYLES[quiz.difficulty] || 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {quiz.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2 text-sm">{quiz.description}</p>
                                <div className="flex justify-between mt-5 items-center">
                                    <span className="text-sm text-gray-500">
                                        {quiz.totalQuestions} Questions · {quiz.durationMinutes} min
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium
                                   group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        View Details
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Attempts */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Attempts</h2>
                <RecentAttemptTable attempts={recentAttempts} />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionCard
                        title="Browse Quizzes"
                        description="Find a quiz to attempt"
                        to="/quizzes"
                        colorClass="bg-blue-600 hover:bg-blue-700"
                    />
                    <QuickActionCard
                        title="Browse Categories"
                        description="Explore quizzes by topic"
                        to="/categories"
                        colorClass="bg-indigo-600 hover:bg-indigo-700"
                    />
                    <QuickActionCard
                        title="Leaderboard"
                        description="See how you rank"
                        to="/leaderboard"
                        colorClass="bg-purple-600 hover:bg-purple-700"
                    />
                    <QuickActionCard
                        title="Notifications"
                        description="Check your updates"
                        to="/notifications"
                        colorClass="bg-green-600 hover:bg-green-700"
                    />
                </div>
            </div>

        </div>
    );
};

export default StudentDashboard;