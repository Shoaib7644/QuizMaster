import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Clock, Tag } from 'lucide-react';
import { getQuizById } from '../../services/quizApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const RULES = [
    'All questions are displayed on a single page — scroll to review them before submitting.',
    'Select one answer per question. You can change your selection at any time before submitting.',
    'Click Submit Quiz only when you are ready — answers cannot be changed after submission.',
    'Your score and results are shown immediately after submission.',
    'Each question carries equal marks toward your final percentage.',
];

const QuizDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getQuizById(id);
                if (isMounted) setQuiz(data);
            } catch (err) {
                if (isMounted) setError(err.message || 'Unable to load quiz details. Please try again.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-text-secondary">Loading quiz details...</div>;
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p role="alert" className="text-danger text-center">{error}</p>
            </div>
        );
    }

    if (!quiz) return null;

    const questionCount = quiz.totalQuestions ?? quiz.questions?.length ?? null;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <div>
                <div className="flex flex-wrap items-start gap-3">
                    <h1 className="text-2xl font-semibold text-text-primary leading-tight">{quiz.title}</h1>
                    {quiz.difficulty && <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>}
                </div>
                {quiz.description && (
                    <p className="text-text-secondary mt-2 leading-relaxed">{quiz.description}</p>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {questionCount != null && (
                    <Card className="text-center">
                        <HelpCircle size={18} className="text-primary mx-auto" />
                        <p className="text-xs text-text-secondary mt-2">Questions</p>
                        <p className="text-lg font-semibold text-text-primary">{questionCount}</p>
                    </Card>
                )}
                {quiz.durationMinutes != null && (
                    <Card className="text-center">
                        <Clock size={18} className="text-primary mx-auto" />
                        <p className="text-xs text-text-secondary mt-2">Duration</p>
                        <p className="text-lg font-semibold text-text-primary">{quiz.durationMinutes} min</p>
                    </Card>
                )}
                {quiz.categoryName && (
                    <Card className="text-center">
                        <Tag size={18} className="text-primary mx-auto" />
                        <p className="text-xs text-text-secondary mt-2">Category</p>
                        <p className="text-lg font-semibold text-text-primary">{quiz.categoryName}</p>
                    </Card>
                )}
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                    Before You Begin
                </h2>
                <ul className="space-y-2.5">
                    {RULES.map((rule, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </span>
                            {rule}
                        </li>
                    ))}
                </ul>
            </Card>

            <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate(`/quizzes/${id}`)} size="lg">
                    Start Quiz
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default QuizDetailsPage;