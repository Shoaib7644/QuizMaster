import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById } from '../../services/quizApi';
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
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    if (loadError) {
        return (
            <div className="p-6">
                <p role="alert" className="text-red-600">{loadError}</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-gray-500 text-sm mt-1">Manage questions for this quiz.</p>
            </div>

            <QuestionUploadPanel
                quiz={quiz}
                onQuizUpdated={setQuiz}
                onPublished={() => navigate('/admin/quizzes')}
            />

            <button
                type="button"
                onClick={() => navigate('/admin/quizzes')}
                className="text-sm text-blue-600 hover:text-blue-500"
            >
                Back to Quiz List
            </button>
        </div>
    );
};

export default ManageQuestionsPage;