import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryApi';
import { getQuizzes } from '../../services/quizApi';

const CategoryListPage = () => {
    const navigate = useNavigate();

    const [categories, setCategories]   = useState([]);
    const [quizCountMap, setQuizCountMap] = useState({});
    const [search, setSearch]           = useState('');
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch categories and all quizzes concurrently.
                // getQuizzes() is used purely to build a per-category quiz count;
                // if QuizResponse does not include categoryId the count map stays
                // empty and count badges simply won't render — no broken state.
                const [categoryData, quizData] = await Promise.all([
                    getAllCategories(),
                    getQuizzes(),
                ]);

                if (!isMounted) return;

                setCategories((categoryData ?? []).filter((c) => c.isActive));

                const countMap = (quizData ?? []).reduce((acc, quiz) => {
                    if (quiz.categoryId != null) {
                        acc[quiz.categoryId] = (acc[quiz.categoryId] ?? 0) + 1;
                    }
                    return acc;
                }, {});
                setQuizCountMap(countMap);
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Unable to load categories. Please try again.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    // Client-side filtering — matches on name and description
    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return categories;
        return categories.filter(
            (c) =>
                c.name.toLowerCase().includes(term) ||
                (c.description ?? '').toLowerCase().includes(term)
        );
    }, [categories, search]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Loading categories...
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
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                <p className="text-gray-500 mt-1">Browse quizzes by topic.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Result count hint */}
            {search && (
                <p className="text-sm text-gray-500">
                    {filtered.length} {filtered.length === 1 ? 'category' : 'categories'} found
                </p>
            )}

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-lg font-medium">
                        {search ? 'No categories match your search.' : 'No categories available yet.'}
                    </p>
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="mt-3 text-sm text-blue-600 hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                // ── Category grid ────────────────────────────────────────────────
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((category) => {
                        const count = quizCountMap[category.id];
                        return (
                            <div
                                key={category.id}
                                onClick={() => navigate(`/categories/${category.id}`)}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-100
                           hover:shadow-lg hover:border-blue-200 transition cursor-pointer group"
                            >
                                {/* Name + quiz count badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600
                                 transition-colors leading-tight">
                                        {category.name}
                                    </h3>
                                    {count != null && (
                                        <span className="shrink-0 bg-blue-50 text-blue-600 text-xs font-medium
                                     px-2 py-0.5 rounded-full whitespace-nowrap">
                      {count} {count === 1 ? 'quiz' : 'quizzes'}
                    </span>
                                    )}
                                </div>

                                {/* Description */}
                                {category.description ? (
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {category.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 mt-2 italic">No description.</p>
                                )}

                                <p className="mt-5 text-sm text-blue-600 font-medium
                              group-hover:translate-x-1 transition-transform inline-block">
                                    Browse Quizzes →
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CategoryListPage;