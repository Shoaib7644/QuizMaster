import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizById } from '../../services/quizApi';
import { startAttempt, submitAttempt } from '../../services/attemptApi';

const QuizAttemptPage = () => {
  const { user } = useAuth();
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: selectedAnswer }
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

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
        // 1. Fetch the quiz details (Double envelope)
        // NOTE: getQuizById/startAttempt do not currently accept a signal
        // parameter (see attemptApi.js / quizApi.js). Passing it here is a
        // forward-compatible no-op today; once those functions are updated
        // to forward `signal` into the Axios config, request-level
        // cancellation will activate automatically with no further changes
        // to this file.
// 1. Fetch quiz
const quiz = await getQuizById(quizId);

if (isStale) return;

console.log("Quiz:", quiz);
setQuiz(quiz);

// 2. Start attempt
const attempt = await startAttempt(user.id, quizId);

if (isStale) return;

console.log("Attempt:", attempt);
setAttemptId(attempt.attemptId);

      } catch (err) {
        // Swallow cancellation errors silently — they are expected and
        // harmless artifacts of a superseded run, not real failures.
        const isAbortError =
          err?.name === 'AbortError' ||
          err?.code === 'ERR_CANCELED' ||
          abortController.signal.aborted;

        if (isStale || isAbortError) {
          return;
        }

        console.error('Failed to load quiz or start attempt', err);
      } finally {
        if (!isStale) {
          setLoading(false);
        }
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
  }, [quizId, user.id]);

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const handleSubmit = async (e) => {
    console.log("!!! HANDLESUBMIT TRIGGERED !!!");
    if (e && e.preventDefault) e.preventDefault();

    if (!attemptId) {
      console.log("Blocked! attemptId is missing or empty:", attemptId);
      alert("System error: Attempt ID could not be retrieved. Cannot submit.");
      return;
    }

    // Format the answers as an array of objects with questionId and selectedAnswer
    const answersArray = Object.entries(answers).map(
      ([questionId, selectedAnswer]) => ({
        questionId: Number(questionId),
        selectedAnswer,
      })
    );

    try {
const result = await submitAttempt(attemptId, answersArray);
setResult(result);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission processing details:", err);

      const errorPayload = err.response?.data;
      const errorMessage = errorPayload?.message || errorPayload?.detail || errorPayload?.error || "";

      if (errorMessage.toLowerCase().includes("already submitted") || err.response?.status === 500) {
        alert("This quiz attempt has already been finalized or submitted.");
        navigate('/quizzes');
        return;
      }

      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!quiz || Object.keys(quiz).length === 0) {
    return <div className="p-6">Quiz not found or failed to load properly.</div>;
  }

  if (submitted && result) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz Submitted!</h2>
        <p className="mb-4">
          Your score: **{result.score}** out of {quiz.totalQuestions}
        </p>
        <p className="mb-4">
          Percentage: **{result.percentage ? result.percentage.toFixed(2) : "0.00"}%**
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate(`/results/${attemptId}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Result
          </button>
          <button
            onClick={() => navigate(`/quizzes`)}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      <p className="mb-6">{quiz.description}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions?.map((question) => (
          <div key={question.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">{question.text}</h3>
            {question.type === 'MCQ' && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
            {question.type === 'TRUE_FALSE' && (
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="true"
                    checked={answers[question.id] === 'true'}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-2"
                  />
                  <span>True</span>
                </label>
                <label className="flex items-center mt-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="false"
                    checked={answers[question.id] === 'false'}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-2"
                  />
                  <span>False</span>
                </label>
              </div>
            )}
          </div>
        ))}

        {!submitted && (
          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuizAttemptPage;