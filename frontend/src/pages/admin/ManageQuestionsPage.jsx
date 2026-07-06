import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getQuizById } from '../../services/quizApi';
import PageHeader from '../../components/ui/PageHeader';
import QuestionUploadPanel from './QuestionUploadPanel';

const ManageQuestionsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            setLoadError('');
            try {
                const data = await getQuizById(id);
                setQuiz(data);
            } catch (err) {
                setLoadError(err.message || 'Unable to load quiz.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
    }

    if (loadError) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p role="alert" className="text-danger">{loadError}</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <button
                onClick={() => navigate('/admin/quizzes')}
                className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Quiz List
            </button>

            <PageHeader title={quiz.title} subtitle="Manage questions for this quiz." />

            <QuestionUploadPanel
                quiz={quiz}
                onQuizUpdated={setQuiz}
                onPublished={() => navigate('/admin/quizzes')}
            />
        </div>
    );
};

export default ManageQuestionsPage;