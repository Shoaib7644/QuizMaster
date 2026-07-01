import axiosInstance from './axiosInstance';

export const startAttempt = async (userId, quizId) => {
  const response = await axiosInstance.post('/attempts/start', { userId, quizId });
  return response.data;
};

export const submitAttempt = async (attemptId, answers) => {
  const response = await axiosInstance.post(`/attempts/submit`, { attemptId, answers });
  return response.data;
};

export const getAttemptHistory = async (userId) => {
  const response = await axiosInstance.get(`/attempts?userId=${userId}`);
  return response.data;
};

export const getAttemptById = async (attemptId) => {
  const response = await axiosInstance.get(`/attempts/${attemptId}`);
  return response.data;
};
