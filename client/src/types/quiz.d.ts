export interface Quiz {
    quiz_id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    time_limit_minutes: number;
    total_questions: number;
    participants_count: number;
    average_rating: number;
    topics?: QuizTopic[];
}

export interface Question {
    question_id: number;
    quiz_id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false';
    created_at: string;
    question_options?: QuestionOption[];
}

export interface Option {
    option_id: number;
    option_text: string;
}

export interface QuestionOption {
    question_id: number;
    option_id: number;
    is_correct: boolean;
    option: Option;
}

export interface Topic {
    topic_id: number;
    topic_name: string;
}

export interface QuizTopic {
    quiz_id: number;
    topic_id: number;
    topic: Topic;
}

export interface QuizAttempt {
    attempt_id: number;
    user_id: number;
    quiz_id: number;
    start_time: string;
    end_time: string | null;
    score: number;
}

export interface Answer {
    answer_id: number;
    attempt_id: number;
    question_id: number;
    option_id: number | null;
    answer_text: string | null;
}

export interface QuizFeedback {
    feedback_id: number;
    user_id: number;
    quiz_id: number;
    feedback_text: string;
    rating: number;
    submitted_at: string;
    sentiment_label: string | null;
    sentiment_score: number | null;
    analyzed_at: string | null;
}

export interface User {
    user_id: number;
    username: string;
    email: string;
    created_at: string;
    role: string;
    status: 'active' | 'inactive' | 'deleted' | 'banned';
    last_active: string;
}

export interface UserPerformance {
    performance_id: number;
    user_id: number;
    quiz_id: number;
    total_attempts: number;
    correct_answers: number;
    average_score: number;
}

// for insertion of new question 
export interface NewQuestionOption {
    option_text: string;
    is_correct: boolean;
}

export interface NewQuestion {
    quiz_id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false';
    options: NewQuestionOption[];
}
export interface EditQuestionPayload extends NewQuestion {
    question_id: number;
}
// Keyword related interfaces
export interface FeedbackKeyword {
    keyword_id: number;
    keyword: string;
    created_at: string;
}
export interface FeedbackKeywordMapping {
    feedback_id: number;
    keyword_id: number;
    sentiment_context: number;
}
export interface KeywordAnalytics {
    keyword_id: number;
    quiz_id: number;
    occurrence_count: number;
    average_sentiment: number;
    last_updated: string;
}
// Enhanced feedback interface with sentiment analysis
export interface EnhancedQuizFeedback extends QuizFeedback {
    sentiment_label: string | null;
    sentiment_score: number | null;
    analyzed_at: string | null;
    keywords?: FeedbackKeyword[];
}