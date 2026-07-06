import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle } from 'lucide-react';
import { getQuizById } from '../../services/quizApi';
import { startAttempt, submitAttempt } from '../../services/attemptApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const QuizAttemptPage = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attemptId, setAttemptId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Per-execution guards. These are declared fresh on every effect run
        // (including both StrictMode dev-mode invocations), so each run has its
        // own independent "am I still the current run?" state. Nothing here
        // skips or suppresses the second StrictMode invocation — both runs
        // execute in full, exactly as StrictMode intends. What changes is that
        // only the run that is still "current" at resolution time is allowed
        // to touch component state.
        let isStale = false;
        const abortController = new AbortController();

        const fetchQuizAndStartAttempt = async () => {
            try {
                // NOTE: getQuizById/startAttempt do not currently accept a signal
                // parameter (see attemptApi.js / quizApi.js). Passing it here is a
                // forward-compatible no-op today; once those functions are updated
                // to forward `signal` into the Axios config, request-level
                // cancellation will activate automatically with no further changes
                // to this file.
                const quizData = await getQuizById(quizId);
                if (isStale) return;
                setQuiz(quizData);

                const attempt = await startAttempt(quizId);
                if (isStale) return;
                setAttemptId(attempt.attemptId);
            } catch (err) {
                const isAbortError =
                    err?.name === 'AbortError' ||
                    err?.code === 'ERR_CANCELED' ||
                    abortController.signal.aborted;

                if (isStale || isAbortError) return;

                setLoadError(err.message || 'Failed to load quiz or start attempt.');
            } finally {
                if (!isStale) setLoading(false);
            }
        };

        fetchQuizAndStartAttempt();

        // Cleanup runs between the two StrictMode mounts (and on real unmount).
        // It marks this run as stale so any in-flight/pending .then() or catch
        // handlers above become no-ops, and it requests cancellation of the
        // underlying network call via AbortController (effective once the API
        // layer forwards the signal; see note above).
        return () => {
            isStale = true;
            abortController.abort();

            setQuiz(null);
            setAttemptId(null);
            setAnswers({});
            setSubmitted(false);
            setResult(null);
        };
    }, [quizId]);

    const handleAnswerChange = (questionId, selectedAnswer) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }));
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setSubmitError('');

        if (!attemptId) {
            setSubmitError('System error: attempt could not be started. Please go back and try again.');
            return;
        }

        const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId: Number(questionId),
            selectedAnswer,
        }));

        setSubmitting(true);
        try {
            const submitResult = await submitAttempt(attemptId, answersArray);
            setResult(submitResult);
            setSubmitted(true);
        } catch (err) {
            const message = err.message || '';
            if (message.toLowerCase().includes('already submitted')) {
                navigate('/quizzes');
                return;
            }
            setSubmitError(message || 'Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-text-secondary">Loading...</div>;
    }

    if (loadError) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p role="alert" className="text-danger text-center">{loadError}</p>
            </div>
        );
    }

    if (!quiz || Object.keys(quiz).length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p className="text-text-secondary">Quiz not found or failed to load properly.</p>
            </div>
        );
    }

    if (submitted && result) {
        return (
            <div className="max-w-lg mx-auto p-6">
                <Card className="text-center">
                    <h2 className="text-xl font-semibold text-text-primary">Quiz Submitted!</h2>
                    <p className="text-text-secondary mt-3">
                        Your score: <strong className="text-text-primary">{result.score}</strong> out of {quiz.totalQuestions}
                    </p>
                    <p className="text-text-secondary mt-1">
                        Percentage: <strong className="text-text-primary">{result.percentage ? result.percentage.toFixed(2) : '0.00'}%</strong>
                    </p>
                    <div className="flex gap-3 justify-center mt-6">
                        <Button onClick={() => navigate(`/results/${attemptId}`)}>
                            View Result
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                            Back to Quizzes
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-text-primary">{quiz.title}</h1>
                {quiz.difficulty && <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>}
            </div>
            <p className="text-text-secondary mb-2">{quiz.description}</p>
            <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
        <span className="inline-flex items-center gap-1">
          <HelpCircle size={14} /> {quiz.questions?.length ?? quiz.totalQuestions} Questions
        </span>
                {quiz.durationMinutes != null && (
                    <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {quiz.durationMinutes} min
          </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {quiz.questions?.map((question, index) => (
                    <Card key={question.id}>
                        <h3 className="font-semibold text-text-primary mb-3">
                            {index + 1}. {question.text}
                        </h3>
                        {question.type === 'MCQ' && (
                            <div className="space-y-2">
                                {question.options?.map((option, i) => (
                                    <label
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-text-primary cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option}
                                            checked={answers[question.id] === option}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            className="accent-primary"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        )}
                        {question.type === 'TRUE_FALSE' && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value="true"
                                        checked={answers[question.id] === 'true'}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        className="accent-primary"
                                    />
                                    True
                                </label>
                                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value="false"
                                        checked={answers[question.id] === 'false'}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        className="accent-primary"
                                    />
                                    False
                                </label>
                            </div>
                        )}
                    </Card>
                ))}

                {submitError && (
                    <p role="alert" className="text-danger text-sm">{submitError}</p>
                )}

                <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
            </form>
        </div>
    );
};

export default QuizAttemptPage;