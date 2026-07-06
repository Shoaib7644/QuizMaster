import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, Award, PlayCircle, Grid, Trophy, Bell } from 'lucide-react'; // Added Grid, Trophy, Bell
import { useAuth } from '../../context/AuthContext';
import { getQuizzes } from '../../services/quizApi';
import { getStudentDashboard } from '../../services/dashboardApi';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import QuizCard from '../../components/quiz/QuizCard';

const RECOMMENDED_COUNT = 3;

// Helper component to fix the reference crash error
const QuickActionCard = ({ icon: Icon, title, description, to }) => {
    const navigate = useNavigate();
    return (
        <Card
            className="p-5 flex flex-col items-start space-y-3 cursor-pointer hover:border-primary/40 transition-all duration-200"
            onClick={() => navigate(to)}
        >
            <div className="p-2.5 bg-background text-primary rounded-lg">
                <Icon size={22} />
            </div>
            <div>
                <h4 className="font-semibold text-text-primary text-base">{title}</h4>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
            </div>
        </Card>
    );
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState(null);
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                setStats(dashboardData?.stats ?? null);
                setRecentAttempts(dashboardData?.recentAttempts ?? []);
            } catch (err) {
                if (isMounted) setError(err.message || 'Unable to load dashboard data. Please try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadDashboardData();
        return () => { isMounted = false; };
    }, []);

    const recommendedQuizzes = useMemo(() => {
        const attemptedQuizIds = new Set(
            recentAttempts.map((a) => a.quizId ?? a.quiz?.id).filter((id) => id != null)
        );
        const unattempted = quizzes.filter((q) => !attemptedQuizIds.has(q.id));
        const pool = unattempted.length > 0 ? unattempted : quizzes;
        return pool.slice(0, RECOMMENDED_COUNT);
    }, [quizzes, recentAttempts]);

    const featuredQuiz = recommendedQuizzes[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-text-secondary font-medium">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <p role="alert" className="text-danger text-center font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            <PageHeader
                title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}!`}
                subtitle="Here's a snapshot of your quiz activity."
            />

            {/* Continue Learning */}
            {featuredQuiz && (
                <Card className="bg-primary text-white border-none shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-white/80 font-medium">Continue Learning</p>
                            <h2 className="text-xl font-semibold mt-1">{featuredQuiz.title}</h2>
                            <p className="text-sm text-white/80 mt-1">
                                {featuredQuiz.totalQuestions} questions · {featuredQuiz.durationMinutes} min
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="!bg-white !text-primary border-none hover:!bg-slate-50 transition-colors shadow-sm"
                            onClick={() => navigate(`/quizzes/${featuredQuiz.id}/details`)}
                        >
                            <PlayCircle size={18} />
                            Resume Quiz
                        </Button>
                    </div>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={BookOpen}
                    label="Completed Quizzes"
                    value={stats?.completedQuizCount ?? 0}
                />
                <StatCard
                    icon={Target}
                    label="Average Score"
                    value={`${(stats?.averageScore ?? 0).toFixed(1)}%`}
                />
                <StatCard
                    icon={Award}
                    label="Best Score"
                    value={`${(stats?.bestScore ?? 0).toFixed(1)}%`}
                />
            </div>

            {/* Recommended Quizzes */}
            <div>
                <SectionHeader title="Recommended for You" actionLabel="Browse all quizzes" actionTo="/quizzes" />
                {recommendedQuizzes.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No quizzes available yet.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {recommendedQuizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Attempts */}
            <div>
                <SectionHeader title="Recent Attempts" actionLabel="View all" actionTo="/history" />
                {recentAttempts.length === 0 ? (
                    <Card>
                        <p className="text-text-secondary text-center py-4">
                            You haven't attempted any quizzes yet.
                        </p>
                    </Card>
                ) : (
                    <Card className="p-0 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-background text-text-secondary text-left">
                            <tr>
                                <th className="px-6 py-3 font-medium">Quiz</th>
                                <th className="px-6 py-3 font-medium">Score</th>
                                <th className="px-6 py-3 font-medium">Percentage</th>
                                <th className="px-6 py-3 font-medium">Submitted</th>
                                <th className="px-6 py-3 font-medium"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentAttempts.map((attempt) => (
                                <tr key={attempt.id} className="border-t border-border hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 text-text-primary font-medium">
                                        {attempt.quizTitle || `Quiz #${attempt.quizId}`}
                                    </td>
                                    <td className="px-6 py-3 text-text-secondary">
                                        {attempt.score} / {attempt.totalQuestions}
                                    </td>
                                    <td className="px-6 py-3 w-40">
                                        <ProgressBar percentage={attempt.percentage} showLabel />
                                    </td>
                                    <td className="px-6 py-3 text-text-secondary">
                                        {attempt.submittedAt
                                            ? new Date(attempt.submittedAt).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/results/${attempt.id}`)}
                                        >
                                            View Result
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <SectionHeader title="Quick Actions" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionCard
                        icon={BookOpen}
                        title="Browse Quizzes"
                        description="Find a quiz to attempt"
                        to="/quizzes"
                    />
                    <QuickActionCard
                        icon={Grid}
                        title="Browse Categories"
                        description="Explore quizzes by topic"
                        to="/categories"
                    />
                    <QuickActionCard
                        icon={Trophy}
                        title="Leaderboard"
                        description="See how you rank"
                        to="/leaderboard"
                    />
                    <QuickActionCard
                        icon={Bell}
                        title="Notifications"
                        description="Check your updates"
                        to="/notifications"
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;