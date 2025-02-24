export interface SentimentAnalysisRequest {
    text: string;
}

export interface FeedbackAnalyticsRequest {
    quiz_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface SentimentResponse {
    label: string;
    score: number;
}

export interface FeedbackAnalytics {
    summary: {
        total_feedback: number;
        positive_feedback: number;
        negative_feedback: number;
        average_sentiment_score: number;
    };
    detailed_analysis: Array<{
        feedback_id: number;
        feedback_text: string;
        sentiment: SentimentResponse;
        created_at: string;
    }>;
}
export interface FeedbackItem {
    text: string;
    sentiment?: {
        label: string;
        score: number;
    };
}
