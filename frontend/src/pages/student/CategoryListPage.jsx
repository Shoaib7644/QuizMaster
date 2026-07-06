import React, { useEffect, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { getAllCategories } from '../../services/categoryApi';
import { getQuizzes } from '../../services/quizApi';
import PageHeader from '../../components/ui/PageHeader';
import CategoryCard from '../../components/quiz/CategoryCard';

const CategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [quizCountMap, setQuizCountMap] = useState({});
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
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
                if (isMounted) setError(err.message || 'Unable to load categories. Please try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return categories;
        return categories.filter(
            (c) => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)
        );
    }, [categories, search]);

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-text-secondary">Loading categories...</div>;
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p role="alert" className="text-danger text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageHeader title="Categories" subtitle="Browse quizzes by topic." />

            <div className="relative max-w-md mb-8">
                <Search size={16} className="absolute inset-y-0 left-3 my-auto text-text-secondary" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute inset-y-0 right-3 my-auto text-text-secondary hover:text-text-primary"
                        aria-label="Clear search"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {search && (
                <p className="text-sm text-text-secondary mb-4">
                    {filtered.length} {filtered.length === 1 ? 'category' : 'categories'} found
                </p>
            )}

            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-text-secondary text-lg font-medium">
                        {search ? 'No categories match your search.' : 'No categories available yet.'}
                    </p>
                    {search && (
                        <button onClick={() => setSearch('')} className="mt-3 text-sm text-primary hover:underline">
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            quizCount={quizCountMap[category.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryListPage;