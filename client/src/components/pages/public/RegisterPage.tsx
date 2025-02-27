import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '@components/AuthCard';
import InputField from '@components/InputField';
import { motion } from 'framer-motion';
import { registerUser } from '@services/authServices';
import { RegisterFormData, RegisterErrors } from "../../../types/forms";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Initialize formData state with type RegisterFormData
    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Initialize errors state with type RegisterErrors
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validate individual field
    const validateField = (name: keyof RegisterFormData, value: string, allFormData: RegisterFormData = formData): string => {
        switch (name) {
            case 'username':
                return value.length < 3 ? 'Username must be at least 3 characters long' : '';
            case 'email':
                const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
            case 'password':
                return value.length < 6 ? 'Password must be at least 6 characters long' : '';
            case 'confirmPassword':
                return value !== formData.password ? "Passwords don't match" : '';
            default:
                return '';
        }
    };
    // Check if form is valid using current error state
    const isFormValid = (): boolean => {
        const allFieldsFilled = Object.values(formData).every(value => value.length > 0);
        const noErrors = Object.values(errors).every(error => error === '');
        const allFieldsTouched = Object.keys(formData).every(
            field => touched[field]
        );
        return allFieldsFilled && noErrors && allFieldsTouched;
    };

    // Handle input field change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const fieldName = id as keyof RegisterFormData;
        const newFormData = {
            ...formData,
            [fieldName]: value
        };
        setFormData(newFormData);

        if (touched[fieldName]) {
            const error = validateField(fieldName, value, newFormData);
            setErrors(prev => ({
                ...prev,
                [fieldName]: error
            }));
        }
        if (fieldName === 'password' && touched.confirmPassword) {
            const confirmError = validateField('confirmPassword', newFormData.confirmPassword, newFormData);
            setErrors(prev => ({
                ...prev,
                confirmPassword: confirmError
            }));
        }
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { id } = e.target;
        const fieldName = id as keyof RegisterFormData;

        setTouched(prev => ({
            ...prev,
            [fieldName]: true
        }));

        const error = validateField(fieldName, formData[fieldName]);
        setErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce(
            (acc, field) => ({ ...acc, [field]: true }),
            {}
        );
        setTouched(allTouched);
        // Validate all fields one last time
        const newErrors: RegisterErrors = {};
        Object.keys(formData).forEach(field => {
            const fieldName = field as keyof RegisterFormData;
            const error = validateField(fieldName, formData[fieldName]);
            if (error) newErrors[fieldName] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await registerUser(
                formData.username,
                formData.email,
                formData.password
            );
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
        } finally {
            setLoading(false);
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
                        label={<>Username <span className="text-red-500">*</span></>}
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.username}
                        placeholder="Choose a username"
                        required
                    />
                    <InputField
                        label={<>Email Address <span className="text-red-500">*</span></>}
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        placeholder="your@email.com"
                        required
                    />
                    <InputField
                        label={<>Password <span className="text-red-500">*</span></>}
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        placeholder="Choose a strong password"
                        required
                    />
                    <InputField
                        label={<>Confirm Password <span className="text-red-500">*</span></>}
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.confirmPassword}
                        placeholder="Confirm your password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={!isFormValid() || loading}
                        className={`w-full bg-gradient-to-r from-purple-600 to-blue-500 
                                    hover:from-purple-700 hover:to-blue-600 
                                    text-white py-2.5 px-4 rounded-xl font-semibold
                                    transform hover:scale-102 transition-all
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 
                                    focus:ring-offset-2 dark:focus:ring-offset-gray-800
                                    ${(!isFormValid() || loading) ? 'opacity-70 cursor-not-allowed' : ''}`} >
                        {loading ? 'Creating Account...' : 'Create Account'}
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
