import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

/**
 * Normalized error for both application-level failures
 * (ApiResponse.success === false) and transport-level failures
 * (network errors, non-2xx HTTP status). Every caller in the app
 * can safely read `error.message` for direct display to the user.
 */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Guards against ever sending `Authorization: Bearer undefined`,
 * `Bearer null`, or `Bearer ` (empty/whitespace).
 */
const isValidToken = (token) =>
  typeof token === 'string' &&
  token.trim() !== '' &&
  token !== 'undefined' &&
  token !== 'null';

// Request interceptor: attach JWT to every outgoing request, only if valid
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: the ONLY place in the app aware of the backend's
 * ApiResponse<T> envelope { success, data, message }.
 *
 * On success: callers receive `response.data` === the unwrapped payload T
 * directly (never `response.data.data`, never the envelope).
 *
 * On success:false or an HTTP error: callers get a single rejected
 * `ApiError`, carrying the backend's message when available.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data;
    const isEnvelope = body && typeof body === 'object' && 'success' in body;

    if (isEnvelope) {
      if (!body.success) {
        return Promise.reject(
          new ApiError(body.message || 'Request failed', response.status, body)
        );
      }
      return { ...response, data: body.data, message: body.message };
    }

    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const backendMessage = error.response?.data?.message;
    const message = backendMessage || error.message || 'Something went wrong. Please try again.';

    return Promise.reject(
      new ApiError(message, error.response?.status, error.response?.data)
    );
  }
);

export default axiosInstance;