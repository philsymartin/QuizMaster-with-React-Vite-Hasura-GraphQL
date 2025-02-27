interface RetryConfig {
    maxRetries?: number;
    delayMs?: number;
}
export interface SentimentAnalysis {
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
        sentiment: SentimentAnalysis;
        created_at: string;
    }>;
}
export class SentimentAnalysisError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly isRetryable: boolean = false
    ) {
        super(message);
        this.name = 'SentimentAnalysisError';
    }
}
export interface FeedbackItem {
    feedback_id: number;
    text: string;
}
export interface KeywordAnalysisResponse {
    totalFeedback: number;
    feedbackKeywords: Array<{
        feedback_id: number;
        keywords: string[];
    }>;
}
export class KeywordAnalysisError extends Error {
    constructor(
        message: string,
        public readonly status?: number
    ) {
        super(message);
        this.name = 'KeywordAnalysisError';
    }
}

interface RetryConfig {
    maxRetries?: number;
    delayMs?: number;
}
const API_URL = import.meta.env.VITE_API_URL;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const DEFAULT_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 4000;

export const analyzeSentiment = async (
    text: string,
    { maxRetries = DEFAULT_RETRY_COUNT, delayMs = RETRY_DELAY_MS }: RetryConfig = {}
): Promise<SentimentAnalysis> => {
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            if (attempt > 0) {
                console.log(`Retry attempt ${attempt} of ${maxRetries}`);
                await delay(delayMs);
            }
            const response = await fetch(`${API_URL}/analysis/sentiment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            if (response.status === 503 || data.message?.includes('model is loading')) {
                attempt++;
                if (attempt > maxRetries) {
                    throw new SentimentAnalysisError(
                        'Model failed to load after multiple retries',
                        response.status,
                        false
                    );
                }
                console.log('Model is loading, retrying...');
                continue;
            }

            if (!response.ok) {
                throw new SentimentAnalysisError(
                    data.message || 'Failed to analyze sentiment',
                    response.status,
                    false
                );
            }

            return data;
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            attempt++;
        }
    }

    throw new SentimentAnalysisError('Maximum retries exceeded', undefined, false);
};

export const analyzeKeywords = async (
    feedbackItems: Array<{
        feedback_id: number;
        text: string;
    }>,
    { maxRetries = DEFAULT_RETRY_COUNT, delayMs = RETRY_DELAY_MS }: RetryConfig = {}
): Promise<KeywordAnalysisResponse> => {
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            if (attempt > 0) {
                console.log(`Retry attempt ${attempt} of ${maxRetries} for keyword analysis`);
                await delay(delayMs);
            }
            const response = await fetch(`${API_URL}/analysis/keywords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ feedbackItems }),
            });
            const data = await response.json();
            // Handle model loading case (503 status)
            if (response.status === 503 || data.error?.includes('model is currently loading')) {
                attempt++;
                if (attempt > maxRetries) {
                    throw new KeywordAnalysisError(
                        'Keyword extraction model failed to load after multiple retries',
                        response.status
                    );
                }
                console.log('Keyword model is loading, retrying in', delayMs, 'ms...');
                continue;
            }
            if (!response.ok) {
                throw new KeywordAnalysisError(
                    data.message || 'Failed to analyze keywords',
                    response.status
                );
            }
            return data;
        } catch (error) {
            if (error instanceof KeywordAnalysisError) {
                if (attempt >= maxRetries) {
                    throw error;
                }
            } else {
                console.error('Unexpected error during keyword analysis:', error);
                throw new KeywordAnalysisError('Failed to analyze keywords');
            }
            attempt++;
        }
    }
    throw new KeywordAnalysisError('Maximum retries exceeded for keyword analysis');
};