import axiosInstance from './axiosInstance';

export const getQuizzes = async () => {
  const response = await axiosInstance.get('/quizzes');
  return response.data;
};

export const getQuizById = async (quizId) => {
  const response = await axiosInstance.get(`/quizzes/${quizId}`);
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await axiosInstance.post('/quizzes', quizData);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await axiosInstance.put(`/quizzes/${quizId}`, quizData);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await axiosInstance.delete(`/quizzes/${quizId}`);
  return response.data;
};
