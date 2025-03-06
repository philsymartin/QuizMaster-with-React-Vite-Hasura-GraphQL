import { motion } from 'framer-motion';
import { FiAward, FiBook, FiSearch, FiSliders } from 'react-icons/fi';
import LoadingComponent from '@utils/LoadingSpinner';
import { LeaderboardEntry, FilterState } from 'src/types/leaderboard';
import { StatItem } from '@components/StatItem';
import { formatDate } from '@utils/Helpers';

interface LeaderboardPageProps {
    loading: boolean;
    error: Error | null;
    filteredLeaderboard: LeaderboardEntry[];
    quizOptions: string[];
    filters: FilterState;
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
    updateFilters: (newFilters: Partial<FilterState>) => void;
}

const LeaderboardPage = ({
    loading,
    error,
    filteredLeaderboard,
    quizOptions,
    filters,
    isFilterOpen,
    setIsFilterOpen,
    updateFilters
}: LeaderboardPageProps) => {

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
        >
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                           dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-4 md:mb-0">
                            Quiz Masters Leaderboard
                        </h1>

                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredLeaderboard.length} player{filteredLeaderboard.length !== 1 ? 's' : ''}
                            </span>

                            <select
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                                    rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={filters.sortBy}
                                onChange={(e) => updateFilters({ sortBy: e.target.value as "quizzes" | "score" })}
                            >
                                <option value="score">Sort by Score</option>
                                <option value="quizzes">Sort by Most Quizzes</option>
                            </select>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="mb-8 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search players..."
                                    className="w-full pl-10 pr-4 py-2 text-gray-700 dark:text-gray-200 
                                        bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                        rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                                        focus:border-transparent"
                                    value={filters.search}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 
                                    bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 
                                    dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                <FiSliders className="w-5 h-5 mr-2" />
                                Filters
                            </button>
                        </div>

                        {/* Expandable Filter Panel */}
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                            onChange={(e) => updateFilters({ quizId: e.target.value })}
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
                                                min="40"
                                                max="100"
                                                value={filters.scoreRange.min}
                                                onChange={(e) => updateFilters({
                                                    scoreRange: { ...filters.scoreRange, min: Number(e.target.value) }
                                                })}
                                                className="w-24 px-2 py-2 text-gray-700 dark:text-gray-200 
                                                    bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                                    rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">to</span>
                                            <input
                                                type="number"
                                                min="40"
                                                max="100"
                                                value={filters.scoreRange.max}
                                                onChange={(e) => updateFilters({
                                                    scoreRange: { ...filters.scoreRange, max: Number(e.target.value) }
                                                })}
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
                                            min="1"
                                            value={filters.minQuizzes}
                                            onChange={(e) => updateFilters({
                                                minQuizzes: Number(e.target.value)
                                            })}
                                            className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 
                                                bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                                rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {filteredLeaderboard.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                No results found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Try adjusting your filters or search criteria.
                            </p>
                        </div>
                    ) : (
                        /* Leaderboard List */
                        <div className="space-y-6">
                            {filteredLeaderboard.map((user, index) => (
                                <motion.div
                                    key={user.userId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 transition-all 
                                        hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {/* User Header with Rank and Score */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center 
                                                text-lg font-bold rounded-full bg-gradient-to-r from-purple-600 to-blue-500
                                                text-white">
                                                {index === 0 ? "👑" : `#${index + 1}`}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {user.username}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Last active: {formatDate(user.lastActive)}
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

                                    {/* User Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <StatItem
                                            icon={<FiAward className="w-4 h-4" />}
                                            label="Best Performance"
                                            value={user.topPerformance}
                                        />
                                        <StatItem
                                            icon={<FiBook className="w-4 h-4" />}
                                            label="Quizzes Completed"
                                            value={user.totalQuizzes.toString()}
                                        />
                                    </div>

                                    {/* Completed Quizzes */}
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Completed Quizzes:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.completedQuizzes.length === 0 ? (
                                                <span className="text-gray-500 italic">No quizzes completed yet</span>
                                            ) : (
                                                user.completedQuizzes.map((quiz) => (
                                                    <span
                                                        key={quiz}
                                                        className={`px-3 py-1 text-sm rounded-full
                                                            ${filters.quizId === quiz
                                                                ? 'bg-purple-500 text-white dark:bg-purple-600'
                                                                : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}
                                                        onClick={() => filters.quizId !== quiz && updateFilters({ quizId: quiz })}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {quiz}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};


export default LeaderboardPage;