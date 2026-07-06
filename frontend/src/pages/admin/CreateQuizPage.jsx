import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../../services/quizApi';
import { getAllCategories } from '../../services/categoryApi';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import QuizForm from './QuizForm';
import QuestionUploadPanel from './QuestionUploadPanel';

const CreateQuizPage = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [categoriesError, setCategoriesError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [createdQuiz, setCreatedQuiz] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await getAllCategories();
                setCategories((data || []).filter((c) => c.isActive));
            } catch (err) {
                setCategoriesError(err.message || 'Unable to load categories.');
            }
        })();
    }, []);

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        setSubmitError('');
        try {
            const quiz = await createQuiz(payload);
            setCreatedQuiz(quiz);
        } catch (err) {
            setSubmitError(err.message || 'Failed to create quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (createdQuiz) {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <Card className="bg-success/5 border-success/20">
                    <p className="text-text-primary text-sm">
                        <strong>"{createdQuiz.title}"</strong> was created as a draft. Upload questions to finish setting it up.
                    </p>
                </Card>

                <QuestionUploadPanel
                    quiz={createdQuiz}
                    onQuizUpdated={setCreatedQuiz}
                    onPublished={() => navigate('/admin/quizzes')}
                />

                <button
                    type="button"
                    onClick={() => navigate('/admin/quizzes')}
                    className="text-sm text-primary hover:text-primary-hover"
                >
                    I'll upload questions later — back to Quiz List
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <PageHeader title="Create New Quiz" />
            <Card>
                <QuizForm
                    categories={categories}
                    categoriesError={categoriesError}
                    onSubmit={handleSubmit}
                    submitLabel="Create Quiz"
                    submitting={submitting}
                    submitError={submitError}
                />
            </Card>
        </div>
    );
};

export default CreateQuizPage;