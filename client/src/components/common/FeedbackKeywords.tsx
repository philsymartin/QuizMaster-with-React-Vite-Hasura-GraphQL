import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FiRefreshCw } from 'react-icons/fi';
import { BarChartHorizontalIcon, getSentimentColor } from '@config/styleConstants';
import { INSERT_FEEDBACK_KEYWORD, INSERT_FEEDBACK_KEYWORD_MAPPING, UPDATE_FEEDBACK_KEYWORD_EXTRACTED } from '@mutations/analysisMutate';
import { analyzeKeywords, FeedbackItem } from '@services/sentiment';
import { GET_KEYWORD_ANALYTICS, GET_UNPROCESSED_FEEDBACK } from '@queries/analytics';

interface KeywordMapping {
    feedback_keyword_id: number;
    quiz_feedback: {
        feedback_id: number;
        feedback_text: string;
        sentiment_label: string;
        sentiment_score: number;
        quiz: {
            quiz_id: number;
            title: string;
        };
    };
}

interface KeywordData {
    keyword_id: number;
    keyword: string;
    created_at: string;
    feedback_keyword_mappings: KeywordMapping[];
    feedback_keyword_mappings_aggregate: {
        aggregate: {
            count: number;
        };
    };
}

interface KeywordAnalyticsData {
    feedback_keywords: KeywordData[];
}

interface ProcessedKeywordData {
    text: string;
    value: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    quizzes: Map<number, {
        title: string;
        instances: Array<{
            sentiment: 'positive' | 'negative' | 'neutral';
            score: number;
        }>;
    }>;
}

interface UnprocessedFeedback {
    feedback_id: number;
    feedback_text: string;
    sentiment_label: string;
    sentiment_score: number;
    quiz_id: number;
}

interface UnprocessedFeedbackData {
    quiz_feedback: UnprocessedFeedback[];
}

interface KeywordAnalyticsProps {
    quizId?: number;
    limit?: number;
}

