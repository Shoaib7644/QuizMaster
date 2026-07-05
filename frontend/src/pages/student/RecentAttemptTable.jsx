import React from 'react';
import { Link } from 'react-router-dom';

const formatPercentage = (value) =>
    typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';

const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
};

const RecentAttemptTable = ({ attempts }) => {
    if (!attempts || attempts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                No attempts yet. Take a quiz to see your history here.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {attempts.map((attempt) => (
                    <tr key={attempt.attemptId}>
                        <td className="px-4 py-3 text-sm text-gray-700">Quiz #{attempt.quizId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                            {attempt.score ?? 0} / {attempt.totalQuestions ?? 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatPercentage(attempt.percentage)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(attempt.submittedAt)}</td>
                        <td className="px-4 py-3 text-sm">
                            <Link
                                to={`/results/${attempt.attemptId}`}
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                View Result
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentAttemptTable;