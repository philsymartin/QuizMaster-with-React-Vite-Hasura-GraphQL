
import { useQuery } from '@apollo/client';
import { useCallback } from 'react';
import AdminAnalyticsPage from '@pages/admin/AdminAnalyticsPage';
import { GET_FEEDBACK_ANALYTICS } from '@queries/analytics'
import { SentimentQueryResponse, RecentFeedbackItem } from 'src/types/adminAnalysis';

const AdmninAnalyticsPageContainer = () => {
    const { data, loading, error } = useQuery<SentimentQueryResponse>(GET_FEEDBACK_ANALYTICS);
    const processRecentFeedback = useCallback((): RecentFeedbackItem[] => {
        if (!data?.quiz_feedback) return [];

        return data.quiz_feedback.map(feedback => ({
            id: feedback.feedback_id,
            user: feedback.user.username,
            quiz: feedback.quiz.title,
            feedback: feedback.feedback_text,
            sentiment: feedback.sentiment_label?.toLowerCase() || 'neutral',
            date: new Date(feedback.submitted_at).toLocaleDateString()
        }));
    }, [data]);

    return (
        <AdminAnalyticsPage
            data={data}
            loading={loading}
            error={error}
            processRecentFeedback={processRecentFeedback}
        />
    )
}
export default AdmninAnalyticsPageContainer