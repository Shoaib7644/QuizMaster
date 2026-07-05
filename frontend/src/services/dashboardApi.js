import axiosInstance from './axiosInstance';

// Returns DashboardResponse payload: { stats: {...}, recentAttempts: [...] }
export const getStudentDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/student');
    return response.data;
};