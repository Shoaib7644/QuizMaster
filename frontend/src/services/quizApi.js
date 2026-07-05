import axiosInstance from './axiosInstance';

export const getQuizzes = async () => {
  const response = await axiosInstance.get('/quizzes');
  return response.data; // was response.data.data — double unwrap bug
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

export const publishQuiz = async (quizId) => {
  const response = await axiosInstance.patch(`/quizzes/${quizId}/publish`);
  return response.data;
};

export const archiveQuiz = async (quizId) => {
  const response = await axiosInstance.patch(`/quizzes/${quizId}/archive`);
  return response.data;
};

export const uploadQuestions = async (quizId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post(`/quizzes/${quizId}/questions/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};