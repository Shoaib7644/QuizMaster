import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes } from '../../services/quizApi';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const payload = await getQuizzes();
        
        // Since quizApi returns response.data, 'payload' is { success: true, data: [...] }
        const actualQuizArray = payload?.data; 

        setQuizzes(Array.isArray(actualQuizArray) ? actualQuizArray : []);
      } catch (err) {
        console.error('Error loading quizzes:', err);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Fallback to 'User' if firstName isn't populated yet */}
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.firstName ?? 'User'}!</h1>
      <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
      
      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center">No quizzes available.</p>
      ) : (
        /* The 'grid' class here ensures your layout renders perfectly */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/quizzes/${quiz.id}`)}
            >
              <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
              <p className="text-gray-600">{quiz.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {quiz.totalQuestions} Questions
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
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