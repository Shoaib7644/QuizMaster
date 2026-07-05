import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../../services/quizApi';
import { getAllCategories } from '../../services/categoryApi';
import QuizForm from './QuizForm';
import QuestionUploadPanel from './QuestionUploadPanel';

const CreateQuizPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdQuiz, setCreatedQuiz] = useState(null); // null until quiz metadata is saved

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
      setCreatedQuiz(quiz); // advance to step 2: upload questions
    } catch (err) {
      setSubmitError(err.message || 'Failed to create quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: quiz metadata exists as a DRAFT — now upload questions and publish.
  if (createdQuiz) {
    return (
        <div className="p-6 space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-800">
              "{createdQuiz.title}" was created as a draft. Upload questions to finish setting it up.
            </p>
          </div>

          <QuestionUploadPanel
              quiz={createdQuiz}
              onQuizUpdated={setCreatedQuiz}
              onPublished={() => navigate('/admin/quizzes')}
          />

          <button
              type="button"
              onClick={() => navigate('/admin/quizzes')}
              className="text-sm text-blue-600 hover:text-blue-500"
          >
            I'll upload questions later — back to Quiz List
          </button>
        </div>
    );
  }

  // Step 1: quiz metadata
  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create New Quiz</h1>
        <QuizForm
            categories={categories}
            categoriesError={categoriesError}
            onSubmit={handleSubmit}
            submitLabel="Create Quiz"
            submitting={submitting}
            submitError={submitError}
        />
      </div>
  );
};

export default CreateQuizPage;