import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById } from '../../services/quizApi';

const DIFFICULTY_STYLES = {
    EASY:   'bg-green-100 text-green-700 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HARD:   'bg-red-100 text-red-700 border-red-200',
};

// Rules reflect the actual QuizAttemptPage behaviour:
// all questions shown at once, no timer enforced, submit once.
const RULES = [
    'All questions are displayed on a single page — scroll to review them before submitting.',
    'Select one answer per question. You can change your selection at any time before submitting.',
    'Click Submit Quiz only when you are ready — answers cannot be changed after submission.',
    'Your score and results are shown immediately after submission.',
    'Each question carries equal marks toward your final percentage.',
];

const StatCard = ({ label, value, sub }) => (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">
            {value}
            {sub && <span className="text-base font-normal text-gray-500 ml-1">{sub}</span>}
        </p>
    </div>
);

const QuizDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getQuizById(id);
                if (isMounted) setQuiz(data);
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Unable to load quiz details. Please try again.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Loading quiz details...
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

    if (!quiz) return null;

    // Resolve question count — QuizResponse exposes totalQuestions directly;
    // fall back to questions array length if the field is absent.
    const questionCount = quiz.totalQuestions ?? quiz.questions?.length ?? null;
    const difficultyStyle = quiz.difficulty
        ? (DIFFICULTY_STYLES[quiz.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200')
        : null;

    // ── Page ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8">

            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            {/* Title + difficulty */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-start gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 leading-tight">{quiz.title}</h1>
                    {difficultyStyle && (
                        <span className={`mt-0.5 shrink-0 text-sm font-semibold px-3 py-0.5 rounded-full border ${difficultyStyle}`}>
              {quiz.difficulty}
            </span>
                    )}
                </div>
                {quiz.description && (
                    <p className="text-gray-500 leading-relaxed">{quiz.description}</p>
                )}
            </div>

            {/* Stats grid — only render a card when the field is present */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {questionCount != null && (
                    <StatCard label="Questions" value={questionCount} />
                )}
                {quiz.durationMinutes != null && (
                    <StatCard label="Duration" value={quiz.durationMinutes} sub="min" />
                )}
                {quiz.categoryName && (
                    <StatCard label="Category" value={quiz.categoryName} />
                )}
            </div>

            {/* Rules */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 space-y-3">
                <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                    Before You Begin
                </h2>
                <ul className="space-y-2.5">
                    {RULES.map((rule, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-200 text-blue-800
                               flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
                            {rule}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
                <button
                    onClick={() => navigate(`/quizzes/${id}`)}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg
                     hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Start Quiz
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-white text-gray-600 font-medium rounded-lg
                     border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>

        </div>
    );
};

export default QuizDetailsPage;