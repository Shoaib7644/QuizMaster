import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes } from '../../services/quizApi';
import { deleteQuiz } from '../../services/quizApi';

const AdminQuizListPage = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // quizId being deleted

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getQuizzes();
        setQuizzes(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch quizzes', err);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    setDeleting(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    } catch (err) {
      console.error('Failed to delete quiz', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <a
          href="/admin/quizzes/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          New Quiz
        </a>
      </div>
      {quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes found.</p>
      ) : (
        <div className="divide-y">
          {(quizzes || []).map((quiz) => (
            <div key={quiz.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-xl">{quiz.title}</h2>
                  <p className="text-gray-600">{quiz.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {quiz.totalQuestions} Questions
                  </span>
                  <a
                    href={`/admin/quizzes/${quiz.id}/edit`}
                     className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    disabled={deleting === quiz.id}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    {deleting === quiz.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizListPage;