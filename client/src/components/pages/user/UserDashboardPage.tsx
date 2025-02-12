import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store'; // Adjust the import according to your project structure
import { logoutRequest } from '../../../redux/auth/authSlice'; // Adjust import as well


const UserDashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, loading } = useSelector((state: RootState) => state.auth);

    // Handle logout
    const handleLogout = async () => {
        try {
            dispatch(logoutRequest());  // Trigger logout action
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            navigate('/login');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                    {/* Header with logout button */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                          dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 
                            dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>

                    {/* User info card */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Welcome, {user?.username}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Email: {user?.email}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {user?.role === 'admin' ? 'Administrator Account' : 'User Account'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Quick info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Last Login" value='Just Now' />
                        <StatCard title="Account Status" value="Active" />
                        <StatCard title="Member Since" value='January 2024' />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Extracted stat component for cleaner code
const StatCard = ({ title, value }: { title: string; value: string }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

export default UserDashboardPage;
