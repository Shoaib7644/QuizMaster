import axiosInstance from './axiosInstance';

export const getResultByAttemptId = async (attemptId) => {
  const response = await axiosInstance.get(`/results/${attemptId}`);
  // axiosInstance's response interceptor already unwraps the
  // { success, data, message } envelope, so response.data IS the
  // ResultResponse payload here — do not unwrap again.
  return response.data;
};