import React, { useState } from 'react';
import { analyzeSentiment, SentimentAnalysis, SentimentAnalysisError } from '../../services/sentiment';

const SentimentAnalyzer: React.FC = () => {
    const [text, setText] = useState('');
    const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryAttempt, setRetryAttempt] = useState(0);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setRetryAttempt(0);

            const result = await analyzeSentiment(text);
            setSentiment(result);
        } catch (error) {
            console.error('Error analyzing sentiment:', error);

            if (error instanceof SentimentAnalysisError) {
                setError(error.message);
                if (error.isRetryable) {
                    setRetryAttempt(prev => prev + 1);
                }
            } else {
                setError('An unexpected error occurred');
            }
            setSentiment(null);
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (label?: string) => {
        switch (label) {
            case 'POSITIVE':
                return 'text-green-600';
            case 'NEGATIVE':
                return 'text-red-600';
            case 'NEUTRAL':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter text to analyze
                </label>
                <textarea
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    rows={4}
                    disabled={loading}
                />
            </div>

            {error && (
                <div className="mt-2 text-red-500">
                    <span>{error}</span>
                    {retryAttempt > 0 && (
                        <span className="ml-2 text-gray-500">
                            (Attempt {retryAttempt}/3)
                        </span>
                    )}
                </div>
            )}

            <button
                className={`mt-2 px-4 py-2 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                onClick={handleAnalyze}
                disabled={loading}
            >
                {loading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>

            {sentiment && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                    <p className="font-semibold mb-2">Analysis Result:</p>
                    <p className={`text-lg ${getSentimentColor(sentiment.label)}`}>
                        Sentiment: {sentiment.label}
                    </p>
                    <p className="mt-1">
                        Confidence: {(sentiment.score * 100).toFixed(1)}%
                    </p>
                </div>
            )}
        </div>
    );
};

export default SentimentAnalyzer;