const FeedbackKeywords: React.FC<KeywordAnalyticsProps> = ({
    limit = 10
}) => {
    const [feedbackKeywords, setFeedbackKeywords] = useState<ProcessedKeywordData[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const { data: analyticsData, loading: analyticsLoading, refetch: refetchAnalytics } = useQuery<KeywordAnalyticsData>(
        GET_KEYWORD_ANALYTICS,
        {
            variables: { limit },
            fetchPolicy: 'network-only',
            onCompleted: (data) => {
                if (data?.feedback_keywords) {
                    processKeywordData(data.feedback_keywords);
                }
            }
        }
    );

    const { data: unprocessedData, refetch: refetchUnprocessed } = useQuery<UnprocessedFeedbackData>(
        GET_UNPROCESSED_FEEDBACK,
        {
            fetchPolicy: 'network-only',
            skip: true, // We'll only run this when needed
        }
    );

    const [insertKeywords] = useMutation(INSERT_FEEDBACK_KEYWORD);
    const [insertKeywordMappings] = useMutation(INSERT_FEEDBACK_KEYWORD_MAPPING);
    const [updateFeedbackExtracted] = useMutation(UPDATE_FEEDBACK_KEYWORD_EXTRACTED);

    const processKeywordData = (keywords: KeywordData[]) => {
        const processedData: ProcessedKeywordData[] = keywords.map(keyword => {
            const quizMap = new Map<number, {
                title: string;
                instances: Array<{
                    sentiment: 'positive' | 'negative' | 'neutral';
                    score: number;
                }>;
            }>();

            let totalSentimentScore = 0;
            let totalInstances = 0;

            // Process each feedback instance where this keyword appears
            keyword.feedback_keyword_mappings.forEach(mapping => {
                const feedback = mapping.quiz_feedback;
                const quizId = feedback.quiz.quiz_id;
                const sentimentCategory: 'positive' | 'negative' | 'neutral' =
                    feedback.sentiment_label === 'POSITIVE' ? 'positive' :
                        feedback.sentiment_label === 'NEGATIVE' ? 'negative' : 'neutral';

                totalSentimentScore += feedback.sentiment_score;
                totalInstances++;

                // Add to quiz map
                if (!quizMap.has(quizId)) {
                    quizMap.set(quizId, {
                        title: feedback.quiz.title,
                        instances: []
                    });
                }
                quizMap.get(quizId)?.instances.push({
                    sentiment: sentimentCategory,
                    score: feedback.sentiment_score
                });
            });

            const avgSentiment = totalInstances > 0 ? totalSentimentScore / totalInstances : 0.5;

            // Determine overall sentiment category
            let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
            if (avgSentiment > 0.65) {
                overallSentiment = 'positive';
            } else if (avgSentiment < 0.45) {
                overallSentiment = 'negative';
            }

            return {
                text: keyword.keyword,
                value: keyword.feedback_keyword_mappings_aggregate.aggregate.count,
                sentiment: overallSentiment,
                quizzes: quizMap
            };
        });

        setFeedbackKeywords(processedData);
    };

    // Function to analyze keywords for unprocessed feedback
    const onAnalyzeClick = async () => {
        try {
            setIsAnalyzing(true);

            // 1. Fetch unprocessed feedback
            const { data } = await refetchUnprocessed();
            const unprocessedFeedback: UnprocessedFeedback[] = data?.quiz_feedback || [];

            if (unprocessedFeedback.length === 0) {
                console.log('No unprocessed feedback found');
                setIsAnalyzing(false);
                return;
            }

            // 2. Prepare feedback items for keyword analysis
            const feedbackItems: FeedbackItem[] = unprocessedFeedback.map(item => ({
                feedback_id: item.feedback_id,
                text: item.feedback_text,
            }));

            // 3. Analyze keywords using the service
            const analysisResult = await analyzeKeywords(feedbackItems);
            console.log('Analysis result:', analysisResult);

            // 4. Early return if no feedback items have keywords
            if (!analysisResult.feedbackKeywords || analysisResult.feedbackKeywords.length === 0) {
                console.log('No feedback items with keywords found');
                setIsAnalyzing(false);
                return;
            }

            // 5. First, insert all keywords into feedback_keywords table
            // Collect unique keywords to insert while preserving case
            const uniqueKeywords = new Set<string>();
            analysisResult.feedbackKeywords.forEach(item => {
                item.keywords.forEach(keyword => {
                    uniqueKeywords.add(keyword.toLowerCase().trim());
                });
            });

            // Early return if no keywords were found at all
            if (uniqueKeywords.size === 0) {
                console.log('No keywords found in any feedback');
                setIsAnalyzing(false);
                return;
            }

            // 6. Prepare keyword objects for insertion
            const keywordObjects = Array.from(uniqueKeywords).map(keyword => ({
                keyword: keyword
            }));

            // 7. Insert keywords
            const keywordResult = await insertKeywords({
                variables: {
                    objects: keywordObjects
                }
            });
            console.log('Keyword insertion result:', keywordResult);

            // 8. Create a map from keyword text to keyword_id
            const keywordMap = new Map();
            if (keywordResult?.data?.insert_feedback_keywords?.returning) {
                keywordResult.data.insert_feedback_keywords.returning.forEach(
                    (k: { keyword_id: number; keyword: string }) => {
                        keywordMap.set(k.keyword.toLowerCase().trim(), k.keyword_id);
                    }
                );
            }

            // 9. Prepare mappings between feedback and keywords
            const mappings = [];
            for (const feedbackItem of analysisResult.feedbackKeywords) {
                // For each keyword in this feedback
                for (const keyword of feedbackItem.keywords) {
                    const lowercaseKeyword = keyword.toLowerCase().trim();
                    const keywordId = keywordMap.get(lowercaseKeyword);

                    if (keywordId) {
                        mappings.push({
                            feedback_id: feedbackItem.feedback_id,
                            keyword_id: keywordId
                        });
                    } else {
                        console.log(`Keyword ID not found for "${keyword}"`);
                    }
                }
            }

            // 10. Insert mappings - one per feedback-keyword relationship
            if (mappings.length > 0) {
                const mappingResult = await insertKeywordMappings({
                    variables: {
                        objects: mappings
                    }
                });
                console.log('Mapping insertion result:', mappingResult);
            }

            // 11. Update feedback to mark as processed
            await updateFeedbackExtracted({
                variables: {
                    feedback_ids: feedbackItems.map(f => f.feedback_id),
                    timestamp: new Date().toISOString()
                }
            });

            // 12. Refetch analytics to show updated data
            await refetchAnalytics();
        } catch (error) {
            console.error('Error during keyword analysis:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Determine max value for percentage calculations
    const maxValue = feedbackKeywords.length ? Math.max(...feedbackKeywords.map(k => k.value)) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Common Feedback Keywords</h2>
                <button
                    onClick={onAnalyzeClick}
                    className={`inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors ${isAnalyzing ? 'cursor-wait' : 'cursor-pointer'}`}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <BarChartHorizontalIcon />
                    )}
                    <span className="ml-2">
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Recent'}
                    </span>
                </button>
            </div>

            {analyticsLoading && !isAnalyzing && (
                <div className="flex justify-center py-8">
                    <FiRefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                </div>
            )}

            {feedbackKeywords.length > 0 ? (
                <div className="space-y-6">
                    {feedbackKeywords.map((keyword, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${getSentimentColor(keyword.sentiment || 'neutral')}`}></div>
                                <div className="text-md font-medium text-gray-800 dark:text-gray-200 flex-1">
                                    {keyword.text}
                                </div>
                            </div>

                            {/* Quiz details */}
                            <div className="ml-4 mt-2">
                                {Array.from(keyword.quizzes.entries()).map(([quizId, quizData]) => (
                                    <div key={quizId} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="font-medium">{quizData.title}</span>:
                                        <span className="ml-2 flex flex-wrap gap-1 mt-1">
                                            {quizData.instances.map((instance, i) => (
                                                <span
                                                    key={i}
                                                    className={`inline-block w-3 h-3 rounded-full ${getSentimentColor(instance.sentiment)}`}
                                                    title={`Sentiment: ${instance.sentiment}, Score: ${instance.score.toFixed(2)}`}
                                                ></span>
                                            ))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No keyword data available</p>
                    <button
                        onClick={onAnalyzeClick}
                        className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                        Run analysis
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackKeywords;