export interface AdminAnalyticsPageProps {
  data: SentimentQueryResponse;
  loading: boolean;
  error: ApolloError | undefined;
  processRecentFeedback: () => RecentFeedbackItem[];
}

export interface KeywordMapping {
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

export interface KeywordData {
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

export interface KeywordAnalyticsData {
  feedback_keywords: KeywordData[];
}

export interface ProcessedKeywordData {
  text: string;
  value: number;
  sentiment?: "positive" | "negative" | "neutral";
  quizzes: Map<
    number,
    {
      title: string;
      instances: Array<{
        sentiment: "positive" | "negative" | "neutral";
        score: number;
      }>;
    }
  >;
}

export interface UnprocessedFeedback {
  feedback_id: number;
  feedback_text: string;
  sentiment_label: string;
  sentiment_score: number;
  quiz_id: number;
}

export interface UnprocessedFeedbackData {
  quiz_feedback: UnprocessedFeedback[];
}
