export interface User {
    user_id: number;
    username: string;
    email: string;
    created_at: string;
    role: string;
    last_active: string;
}

export interface UserPerformance {
    correct_answers: number;
    average_score: number;
}
export interface QuizAttemptWithQuiz {
    quiz_id: number;
    score: number;
    quiz: {
        title: string;
    };
}

export interface ExtendedUser extends User {
    user_performances: UserPerformance[];
    quiz_attempts: QuizAttemptWithQuiz[];
}

export interface LeaderboardQueryResult {
    users: ExtendedUser[];
}
export interface LeaderboardEntry {
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
export interface FilterState {
    search: string;
    quizId: string;
    scoreRange: {
        min: number;
        max: number;
    };
    minQuizzes: number;
}