import React, { useState } from 'react';
import { KeywordAnalysis, analyzeKeywords } from '../../services/sentiment';
import KeywordCloud from './KeywordCloud';

const FeedbackAnalysis: React.FC = () => {
    const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeAllFeedback = async () => {
        try {
            setLoading(true);
            setError(null);
            const feedbackItems = [
                {
                    text: "Great product, easy to use",
                    sentiment: { label: "POSITIVE", score: 0.9 }
                },
                {
                    text: "This learning platform has an excellent user interface. The course materials are comprehensive and well-organized. I particularly enjoyed the interactive quizzes and real-time feedback system.",
                    sentiment: { label: "POSITIVE", score: 0.95 }
                }

            ];

            const analysis = await analyzeKeywords(feedbackItems);
            setKeywordAnalysis(analysis);
        } catch (error) {
            console.error('Error analyzing keywords:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={analyzeAllFeedback}
                disabled={loading}
                className={`px-4 py-2 rounded ${loading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
            >
                {loading ? 'Analyzing...' : 'Analyze Keywords'}
            </button>

            {error && (
                <div className="text-red-500">
                    {error}
                </div>
            )}

            {keywordAnalysis && (
                <KeywordCloud
                    analysis={keywordAnalysis}
                    onKeywordClick={(keyword) => {
                        console.log('Clicked keyword:', keyword);
                        // Handle keyword click - e.g., filter reviews
                    }}
                />
            )}
        </div>
    );
};

export default FeedbackAnalysis;