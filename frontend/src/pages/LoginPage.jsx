import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await loginUser({ email, password });
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-text-primary">QuizMaster</h1>
          </div>
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Welcome back</h2>
            <p className="text-sm text-text-secondary mb-6">Log in to continue learning.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-text-primary">
                  Email
                </label>
                <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-text-primary">
                  Password
                </label>
                <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                  <p role="alert" className="text-danger text-sm">{error}</p>
              )}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-primary hover:text-primary-hover">
                Register here
              </a>
            </p>
          </Card>
        </div>
      </div>
  );
};

export default LoginPage;