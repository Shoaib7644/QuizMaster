import axiosInstance from './axiosInstance';

// userId removed: AttemptController derives it from the authenticated JWT
// (SecurityContextHolder), never from the request body. Sending it here
// was a dead parameter with no effect on the backend.
export const startAttempt = async (quizId) => {
  const response = await axiosInstance.post('/attempts/start', { quizId });
  return response.data;
};

export const submitAttempt = async (attemptId, answers) => {
  const response = await axiosInstance.post('/attempts/submit', { attemptId, answers });
  return response.data;
};

// GET /attempts/history — authenticated endpoint, resolves userId from JWT.
// Returns List<ResultResponse>: each entry contains score, percentage,
// startedAt, submittedAt, quizTitle, categoryName.
export const getAttemptHistory = async () => {
  const response = await axiosInstance.get('/attempts/history');
  return response.data;
};

// FLAGGED: AttemptController has no GET /attempts/{id} mapping today.
// Calling this will 404 until that endpoint exists. Left in place in case
// something depends on it — confirm usage before I build the backend side.
export const getAttemptById = async (attemptId) => {
  const response = await axiosInstance.get(`/attempts/${attemptId}`);
  return response.data;
};