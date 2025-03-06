export interface User {
    user_id: number;
    username: string;
    email: string;
    created_at: string;
    role: string;
    last_active: string;
}

export interface UserPerformance {
    quiz_id: number;
    total_attempts: number;
    correct_answers: number;
    average_score: number;
    quiz?: {
        title: string;
        total_questions: number;
    };
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
    lastActive: string;
    quizScores: {
        quizId: number;
        quizTitle: string;
        score: number;
        bestScore: number;
        attempts: number;
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
    difficulty?: string;
    sortBy: 'score' | 'quizzes';
}