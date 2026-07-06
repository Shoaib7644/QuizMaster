import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, HelpCircle, Award } from 'lucide-react';
import { getResultByAttemptId } from '../../services/resultApi';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';

const formatPercentage = (value) =>
    typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
};

const ResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
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
    return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
  }

  if (!result) {
    return (
        <div className="max-w-2xl mx-auto p-6">
          <p className="text-text-secondary">Result not found.</p>
        </div>
    );
  }

  const percentageValue = typeof result.percentage === 'number' ? result.percentage : 0;

  return (
      <div className="max-w-3xl mx-auto p-6">
        <PageHeader title="Quiz Result" />

        <Card className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Award size={26} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold text-text-primary mt-4">
            {result.score ?? 0} / {result.totalQuestions ?? 0}
          </p>
          <p className="text-text-secondary mt-1">{formatPercentage(result.percentage)}</p>
          <div className="max-w-xs mx-auto mt-4">
            <ProgressBar percentage={percentageValue} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <Card className="text-center">
            <CheckCircle2 size={20} className="text-success mx-auto" />
            <p className="text-xs text-text-secondary mt-2">Correct</p>
            <p className="text-xl font-semibold text-success">{result.correctAnswers ?? 0}</p>
          </Card>
          <Card className="text-center">
            <XCircle size={20} className="text-danger mx-auto" />
            <p className="text-xs text-text-secondary mt-2">Incorrect</p>
            <p className="text-xl font-semibold text-danger">{result.incorrectAnswers ?? 0}</p>
          </Card>
          <Card className="text-center">
            <HelpCircle size={20} className="text-text-secondary mx-auto" />
            <p className="text-xs text-text-secondary mt-2">Total Questions</p>
            <p className="text-xl font-semibold text-text-primary">{result.totalQuestions ?? 0}</p>
          </Card>
          <Card className="text-center">
            <Award size={20} className="text-primary mx-auto" />
            <p className="text-xs text-text-secondary mt-2">Total Points</p>
            <p className="text-xl font-semibold text-text-primary">{result.totalPoints ?? 0}</p>
          </Card>
        </div>

        <Card className="mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Started</span>
            <span className="text-text-primary font-medium">{formatDateTime(result.startedAt)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-text-secondary">Submitted</span>
            <span className="text-text-primary font-medium">{formatDateTime(result.submittedAt)}</span>
          </div>
        </Card>

        <Button variant="secondary" onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </Button>
      </div>
  );
};

export default ResultPage;