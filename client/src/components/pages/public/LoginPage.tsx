import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { loginRequest } from '@redux/auth/authSlice';
import AuthCard from '@components/AuthCard';
import InputField from '@components/InputField';
import { motion } from 'framer-motion';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isFormValid = () => {
    return (
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) &&
      formData.password.length >= 6
    );
  };

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const from = (location.state as { from?: Location })?.from?.pathname || '/user-dashboard';

  useEffect(() => {
    // Only redirect if successfully authenticated
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin-dashboard' : from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any existing errors from the Redux store
    dispatch(loginRequest({ email: formData.email, password: formData.password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <AuthCard title="Welcome Back">
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <InputField
            label={<>Email Address <span className="text-red-500">*</span></>}
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
          <InputField
            label={<>Password <span className="text-red-500">*</span></>}
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500
                      dark:hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`w-full bg-gradient-to-r from-purple-600 to-blue-500
                    hover:from-purple-700 hover:to-blue-600
                    text-white py-2.5 px-4 rounded-xl font-semibold
                    transform hover:scale-102 transition-all
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                    focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    ${!isFormValid() || loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-center text-red-600 dark:text-red-400 text-sm">
                {error === 'Invalid credentials' ? 'Invalid email or password' : error}
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-purple-600 dark:text-purple-400
                      hover:text-purple-500 dark:hover:text-purple-300
                      transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </motion.form>
      </AuthCard>
    </div>
  );
};

export default LoginPage;