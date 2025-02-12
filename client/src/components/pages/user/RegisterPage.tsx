import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/AuthCard';
import InputField from '../../components/InputField';
import { motion } from 'framer-motion';
import { registerUser } from '../../../services/authServices';
import { RegisterFormData, RegisterErrors } from "../../../types/forms";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    // Initialize formData state with type RegisterFormData
    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Initialize errors state with type RegisterErrors
    const [errors, setErrors] = useState<RegisterErrors>({});

    // Handle input field change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setFormData({
            ...formData,
            [id]: value
        });

        // Clear error when user starts typing
        if (errors[id as keyof RegisterErrors]) {
            setErrors({
                ...errors,
                [id]: ''
            });
        }
    };

    // Validate the form before submission
    const validateForm = (): RegisterErrors => {
        const newErrors: RegisterErrors = {};

        // Username validation
        if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            // Register user
            await registerUser(
                formData.username,
                formData.email,
                formData.password
            );

            // Redirect to login page upon successful registration
            navigate('/login');
        } catch (error: any) {
            // Handle registration errors
            if (error.message.includes('already exists')) {
                setErrors({
                    email: 'An account with this email already exists'
                });
            } else {
                setErrors({
                    submit: 'Registration failed. Please try again.'
                });
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <AuthCard title="Create an Account">
                <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {errors.submit && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <InputField
                        label="Username"
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        placeholder="Choose a username"
                        required
                    />
                    <InputField
                        label="Email Address"
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="your@email.com"
                        required
                    />
                    <InputField
                        label="Password"
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Choose a strong password"
                        required
                    />
                    <InputField
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="Confirm your password"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 
                                 hover:from-purple-700 hover:to-blue-600 
                                 text-white py-2.5 px-4 rounded-xl font-semibold
                                 transform hover:scale-102 transition-all
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 
                                 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                        Create Account
                    </button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-purple-600 dark:text-purple-400 
                                     hover:text-purple-500 dark:hover:text-purple-300 
                                     transition-colors font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.form>
            </AuthCard>
        </div>
    );
};

export default RegisterPage;
