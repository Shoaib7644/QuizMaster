import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes } from '../../services/quizApi';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzes = await getQuizzes();

        setQuizzes(Array.isArray(quizzes) ? quizzes : []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.firstName}!
      </h1>

      <h2 className="text-xl font-semibold mb-6">
        Available Quizzes
      </h2>

      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center">
          No quizzes available.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/quizzes/${quiz.id}`)}
            >
              <h3 className="text-lg font-semibold">
                {quiz.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {quiz.description}
              </p>

              <div className="flex justify-between mt-5">
                <span>{quiz.totalQuestions} Questions</span>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  Start Quiz
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;