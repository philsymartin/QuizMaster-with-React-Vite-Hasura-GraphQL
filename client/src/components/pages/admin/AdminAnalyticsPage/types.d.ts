export interface AdminAnalyticsPageProps {
    data: SentimentQueryResponse,
    loading: boolean,
    error: ApolloError | undefined,
    processRecentFeedback: () => RecentFeedbackItem[]

}