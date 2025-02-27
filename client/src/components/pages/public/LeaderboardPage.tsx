import { useState, useMemo, useEffect } from 'react';
import { User as BaseUser, UserPerformance } from '../../../types/quiz';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import { fetchLeaderboardData } from '@services/adminServices';
import { motion } from 'framer-motion';
import LoadingComponent from '@utils/LoadingSpinner';
import { FiAward, FiBook, FiSearch, FiSliders, FiTarget } from 'react-icons/fi';

interface User extends BaseUser {
    user_id: number;
    username: string;
    email: string;
    created_at: string;
    role: string;
    last_active: string;
}

// Now extend the User interface with additional fields
interface ExtendedUser extends User {
    user_performances: UserPerformance[];
    quiz_attempts: QuizAttemptWithQuiz[];
}

interface QuizAttemptWithQuiz {
    quiz_id: number;
    score: number;
    quiz: {
        title: string;
    };
}

interface LeaderboardQueryResult {
    users: ExtendedUser[];
}

interface LeaderboardEntry {
    userId: number;
    username: string;
    totalQuizzes: number;
    averageScore: number;
    totalCorrectAnswers: number;
    topPerformance: string;
    completedQuizzes: string[];
    quizScores: {
        quizId: number;
        quizTitle: string;
        score: number;
    }[];
}

interface FilterState {
    search: string;
    quizId: string;
    scoreRange: {
        min: number;
        max: number;
    };
    minQuizzes: number;
}


const LeaderboardPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === 'admin';

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        quizId: 'all',
        scoreRange: { min: 0, max: 100 },
        minQuizzes: 1
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Custom hook for fetching data
    const useLeaderboardData = () => {
        const [data, setData] = useState<LeaderboardQueryResult | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<Error | null>(null);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const result = await fetchLeaderboardData(isAdmin);
                    setData(result);
                } catch (err) {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }, [isAdmin]);

        return { data, loading, error };
    };
    const { data, loading, error } = useLeaderboardData();
    const leaderboardData: LeaderboardEntry[] = useMemo(() => {
        if (!data?.users) return [];

        return data.users.map((user: ExtendedUser) => {
            const performances = user.user_performances || [];
            const attempts = user.quiz_attempts || [];

            const totalCorrectAnswers = performances.reduce(
                (sum, perf) => sum + perf.correct_answers,
                0
            );
            const bestAttempt = attempts.reduce(
                (best: QuizAttemptWithQuiz, current: QuizAttemptWithQuiz) =>
                    (current.score > best.score ? current : best),
                attempts[0]
            );
            const completedQuizzes = [...new Set(attempts.map(a => a.quiz.title))] as string[];
            const quizScores = attempts.map((attempt: QuizAttemptWithQuiz) => ({
                quizId: attempt.quiz_id,
                quizTitle: attempt.quiz.title,
                score: attempt.score
            }));
            const averageScore = performances.length
                ? performances.reduce((sum, perf) => sum + perf.average_score, 0) / performances.length
                : 0;
            return {
                userId: user.user_id,
                username: user.username,
                totalQuizzes: completedQuizzes.length,
                averageScore,
                totalCorrectAnswers,
                topPerformance: bestAttempt
                    ? `${bestAttempt.quiz.title} (${bestAttempt.score}%)`
                    : 'No attempts yet',
                completedQuizzes,
                quizScores
            };
        });
    }, [data]);

    // Get unique quizzes for filter options
    const quizOptions = useMemo(() => {
        const quizzes = new Set<string>();
        leaderboardData.forEach(user => {
            user.quizScores.forEach(score => {
                quizzes.add(score.quizTitle);
            });
        });
        return Array.from(quizzes);
    }, [leaderboardData]);

    // Filter leaderboard data
    const filteredLeaderboard = useMemo(() => {
        return leaderboardData
            .filter(user => {
                const matchesSearch = user.username.toLowerCase().includes(filters.search.toLowerCase());
                const matchesQuiz = filters.quizId === 'all' || user.quizScores.some(
                    score => score.quizTitle === filters.quizId
                );
                const matchesScoreRange = user.averageScore >= filters.scoreRange.min &&
                    user.averageScore <= filters.scoreRange.max;
                const matchesMinQuizzes = user.totalQuizzes >= filters.minQuizzes;

                return matchesSearch && matchesQuiz && matchesScoreRange && matchesMinQuizzes;
            })
            .sort((a, b) => {
                if (filters.quizId === 'all') {
                    return b.averageScore - a.averageScore;
                }
                const aScore = a.quizScores.find(s => s.quizTitle === filters.quizId)?.score || 0;
                const bScore = b.quizScores.find(s => s.quizTitle === filters.quizId)?.score || 0;
                return bScore - aScore;
            });
    }, [leaderboardData, filters]);

    if (loading) {
        return <LoadingComponent />
    }
    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Error loading leaderboard data
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
            </div>
        );
    }
    if (!data?.users || data.users.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                    No users have completed any quizzes yet.
                </p>
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
                    {/* Header Section */}
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                        dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-8">
                        Quiz Masters Leaderboard
                    </h1>

                    {/* Search and Filter Section */}
                    <div className="mb-8 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 text-gray-700 dark:text-gray-200 
                                        bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                        rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                                        focus:border-transparent"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 
                                    bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 
                                    dark:hover:bg-gray-600 transition-colors"
                            >
                                <FiSliders className="w-5 h-5 mr-2" />
                                Filters
                            </button>
                        </div>

                        {/* Expandable Filter Panel */}
                        {isFilterOpen && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Quiz Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Quiz
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 
                                                bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                                rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            value={filters.quizId}
                                            onChange={(e) => setFilters(prev => ({ ...prev, quizId: e.target.value }))}
                                        >
                                            <option value="all">All Quizzes</option>
                                            {quizOptions.map(quiz => (
                                                <option key={quiz} value={quiz}>{quiz}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Score Range Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Score Range (%)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={filters.scoreRange.min}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    scoreRange: { ...prev.scoreRange, min: Number(e.target.value) }
                                                }))}
                                                className="w-24 px-2 py-2 text-gray-700 dark:text-gray-200 
                                                    bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                                    rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">to</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={filters.scoreRange.max}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    scoreRange: { ...prev.scoreRange, max: Number(e.target.value) }
                                                }))}
                                                className="w-24 px-2 py-2 text-gray-700 dark:text-gray-200 
                                                    bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                                    rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Minimum Quizzes Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Minimum Quizzes Completed
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={filters.minQuizzes}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                minQuizzes: Number(e.target.value)
                                            }))}
                                            className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 
                                                bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                                rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-6">
                        {filteredLeaderboard.map((user, index) => (
                            <div
                                key={user.userId}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 transition-all hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-3xl">
                                            {index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : "⭐"}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {user.username}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Rank #{index + 1}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                                            dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                                            {filters.quizId === 'all'
                                                ? `${user.averageScore.toFixed(1)}%`
                                                : `${user.quizScores.find(s => s.quizTitle === filters.quizId)?.score.toFixed(1)}%`
                                            }
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {filters.quizId === 'all' ? 'Average Score' : 'Quiz Score'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <StatItem
                                        icon={<FiAward className="w-4 h-4" />}
                                        label="Best Performance"
                                        value={user.topPerformance}
                                    />
                                    <StatItem
                                        icon={<FiTarget className="w-4 h-4" />}
                                        label="Total Correct Answers"
                                        value={user.totalCorrectAnswers.toString()}
                                    />
                                    <StatItem
                                        icon={<FiBook className="w-4 h-4" />}
                                        label="Quizzes Completed"
                                        value={user.totalQuizzes.toString()}
                                    />
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Completed Quizzes:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.completedQuizzes.map((quiz) => (
                                            <span
                                                key={quiz}
                                                className="px-3 py-1 text-sm rounded-full bg-purple-100 
                                                    text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                            >
                                                {quiz}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-2">
        <div className="text-purple-600 dark:text-purple-400">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

export default LeaderboardPage;