import React from 'react';

import { motion } from 'framer-motion';

const LeaderboardPage = () => {
    const leaderboard = [
        { rank: 1, username: 'JohnDoe', score: 90, avatar: '👑' },
        { rank: 2, username: 'JaneSmith', score: 85, avatar: '🥈' },
        { rank: 3, username: 'BobJohnson', score: 82, avatar: '🥉' },
        { rank: 4, username: 'AliceWonder', score: 78, avatar: '⭐' },
        { rank: 5, username: 'CharlieBrown', score: 75, avatar: '⭐' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                Global Leaderboard
            </h1>
            <div className="space-y-4">
                {leaderboard.map((user, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        key={user.rank}
                        className="flex items-center justify-between p-6 rounded-xl bg-white dark:bg-gray-800 
                                 shadow-md hover:shadow-lg transition-all transform hover:scale-102
                                 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center space-x-4">
                            <span className="text-2xl">{user.avatar}</span>
                            <div>
                                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {user.username}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Rank #{user.rank}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                                         dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                                {user.score}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">points</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default LeaderboardPage;
