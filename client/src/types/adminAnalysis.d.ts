export interface SentimentQueryResponse {
    quiz_feedback_aggregate: {
        aggregate: {
            count: number;
        };
    };
    sentiment_counts: {
        aggregate: {
            count: number;
        };
        nodes: {
            sentiment_label: string | null;
        }[];
    };
    quiz_feedback: {
        feedback_id: number;
        feedback_text: string;
        submitted_at: string;
        sentiment_label: string;
        sentiment_score: number;
        user: {
            username: string;
        };
        quiz: {
            title: string;
        };
    }[];
}

export interface RecentFeedbackItem {
    id: number;
    user: string;
    quiz: string;
    feedback: string;
    sentiment: string;
    date: string;
}
export interface SentimentDataItem {
    name: string;
    value: number;
    count: number;
    color: string;
}