import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizzesByCategory } from '../../services/categoryApi';

// Tailwind classes per difficulty value returned by the backend enum
const DIFFICULTY_STYLES = {
    EASY:   { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-400' },
    MEDIUM: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
    HARD:   { badge: 'bg-red-100 text-red-700',       dot: 'bg-red-400'   },
};

const QuizCard = ({ quiz, onStart }) => {
    const style = DIFFICULTY_STYLES[quiz.difficulty] ?? { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

    return (
        <div
            onClick={onStart}
            className="bg-white rounded-lg shadow-md border border-gray-100 p-6
                 hover:shadow-lg hover:border-blue-200 transition cursor-pointer group"
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600
                       transition-colors leading-snug">
                    {quiz.title}
                </h3>
                {quiz.difficulty && (
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${style.badge}`}>
            {quiz.difficulty}
          </span>
                )}
            </div>

            {/* Description */}
            {quiz.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{quiz.description}</p>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-3 mt-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
            {quiz.totalQuestions} Questions
        </span>

                {quiz.durationMinutes != null && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
                        {quiz.durationMinutes} min
          </span>
                )}
            </div>

            {/* CTA */}
            <div className="mt-5 flex justify-end">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium
                         group-hover:bg-blue-600 group-hover:text-white transition-colors">
          View Details →
        </span>
            </div>
        </div>
    );
};

const CategoryQuizListPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [quizzes, setQuizzes]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                // Single call: GET /categories/:id/quizzes returns CategorySummaryDto
                // { id, name, description, quizzes: QuizSummaryDto[] }
                // Category identity and quiz list arrive together — no second fetch needed.
                const data = await getQuizzesByCategory(id);
                if (isMounted) {
                    setCategory({ id: data.id, name: data.name, description: data.description });
                    setQuizzes(data.quizzes ?? []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Unable to load quizzes for this category. Please try again.');
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
                Loading quizzes...
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

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <button
                    onClick={() => navigate('/categories')}
                    className="hover:text-blue-600 transition-colors"
                >
                    Categories
                </button>
                <span>›</span>
                <span className="text-gray-800 font-medium">{category?.name ?? 'Category'}</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>
                {category?.description && (
                    <p className="text-gray-500 mt-1">{category.description}</p>
                )}
                {quizzes.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                        {quizzes.length} published {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </p>
                )}
            </div>

            {/* Empty state */}
            {quizzes.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-lg font-medium">
                        No quizzes available in this category yet.
                    </p>
                    <button
                        onClick={() => navigate('/categories')}
                        className="mt-3 text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Categories
                    </button>
                </div>
            ) : (
                // ── Quiz grid ────────────────────────────────────────────────────
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onStart={() => navigate(`/quizzes/${quiz.id}/details`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryQuizListPage;