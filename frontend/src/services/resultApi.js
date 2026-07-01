import axiosInstance from './axiosInstance';

export const getResultByAttemptId = async (attemptId) => {
  const response = await axiosInstance.get(`/results/${attemptId}`);
  // Backend envelope is always { success, data, message }.
  // Unwrap here, once, so every consumer of this function receives the
  // plain ResultResponse object and never has to guess at nesting.
  return response.data.data;
};