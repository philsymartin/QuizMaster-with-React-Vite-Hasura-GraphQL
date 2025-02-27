export interface SentimentAnalysisRequest {
    text: string;
}
export interface SentimentResponse {
    label: string;
    score: number;
}
export interface FeedbackItem {
    feedback_id: number;
    text: string;
}