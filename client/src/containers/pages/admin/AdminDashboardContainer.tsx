import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_QUICK_STATS, GET_RECENT_ACTIVITY } from '@queries/adminDashboard';
import LoadingComponent from '@utils/LoadingSpinner';
import AdminDashboardPage from '@pages/admin/AdminDashboardPage';
import { DashboardData, DashboardStatsData, QuickStatsData, RecentActivityData, RecentActivityItem } from '@pages/admin/AdminDashboardPage/types';
import { getTimeDifferenceFromNow, timeToMinutes, yesterdayForQuery } from '@utils/Helpers';


const AdminDashboardContainer = () => {
    const { loading: statsLoading, error: statsError, data: statsData } = useQuery<DashboardStatsData>(GET_DASHBOARD_STATS);
    const { loading: activityLoading, error: activityError, data: activityData } = useQuery<RecentActivityData>(GET_RECENT_ACTIVITY);
    const { loading: quickStatsLoading, error: quickStatsError, data: quickStatsData } = useQuery<QuickStatsData>(
        GET_QUICK_STATS,
        { variables: { yesterday: yesterdayForQuery() } }
    );

    const recentActivities: RecentActivityItem[] = React.useMemo(() => {
        if (activityLoading || activityError || !activityData) return [];

        const activities: RecentActivityItem[] = [];
        activityData.quiz_attempts.forEach(attempt => {
            activities.push({
                id: attempt.attempt_id,
                action: `Completed Quiz: ${attempt.quiz.title} with Score: ${attempt.score}%`,
                user: attempt.user.username,
                time: getTimeDifferenceFromNow(new Date(attempt.end_time)),
                type: 'result'
            });
        });
        activityData.users.forEach(user => {
            activities.push({
                id: user.user_id,
                action: "New User Registration",
                user: user.username,
                time: getTimeDifferenceFromNow(new Date(user.created_at)),
                type: 'user'
            });
        });
        activityData.quizzes.forEach(quiz => {
            activities.push({
                id: quiz.quiz_id,
                action: `New Quiz Created: ${quiz.title}`,
                user: "System",
                time: getTimeDifferenceFromNow(new Date(quiz.created_at)),
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