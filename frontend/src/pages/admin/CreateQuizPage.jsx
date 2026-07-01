import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createQuiz } from '../../services/quizApi';

const CreateQuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: '',
    durationMinutes: '',
    totalQuestions: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await createQuiz(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/quizzes');
      }, 1500);
    } catch (err) {
      setError('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-800">Quiz created successfully!</p>
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
      <h1 className="text-2xl font-bold mb-4">Create New Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            name="title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows="4"
            name="description"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-700">
              Category ID
            </label>
            <input
              id="categoryId"
              type="number"
              name="categoryId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.categoryId}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block mb-2 text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="">Select Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="durationMinutes" className="block mb-2 text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              id="durationMinutes"
              type="number"
              name="durationMinutes"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.durationMinutes}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="totalQuestions" className="block mb-2 text-sm font-medium text-gray-700">
              Total Questions
            </label>
            <input
              id="totalQuestions"
              type="number"
              name="totalQuestions"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.totalQuestions}
              onChange={handleChange}
            />
          </div>
        </div>
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuizPage;
