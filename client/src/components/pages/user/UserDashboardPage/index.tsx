import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '@redux/auth/authSlice';
import { GET_USER_DASHBOARD_DATA } from '@queries/users';
import type { User, QuizAttempt, QuizFeedback, UserPerformance } from 'src/types/quiz';
import LoadingComponent from '@utils/LoadingSpinner';
import { FiAward, FiClock, FiLogOut, FiStar, FiTarget, FiUser } from 'react-icons/fi';

interface UserDashboardData extends User {
    quiz_attempts: (QuizAttempt & { quiz: { title: string; difficulty: string } })[];
    quiz_feedbacks: (QuizFeedback & { quiz: { title: string } })[];
    user_performances: (UserPerformance & { quiz: { title: string } })[];
}

const UserDashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, data } = useQuery<{ users: UserDashboardData[] }>(
        GET_USER_DASHBOARD_DATA,
        {
            fetchPolicy: 'cache-and-network',
        }
    );

    const handleLogout = async () => {
        try {
            dispatch(logoutRequest());
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            navigate('/login');
        }
    };

    if (loading) return <LoadingComponent />
    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Error loading dashboard data
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {error.message}
                </p>
            </div>
        );
    }

    // Get the current user's data
    const userData = data?.users[0];
    if (!userData) return null;

    // Calculate statistics
    const totalAttempts = userData.quiz_attempts.length;
    const completedAttempts = userData.quiz_attempts.filter(attempt => attempt.end_time);
    const avgScore = completedAttempts.length > 0
        ? completedAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / completedAttempts.length
        : 0;

    // Sort attempts and feedbacks by date (create new arrays to avoid mutation)
    const recentAttempts = [...userData.quiz_attempts]
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, 3);

    const recentFeedbacks = [...userData.quiz_feedbacks]
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        .slice(0, 3);

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
                            <FiLogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>

                    {/* User info card */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                                <FiUser className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Welcome, {userData.username}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Email: {userData.email}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Status: {userData.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            icon={<FiTarget className="w-5 h-5" />}
                            title="Average Score"
                            value={`${avgScore.toFixed(1)}%`}
                        />
                        <StatCard
                            icon={<FiClock className="w-5 h-5" />}
                            title="Total Attempts"
                            value={totalAttempts.toString()}
                        />
                        <StatCard
                            icon={<FiAward className="w-5 h-5" />}
                            title="Member Since"
                            value={new Date(userData.created_at).toLocaleDateString("en-IN")}
                        />
                    </div>

                    {/* Recent Attempts */}
                    {recentAttempts.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Quiz Attempts</h3>
                            <div className="space-y-4">
                                {recentAttempts.map((attempt) => (
                                    <div key={attempt.attempt_id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{attempt.quiz.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(attempt.start_time).toLocaleDateString("en-IN")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${attempt.quiz.difficulty === 'Hard'
                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {attempt.quiz.difficulty}
                                            </span>
                                            <span className="font-semibold">{attempt.score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Feedback */}
                    {recentFeedbacks.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
                            <div className="space-y-4">
                                {recentFeedbacks.map((feedback) => (
                                    <div key={feedback.feedback_id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{feedback.quiz.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(feedback.submitted_at).toLocaleDateString("en-IN")}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                                            <span>{feedback.rating}/10</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="text-purple-600 dark:text-purple-400">
                {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

export default UserDashboardPage;
