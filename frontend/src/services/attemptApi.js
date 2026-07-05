import axiosInstance from './axiosInstance';

export const startAttempt = async (userId, quizId) => {
  const response = await axiosInstance.post('/attempts/start', { userId, quizId });
  return response.data;
};

export const submitAttempt = async (attemptId, answers) => {
  const response = await axiosInstance.post('/attempts/submit', { attemptId, answers });
  return response.data;
};

// GET /attempts/history — authenticated endpoint, resolves userId from JWT.
// Returns List<ResultResponse>: each entry contains score, percentage,
// startedAt, submittedAt, and (when enriched by the service) quizTitle,
// categoryName, quizId, status, attemptNumber.
export const getAttemptHistory = async () => {
  const response = await axiosInstance.get('/attempts/history');
  return response.data;
};

export const getAttemptById = async (attemptId) => {
  const response = await axiosInstance.get(`/attempts/${attemptId}`);
  return response.data;
};