import React from 'react';
import {
    Users,
    BookOpen,
    Award,
    BarChart2,
    Menu,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2
} from 'lucide-react';

interface RecentActivityItem {
    id: number;
    action: string;
    user: string;
    time: string;
    type: 'quiz' | 'user' | 'result';
}

const AdminDashboardPage = () => {
    // Mock recent activity data
    const recentActivities: RecentActivityItem[] = [
        {
            id: 1,
            action: "Completed Quiz: JavaScript Basics",
            user: "John Doe",
            time: "5 minutes ago",
            type: "quiz"
        },
        {
            id: 2,
            action: "New User Registration",
            user: "Sarah Smith",
            time: "10 minutes ago",
            type: "user"
        },
        {
            id: 3,
            action: "Quiz Score: 95%",
            user: "Mike Johnson",
            time: "15 minutes ago",
            type: "result"
        },
        {
            id: 4,
            action: "Created New Quiz: Python Advanced",
            user: "Emily Brown",
            time: "30 minutes ago",
            type: "quiz"
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value="1,234"
                    icon={Users}
                    trend="+12%"
                    trendUp={true}
                    description="Active users this month"
                />
                <StatCard
                    title="Active Quizzes"
                    value="45"
                    icon={BookOpen}
                    trend="+5%"
                    trendUp={true}
                    description="Published quizzes"
                />
                <StatCard
                    title="Completion Rate"
                    value="78%"
                    icon={Award}
                    trend="-2%"
                    trendUp={false}
                    description="Average completion rate"
                />
                <StatCard
                    title="Avg. Score"
                    value="85%"
                    icon={BarChart2}
                    trend="+3%"
                    trendUp={true}
                    description="This week's average"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 
                                       dark:hover:text-purple-300 font-medium text-sm">
                            View All Activity
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Performance Overview
                    </h2>
                    <div className="space-y-4">
                        <QuickStat
                            icon={Clock}
                            label="Average Quiz Duration"
                            value="15 minutes"
                        />
                        <QuickStat
                            icon={CheckCircle2}
                            label="Quiz Success Rate"
                            value="92%"
                        />
                        <QuickStat
                            icon={Users}
                            label="New Users Today"
                            value="48"
                        />
                        <QuickStat
                            icon={BookOpen}
                            label="Quizzes Created Today"
                            value="12"
                        />
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
    trend: string;
    trendUp: boolean;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    description
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center space-x-1">
                {trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {trend}
                </span>
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
            {activity.type === 'quiz' && <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            {activity.type === 'user' && <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            {activity.type === 'result' && <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
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