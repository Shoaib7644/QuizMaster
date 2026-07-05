import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById, updateQuiz } from '../../services/quizApi';
import { getAllCategories } from '../../services/categoryApi';
import QuizForm from './QuizForm';

const EditQuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [categoriesError, setCategoriesError] = useState('');
    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setLoadError('');
            try {
                const [quiz, categoryData] = await Promise.all([
                    getQuizById(id),
                    getAllCategories(),
                ]);
                setInitialValues(quiz);
                setCategories((categoryData || []).filter((c) => c.isActive));
            } catch (err) {
                setLoadError(err.message || 'Unable to load quiz.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        setSubmitError('');
        try {
            await updateQuiz(id, payload);
            setSuccess(true);
            setTimeout(() => navigate('/admin/quizzes'), 1200);
        } catch (err) {
            setSubmitError(err.message || 'Failed to update quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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

    if (success) {
        return (
            <div className="p-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <p className="text-green-800">Quiz updated successfully!</p>
                </div>
            <a
                href="/admin/quizzes"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                Back to Quiz List
            </a>
    </div>
    );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Quiz</h1>
            <QuizForm
                initialValues={initialValues}
                categories={categories}
                categoriesError={categoriesError}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                submitting={submitting}
                submitError={submitError}
            />
        </div>
    );
};

export default EditQuizPage;