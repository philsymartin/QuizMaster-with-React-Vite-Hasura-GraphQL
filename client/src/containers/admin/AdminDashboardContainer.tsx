import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_QUICK_STATS, GET_RECENT_ACTIVITY } from '@queries/adminDashboard';
import LoadingComponent from '@utils/LoadingSpinner';
import AdminDashboardPage from '@pages/admin/AdminDashboardPage';

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

export interface RecentActivityItem {
    id: number;
    action: string;
    user: string;
    time: string;
    type: 'quiz' | 'user' | 'result';
}

export interface DashboardData {
    userCount: number;
    quizCount: number;
    completionRate: number;
    avgScore: number;
    avgDuration: number;
    newUsersToday: number;
    newQuizzesToday: number;
    recentActivities: RecentActivityItem[];
}

const AdminDashboardContainer = () => {
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

    // Prepare the data to pass to the presentation component
    const dashboardData: DashboardData = {
        userCount,
        quizCount,
        completionRate,
        avgScore,
        avgDuration,
        newUsersToday,
        newQuizzesToday,
        recentActivities
    };

    return <AdminDashboardPage dashboardData={dashboardData} />;
};

export default AdminDashboardContainer;