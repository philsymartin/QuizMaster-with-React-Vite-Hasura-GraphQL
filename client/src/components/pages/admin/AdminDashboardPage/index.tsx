import React from 'react';
import { FiAward, FiBarChart2, FiBookOpen, FiClock, FiUsers } from 'react-icons/fi';
import { ActivityItemProps, AdminDashboardPageProps, QuickStatProps, StatCardProps } from '@pages/admin/AdminDashboardPage/types';
const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ dashboardData }) => {
    const {
        userCount,
        quizCount,
        completionRate,
        avgScore,
        avgDuration,
        newUsersToday,
        newQuizzesToday,
        recentActivities
    } = dashboardData;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={userCount.toLocaleString()}
                    icon={FiUsers}
                    description="Registered users"
                />
                <StatCard
                    title="Total Quizzes"
                    value={quizCount.toString()}
                    icon={FiBookOpen}
                    description="Available quizzes"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    icon={FiAward}
                    description="Average completion rate"
                />
                <StatCard
                    title="Avg. Score"
                    value={`${avgScore}%`}
                    icon={FiBarChart2}
                    description="Average quiz score"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Performance Overview
                    </h2>
                    <div className="space-y-4">
                        <QuickStat
                            icon={FiClock}
                            label="Average Quiz Duration"
                            value={`${avgDuration} minutes`}
                        />
                        <QuickStat
                            icon={FiUsers}
                            label="New Users Today"
                            value={newUsersToday.toString()}
                        />
                        <QuickStat
                            icon={FiBookOpen}
                            label="Quizzes Created Today"
                            value={newQuizzesToday.toString()}
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity) => (
                                <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    description
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
);

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => (
    <div className="flex items-center space-x-4">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
            {activity.type === 'quiz' && <FiBookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            {activity.type === 'user' && <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            {activity.type === 'result' && <FiAward className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                by {activity.user} • {activity.time}
            </p>
        </div>
    </div>
);

const QuickStat: React.FC<QuickStatProps> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
);

export default AdminDashboardPage;