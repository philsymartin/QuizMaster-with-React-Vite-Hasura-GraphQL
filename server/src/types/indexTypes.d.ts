export interface User {
    user_id: number;
    email: string;
    password: string;
    role: string;
    username?: string;
}

export interface HasuraResponse<T> {
    data?: T;
    errors?: Array<{ message: string }>;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface UserResponse {
    users: User[];
}

export interface HasuraClaims {
    "x-hasura-allowed-roles": any[];
    "x-hasura-default-role": any;
    "x-hasura-user-id": any;
    "x-hasura-admin-secret"?: string;
}

export type TimeString = `${number}${'d' | 'h' | 'm' | 's' | 'ms'}`;

export interface Quiz {
    title: string;
    total_questions: number;
}

export interface UserPerformance {
    quiz_id: number;
    total_attempts: number;
    correct_answers: number;
    average_score: number;
    quiz: Quiz;
}

export interface QuizAttempt {
    quiz_id: number;
    score: number;
    quiz: {
        title: string;
    };
}

export interface LeaderboardUser {
    user_id: number;
    username: string;
    user_performances: UserPerformance[];
    quiz_attempts: QuizAttempt[];
}

export interface LeaderboardQueryResult {
    users: LeaderboardUser[];
}
