import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getQuizzesByCategory } from '../../services/categoryApi';
import QuizCard from '../../components/quiz/QuizCard';

const CategoryQuizListPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getQuizzesByCategory(id);
                if (isMounted) {
                    setCategory({ id: data.id, name: data.name, description: data.description });
                    setQuizzes(data.quizzes ?? []);
                }
            } catch (err) {
                if (isMounted) setError(err.message || 'Unable to load quizzes for this category. Please try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-text-secondary">Loading quizzes...</div>;
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p role="alert" className="text-danger text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <nav className="flex items-center gap-1.5 text-sm text-text-secondary">
                <button onClick={() => navigate('/categories')} className="hover:text-primary transition-colors">
                    Categories
                </button>
                <ChevronRight size={14} />
                <span className="text-text-primary font-medium">{category?.name ?? 'Category'}</span>
            </nav>

            <div>
                <h1 className="text-2xl font-semibold text-text-primary">{category?.name}</h1>
                {category?.description && <p className="text-text-secondary mt-1">{category.description}</p>}
                {quizzes.length > 0 && (
                    <p className="text-sm text-text-secondary mt-1">
                        {quizzes.length} published {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                    </p>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-text-secondary text-lg font-medium">
                        No quizzes available in this category yet.
                    </p>
                    <button onClick={() => navigate('/categories')} className="mt-3 text-sm text-primary hover:underline">
                        ← Back to Categories
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} categoryName={category?.name} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryQuizListPage;