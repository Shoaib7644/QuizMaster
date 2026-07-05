import axiosInstance from './axiosInstance';

export const getCategories = async () => {
  const response = await axiosInstance.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await axiosInstance.put(`/categories/${categoryId}`, categoryData);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`/categories/${categoryId}`);
  return response.data;
};

// Returns CategoryResponse[]: [{ id, name, description, isActive }]
export const getAllCategories = async () => {
  const response = await axiosInstance.get('/categories');
  return response.data;
};

// Returns CategoryResponse: { id, name, description, isActive }
export const getCategoryById = async (categoryId) => {
  const response = await axiosInstance.get(`/categories/${categoryId}`);
  return response.data;
};

// Returns CategorySummaryDto: { id, name, description, quizzes: QuizSummaryDto[] }
// QuizSummaryDto: { id, title, description, difficulty, durationMinutes, totalQuestions }
// Only PUBLISHED quizzes are included — filtered by the backend.
export const getQuizzesByCategory = async (categoryId) => {
  const response = await axiosInstance.get(`/categories/${categoryId}/quizzes`);
  return response.data;
};