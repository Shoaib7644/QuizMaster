import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getResultByAttemptId } from '../../services/resultApi';

const ResultPage = () => {
  const { user } = useAuth();
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getResultByAttemptId(Number(attemptId));
        setResult(data);
      } catch (err) {
        console.error('Failed to fetch result', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!result) {
    return <div className="p-6">Result not found.</div>;
  }

  // Null-safe formatting helpers. FR-8 / US-013 only guarantee these fields
  // exist on a submitted attempt, but we defend against nulls anyway so a
  // partially-populated or unexpected payload never crashes the render.
  const formatPercentage = (value) =>
    typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quiz Result</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-2">
          <strong>Started:</strong> {formatDateTime(result.startedAt)}
        </p>
        <p className="mb-2">
          <strong>Submitted:</strong> {formatDateTime(result.submittedAt)}
        </p>

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Score</h2>
          <p className="text-2xl font-bold">
            {result.score ?? 0} / {result.totalQuestions ?? 0}
          </p>
          <p className="text-gray-600">{formatPercentage(result.percentage)}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Correct Answers</p>
            <p className="text-xl font-semibold text-green-600">
              {result.correctAnswers ?? 0}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Incorrect Answers</p>
            <p className="text-xl font-semibold text-red-600">
              {result.incorrectAnswers ?? 0}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total Questions</p>
            <p className="text-xl font-semibold">
              {result.totalQuestions ?? 0}
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total Points</p>
            <p className="text-xl font-semibold">
              {result.totalPoints ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/quizzes"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;