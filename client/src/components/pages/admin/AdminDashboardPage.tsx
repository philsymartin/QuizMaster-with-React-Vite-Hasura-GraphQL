
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_QUICK_STATS, GET_RECENT_ACTIVITY } from '@queries/adminDashboard'
import LoadingComponent from '@utils/LoadingSpinner';
import { FiAward, FiBarChart2, FiBookOpen, FiClock, FiUsers } from 'react-icons/fi';

interface DashboardStatsData {
    users_aggregate: {
        aggregate: {
            count: number;
        }
    }
    quizzes_aggregate: {
        aggregate: {
            count: number;
        }
    }
    quiz_attempts_aggregate: {
        aggregate: {
            count: number;
            avg: {
                score: number;
            }
        }
    }
    completed_attempts: {
        aggregate: {
            count: number;
        }
    }
    total_attempts: {
        aggregate: {
            count: number;
        }
    }
}

interface RecentActivityData {
    quiz_attempts: Array<{
        attempt_id: number;
        user: {
            username: string;
        }
        quiz: {
            title: string;
        }
        score: number;
        end_time: string;
    }>;
    users: Array<{
        user_id: number;
        username: string;
        created_at: string;
    }>;
    quizzes: Array<{
        quiz_id: number;
        title: string;
        created_at: string;
    }>;
}

interface QuickStatsData {
    quiz_attempts_with_duration: Array<{
        start_time: string;
        end_time: string;
    }>;
    new_users_today: {
        aggregate: {
            count: number;
        }
    }
    new_quizzes_today: {
        aggregate: {
            count: number;
        }
    }
}
interface RecentActivityItem {
    id: number;
    action: string;
    user: string;
    time: string;
    type: 'quiz' | 'user' | 'result';
}

const AdminDashboardPage = () => {
    // Set up yesterday date for the query variable
    const yesterday = React.useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString();
    }, []);

    const { loading: statsLoading, error: statsError, data: statsData } = useQuery<DashboardStatsData>(GET_DASHBOARD_STATS);
    const { loading: activityLoading, error: activityError, data: activityData } = useQuery<RecentActivityData>(GET_RECENT_ACTIVITY);
    const { loading: quickStatsLoading, error: quickStatsError, data: quickStatsData } = useQuery<QuickStatsData>(
        GET_QUICK_STATS,
        { variables: { yesterday } }
    );
    const formatTime = (date: Date): string => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 24 * 60) {
            return `${Math.floor(diffInMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(diffInMinutes / (24 * 60))} days ago`;
        }
    };
    const timeToMinutes = (timeString: string): number => {
        if (timeString.includes('minutes')) {
            return parseInt(timeString.split(' ')[0]);
        } else if (timeString.includes('hours')) {
            return parseInt(timeString.split(' ')[0]) * 60;
        } else {
            return parseInt(timeString.split(' ')[0]) * 60 * 24;
        }
    };
    const recentActivities: RecentActivityItem[] = React.useMemo(() => {
        if (activityLoading || activityError || !activityData) return [];

        const activities: RecentActivityItem[] = [];
        activityData.quiz_attempts.forEach(attempt => {
            activities.push({
                id: attempt.attempt_id,
                action: `Completed Quiz: ${attempt.quiz.title} with Score: ${attempt.score}%`,
                user: attempt.user.username,
                time: formatTime(new Date(attempt.end_time)),
                type: 'result'
            });
        });
        activityData.users.forEach(user => {
            activities.push({
                id: user.user_id,
                action: "New User Registration",
                user: user.username,
                time: formatTime(new Date(user.created_at)),
                type: 'user'
            });
        });
        activityData.quizzes.forEach(quiz => {
            activities.push({
                id: quiz.quiz_id,
                action: `New Quiz Created: ${quiz.title}`,
                user: "System",
                time: formatTime(new Date(quiz.created_at)),
                type: 'quiz'
            });
        });
        return activities.sort((a, b) => {
            const timeA = timeToMinutes(a.time);
            const timeB = timeToMinutes(b.time);
            return timeA - timeB;
        }).slice(0, 5);
    }, [activityData, activityLoading, activityError]);

    // Calculate stats for stat cards
    const userCount = statsData?.users_aggregate.aggregate.count || 0;
    const quizCount = statsData?.quizzes_aggregate.aggregate.count || 0;
    const completionRate = statsData?.completed_attempts && statsData?.total_attempts ?
        Math.round((statsData.completed_attempts.aggregate.count / statsData.total_attempts.aggregate.count) * 100) : 0;
    const avgScore = statsData?.quiz_attempts_aggregate.aggregate.avg.score ?
        Math.round(statsData.quiz_attempts_aggregate.aggregate.avg.score) : 0;

    const avgDuration = React.useMemo(() => {
        if (!quickStatsData?.quiz_attempts_with_duration || quickStatsData.quiz_attempts_with_duration.length === 0) {
            return 0;
        }

        const durations = quickStatsData.quiz_attempts_with_duration.map(attempt => {
            const start = new Date(attempt.start_time);
            const end = new Date(attempt.end_time);
            return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
        });

        const sum = durations.reduce((acc, duration) => acc + duration, 0);
        return Math.round(sum / durations.length);
    }, [quickStatsData]);

    const newUsersToday = quickStatsData?.new_users_today.aggregate.count || 0;
    const newQuizzesToday = quickStatsData?.new_quizzes_today.aggregate.count || 0;

    if (statsLoading || activityLoading || quickStatsLoading) {
        return <LoadingComponent />;
    }

    if (statsError || activityError || quickStatsError) {
        return <div className="text-center p-8 text-red-500">Error loading dashboard data. Please try again.</div>;
    }

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

interface StatCardProps {
    title: string;
    value: string;
    icon: React.FC<any>;
    description: string;
}

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

interface ActivityItemProps {
    activity: RecentActivityItem;
}

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

interface QuickStatProps {
    icon: React.FC<any>;
    label: string;
    value: string;
}

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