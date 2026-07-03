import axiosInstance from './axiosInstance';

/**
 * Thin API layer. Every function returns the unwrapped payload directly
 * (axiosInstance's response interceptor already stripped the ApiResponse
 * envelope). No localStorage access, no business logic, no parsing here —
 * that all belongs in AuthContext.
 *
 * Note: no logout() is exposed here. The backend does not document a
 * server-side session/logout endpoint (see API_Design_Document_v1),
 * so logout is purely a client-side concern owned by AuthContext.
 * If a server-side token revocation endpoint is added later, add
 * `logout()` here and it will only need to be wired into
 * AuthContext.logout().
 */

// Returns AuthResponse payload: { token, tokenType }
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Returns AuthResponse payload: { token, tokenType }
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

// Returns UserDto payload: { id, firstName, lastName, email, role }
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};