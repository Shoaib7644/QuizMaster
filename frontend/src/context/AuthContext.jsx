import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  login as loginApi,
  register as registerApi,
  getUserProfile,
} from '../services/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

const isValidToken = (token) =>
  typeof token === 'string' &&
  token.trim() !== '' &&
  token !== 'undefined' &&
  token !== 'null';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // true while the app is restoring/validating a session on boot.
  // ProtectedRoute must wait on this before deciding to redirect.
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * THE single authentication flow. Login, Register, and session
   * restoration on boot all funnel through this one function:
   *
   *   1. Store JWT
   *   2. Fetch profile (also re-validates the token against the backend)
   *   3. Save user
   *   4. Persist session
   *   5. Update context
   *
   * Login and Register components never see any of these steps directly.
   */
  const completeAuthentication = useCallback(async (token) => {
    if (!isValidToken(token)) {
      throw new Error('Authentication failed: no token received.');
    }

    localStorage.setItem('token', token); // 1. Store JWT

    const profile = await getUserProfile(); // 2. Fetch profile

    localStorage.setItem('user', JSON.stringify(profile)); // 3. Save user
    setUser(profile); // 4/5. Persist + update context
    setIsAuthenticated(true);

    return profile;
  }, []);

  // Session restoration on app boot: re-validate the stored token against
  // the backend rather than trusting cached localStorage data blindly.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');

      if (!isValidToken(storedToken)) {
        clearSession();
        if (isMounted) setLoading(false);
        return;
      }

      try {
        await completeAuthentication(storedToken);
      } catch {
        // Token invalid/expired — clear cleanly. Do not force-redirect here;
        // ProtectedRoute will redirect if/when the user hits a guarded route.
        clearSession();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginUser = useCallback(
    async (credentials) => {
      const { token } = await loginApi(credentials);
      return completeAuthentication(token);
    },
    [completeAuthentication]
  );

  const registerUser = useCallback(
    async (userData) => {
      const { token } = await registerApi(userData);
      return completeAuthentication(token);
    },
    [completeAuthentication]
  );

  const logout = useCallback(() => {
    clearSession();
    window.location.href = '/login';
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated,
    loading,
    loginUser,
    registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};