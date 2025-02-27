import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SentimentQueryResponse, SentimentDataItem } from '../../types/adminAnalysis';
import { FiMinus, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';

interface SentimentAnalysisProps {
    data: SentimentQueryResponse;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ data }) => {
    const processSentimentData = (): SentimentDataItem[] => {
        const sentimentCounts = {
            'Positive': 0,
            'Negative': 0,
            'Neutral': 0,
            'Unanalyzed': 0
        };

        // Count sentiments from the nodes array
        data.sentiment_counts.nodes.forEach(node => {
            if (!node.sentiment_label) {
                sentimentCounts['Unanalyzed']++;
            } else {
                const sentiment = node.sentiment_label === 'POSITIVE' ? 'Positive' :
                    node.sentiment_label === 'NEGATIVE' ? 'Negative' : 'Neutral';
                sentimentCounts[sentiment]++;
            }
        });

        const totalFeedbacks = data.sentiment_counts.aggregate.count;

        return Object.entries(sentimentCounts)
            .filter(([_, count]) => count > 0)
            .map(([sentiment, count]) => ({
                name: sentiment,
                value: (count / totalFeedbacks) * 100,
                count: count,
                color: getSentimentColor(sentiment)
            }))
            .sort((a, b) => b.value - a.value);
    };

    const getSentimentColor = (sentiment: string): string => {
        switch (sentiment.toLowerCase()) {
            case 'positive': return '#10B981';
            case 'negative': return '#EF4444';
            case 'neutral': return '#6B7280';
            case 'unanalyzed': return '#94A3B8';
            default: return '#6B7280';
        }
    };

    const sentimentData = processSentimentData();
    const totalCount = data.quiz_feedback_aggregate.aggregate.count;

    const CustomTooltip = ({
        active,
        payload
    }: {
        active?: boolean;
        payload?: Array<{ payload: SentimentDataItem }>;
    }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-2 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{data.name}</p>
                    <p>Count: {data.count}</p>
                    <p>Percentage: {data.value.toFixed(1)}%</p>
                </div>
            );
        }
        return null;
    };

    const renderLegendContent = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center">
                        <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {entry.payload.name}: {entry.payload.value.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Feedback Sentiment Analysis
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Based on {totalCount} feedback submissions
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {sentimentData.map((item) => (
                    <div
                        key={item.name}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg ${item.name === 'Positive' ? 'bg-green-50 dark:bg-green-900/20' :
                            item.name === 'Negative' ? 'bg-red-50 dark:bg-red-900/20' :
                                'bg-gray-50 dark:bg-gray-700/30'
                            }`}
                    >
                        {item.name === 'Positive' ? (
                            <FiThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                        ) : item.name === 'Negative' ? (
                            <FiThumbsDown className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                        ) : (
                            <FiMinus className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                        )}
                        <span className="text-xl font-bold" style={{ color: item.color }}>
                            {item.value.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.name} ({item.count})
                        </span>
                    </div>
                ))}
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sentimentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {sentimentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegendContent} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SentimentAnalysis;