export interface DashboardStatsData {
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

export interface RecentActivityData {
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

export interface QuickStatsData {
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
//  types needed for component 
export interface AdminDashboardPageProps {
    dashboardData: DashboardData;
}
export interface StatCardProps {
    title: string;
    value: string;
    icon: React.FC<any>;
    description: string;
}
export interface ActivityItemProps {
    activity: RecentActivityItem;
}
export interface QuickStatProps {
    icon: React.FC<any>;
    label: string;
    value: string;
}