import React, { useState } from 'react';
import { FiX, FiUserPlus, FiAlertTriangle } from 'react-icons/fi';
import { registerUser } from '@services/authServices';
import InputField from '@components/InputField';

interface CreateUserFormData {
    username: string;
    email: string;
    password: string;
}

interface AdminCreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const AdminCreateUserModal = ({ isOpen, onClose, onUserCreated }: AdminCreateUserModalProps) => {
    const [formData, setFormData] = useState<CreateUserFormData>({
        username: '',
        email: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when field is updated
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await registerUser(
                formData.username,
                formData.email,
                formData.password
            );

            onUserCreated();
            handleClose();
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                if (error.message.toLowerCase().includes('username')) {
                    setFormErrors({
                        ...formErrors,
                        username: 'Username already exists'
                    });
                } else if (error.message.toLowerCase().includes('email')) {
                    setFormErrors({
                        ...formErrors,
                        email: 'An account with this email already exists'
                    });
                } else {
                    setError('Registration failed. Please try again.');
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            username: '',
            email: '',
            password: ''
        });
        setFormErrors({});
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30"
                onClick={handleClose}
            />
            <div className="fixed inset-0 flex items-center justify-center z-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Create New User
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center">
                            <FiAlertTriangle className="w-5 h-5 mr-2" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <InputField
                                id="username"
                                name="username"
                                label={<>Username <span className="text-red-500">*</span></>}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                error={formErrors.username}
                            />

                            <InputField
                                id="email"
                                name="email"
                                type="email"
                                label={<>Email <span className="text-red-500">*</span></>}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@example.com"
                                error={formErrors.email}
                            />

                            <InputField
                                id="password"
                                name="password"
                                type="password"
                                label={<>Password <span className="text-red-500">*</span></>}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                error={formErrors.password}
                            />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-md shadow-sm text-sm font-medium flex items-center transform hover:scale-102 transition-all cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FiUserPlus className="w-4 h-4 mr-2" />
                                        Create User
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminCreateUserModal;