import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes } from '../../services/quizApi';
import { useNavigate } from 'react-router-dom';

const QuizListPage = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Quizzes</h1>
      {quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes available.</p>
      ) : (
        <div className="space-y-4">
          {(quizzes || []).map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/quizzes/${quiz.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{quiz.title}</h3>
                  <p className="text-gray-600 mt-1">{quiz.description}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-gray-500">
                    {quiz.totalQuestions} Questions
                  </span>
                  <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    Start
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizListPage;