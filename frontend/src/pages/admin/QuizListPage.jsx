import React, { useEffect, useState } from 'react';
import { getQuizzes, deleteQuiz, publishQuiz, archiveQuiz } from '../../services/quizApi';

const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-yellow-100 text-yellow-700',
};

const AdminQuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowError, setRowError] = useState({}); // quizId -> message
  const [busyRow, setBusyRow] = useState(null); // quizId currently mid-action

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getQuizzes();
        setQuizzes(data || []);
      } catch (err) {
        console.error(err);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const setError = (quizId, message) =>
      setRowError((prev) => ({ ...prev, [quizId]: message }));

  const handleDelete = async (quizId) => {
    setBusyRow(quizId);
    setError(quizId, '');
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err) {
      setError(quizId, err.message || 'Failed to delete quiz.');
    } finally {
      setBusyRow(null);
    }
  };

  const handlePublish = async (quizId) => {
    setBusyRow(quizId);
    setError(quizId, '');
    try {
      const updated = await publishQuiz(quizId);
      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? updated : q)));
    } catch (err) {
      setError(quizId, err.message || 'Failed to publish quiz.');
    } finally {
      setBusyRow(null);
    }
  };

  const handleArchive = async (quizId) => {
    setBusyRow(quizId);
    setError(quizId, '');
    try {
      const updated = await archiveQuiz(quizId);
      setQuizzes((prev) => prev.map((q) => (q.id === quizId ? updated : q)));
    } catch (err) {
      setError(quizId, err.message || 'Failed to archive quiz.');
    } finally {
      setBusyRow(null);
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
        {quizzes.map((quiz) => (
            <div key={quiz.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-xl">{quiz.title}</h2>
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[quiz.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                  <p className="text-gray-600">{quiz.description}</p>
                  {rowError[quiz.id] && (
                      <p className="text-red-600 text-sm mt-1">{rowError[quiz.id]}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{quiz.totalQuestions} Questions</span>
                <a
                  href={`/admin/quizzes/${quiz.id}/questions`}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                  Questions
                </a>
                <a
                href={`/admin/quizzes/${quiz.id}/edit`}
                className="text-sm text-blue-600 hover:text-blue-500"
                >
                Edit
              </a>
              {quiz.status === 'DRAFT' && (
                  <button
                      onClick={() => handlePublish(quiz.id)}
                      disabled={busyRow === quiz.id || quiz.totalQuestions === 0}
                      title={quiz.totalQuestions === 0 ? 'Upload questions before publishing' : undefined}
                      className="text-sm text-green-600 hover:text-green-500 disabled:opacity-40"
                  >
                    {busyRow === quiz.id ? 'Publishing...' : 'Publish'}
                  </button>
              )}
              {quiz.status === 'PUBLISHED' && (
                  <button
                      onClick={() => handleArchive(quiz.id)}
                      disabled={busyRow === quiz.id}
                      className="text-sm text-yellow-700 hover:text-yellow-600 disabled:opacity-40"
                  >
                    {busyRow === quiz.id ? 'Archiving...' : 'Archive'}
                  </button>
              )}
              <button
                  onClick={() => handleDelete(quiz.id)}
                  disabled={busyRow === quiz.id}
                  className="text-sm text-red-600 hover:text-red-500 disabled:opacity-60"
              >
                {busyRow === quiz.id ? 'Deleting...' : 'Delete'}
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