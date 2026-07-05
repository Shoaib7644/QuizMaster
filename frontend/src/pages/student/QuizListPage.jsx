import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../../services/quizApi';
import { getAllCategories } from '../../services/categoryApi';

const DIFFICULTY_STYLES = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
};

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const [quizData, categoryData] = await Promise.all([
          getQuizzes(),
          getAllCategories(),
        ]);
        if (!isMounted) return;
        setQuizzes(Array.isArray(quizData) ? quizData : []);
        setCategories(categoryData || []);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load quizzes. Please try again.');
          setQuizzes([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch =
          !search ||
          quiz.title.toLowerCase().includes(search.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
          categoryFilter === 'all' || String(quiz.categoryId) === categoryFilter;
      const matchesDifficulty =
          difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [quizzes, search, categoryFilter, difficultyFilter]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading...
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-6">
          <p role="alert" className="text-red-600 text-center">{error}</p>
        </div>
    );
  }

  return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {quizzes.length === 0 ? (
            <p className="text-gray-500">No quizzes available.</p>
        ) : filteredQuizzes.length === 0 ? (
            <p className="text-gray-500">No quizzes match your filters.</p>
        ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                  <div
                      key={quiz.id}
                      onClick={() => navigate(`/quizzes/${quiz.id}/details`)}
                      className="bg-white rounded-lg shadow-md p-5 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition cursor-pointer group flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <span
                          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${DIFFICULTY_STYLES[quiz.difficulty] || 'bg-gray-100 text-gray-700'}`}
                      >
                  {quiz.difficulty}
                </span>
                    </div>

                    {categoryNameById.get(quiz.categoryId) && (
                        <span className="text-xs text-blue-600 font-medium mt-1">
                  {categoryNameById.get(quiz.categoryId)}
                </span>
                    )}

                    <p className="text-gray-600 text-sm mt-2 flex-1">{quiz.description}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{quiz.totalQuestions} Questions</span>
                        <span>·</span>
                        <span>{quiz.durationMinutes} min</span>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  View Details
                </span>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

export default QuizListPage;