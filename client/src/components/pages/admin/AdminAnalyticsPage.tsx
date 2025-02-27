import { useQuery } from '@apollo/client';
import { GET_FEEDBACK_ANALYTICS } from '@queries/analytics'
import SentimentAnalysis from '@components/SentimentalAnalysis';
import { SentimentQueryResponse, RecentFeedbackItem } from '../../../types/adminAnalysis';
import FeedbackKeywords from '../../common/FeedbackKeywords';
import QuizCategoriesPerformanceCard from '@components/QuizCategoriesPerformanceCard';
import LoadingComponent from '@utils/LoadingSpinner';

const AdminAnalyticsPage = () => {
    const { data, loading, error } = useQuery<SentimentQueryResponse>(GET_FEEDBACK_ANALYTICS);

    const processRecentFeedback = (): RecentFeedbackItem[] => {
        if (!data?.quiz_feedback) return [];

        return data.quiz_feedback.map(feedback => ({
            id: feedback.feedback_id,
            user: feedback.user.username,
            quiz: feedback.quiz.title,
            feedback: feedback.feedback_text,
            sentiment: feedback.sentiment_label?.toLowerCase() || 'neutral',
            date: new Date(feedback.submitted_at).toLocaleDateString()
        }));
    };

    if (loading) return <LoadingComponent />;
    if (error) return <div>Error loading feedback data</div>;

    const recentFeedback = processRecentFeedback();

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Results & Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track performance and feedback analysis</p>
                </div>
            </div>

            {/* Quiz Category Performance and Sentiment Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quiz Category Performance */}
                <QuizCategoriesPerformanceCard />

                {/* Sentiment Analysis */}
                {data && <SentimentAnalysis data={data} />}
            </div>

            {/* Common Feedback Keywords and Recent Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Common Feedback Keywords */}

                <FeedbackKeywords />


                {/* Recent Feedback */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Feedback</h2>
                        <button className="text-purple-600 dark:text-purple-400 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentFeedback.map((item) => (
                            <div key={item.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {item.user}
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        item.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">Quiz: </span>
                                    {item.quiz}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    "{item.feedback}"
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    {item.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;