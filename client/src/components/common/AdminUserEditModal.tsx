import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '@mutations/usersMutate';
import { FiAlertTriangle, FiSave, FiX } from 'react-icons/fi';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'deleted' | 'banned';
    created_at: string;
    last_active: string;
}

interface AdminUserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated: () => void;
}

const AdminUserEditModal = ({ isOpen, onClose, user, onUserUpdated }: AdminUserEditModalProps) => {
    const [formData, setFormData] = useState<{
        username: string;
        email: string;
        role: 'user' | 'admin';
        status: 'active' | 'inactive' | 'deleted' | 'banned';
    }>({
        username: '',
        email: '',
        role: 'user',
        status: 'inactive',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [updateUser, { loading, error }] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            onUserUpdated();
            onClose();
        },
        onError: (error) => {
            console.error('GraphQL Error:', error);
            // Check for common Hasura errors like unique constraint violations
            if (error.message.includes('unique constraint')) {
                if (error.message.includes('username')) {
                    setFormErrors(prev => ({ ...prev, username: 'Username already exists' }));
                }
                if (error.message.includes('email')) {
                    setFormErrors(prev => ({ ...prev, email: 'Email already exists' }));
                }
            }
        }
    });

    // Reset form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
            });
            setFormErrors({});
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        return errors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (!user) return;

        updateUser({
            variables: {
                user_id: user.id,
                username: formData.username,
                email: formData.email,
                role: formData.role,
                status: formData.status
            }
        });
    };

    if (!isOpen || !user) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center z-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Edit User: {user.username}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {error && !Object.keys(formErrors).length && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center">
                            <FiAlertTriangle className="w-5 h-5 mr-2" />
                            <p>Error updating user. Please try again.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border ${formErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {formErrors.username && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </div>

                            <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                                <p>User ID: {user.id}</p>
                                <p>Created: {new Date(user.created_at).toLocaleString()}</p>
                                <p>Last Active: {new Date(user.last_active).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700 flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-4 h-4 mr-2" />
                                        Save Changes
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

export default AdminUserEditModal;