import React, { useEffect, useMemo, useState } from 'react';
import { getQuizzes } from '../../services/quizApi';
import { getAllCategories } from '../../services/categoryApi';
import PageHeader from '../../components/ui/PageHeader';
import QuizCard from '../../components/quiz/QuizCard';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

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
        <div className="flex items-center justify-center h-64 text-text-secondary">
          Loading...
        </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-6xl mx-auto p-6">
          <p role="alert" className="text-danger text-center">{error}</p>
        </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto p-6">
        <PageHeader title="Available Quizzes" subtitle="Find a quiz to sharpen your skills." />

        <div className="flex flex-wrap gap-3 mb-8">
          <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {quizzes.length === 0 ? (
            <p className="text-text-secondary text-center py-12">No quizzes available.</p>
        ) : filteredQuizzes.length === 0 ? (
            <p className="text-text-secondary text-center py-12">No quizzes match your filters.</p>
        ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                  <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      categoryName={categoryNameById.get(quiz.categoryId)}
                  />
              ))}
            </div>
        )}
      </div>
  );
};

export default QuizListPage;