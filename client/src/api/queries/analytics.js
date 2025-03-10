import { gql } from '@apollo/client';

export const GET_FEEDBACK_ANALYTICS = gql`
  query GetFeedbackAnalytics {
  # Total count of all feedback
  quiz_feedback_aggregate {
    aggregate {
      count
    }
  }
  sentiment_counts: quiz_feedback_aggregate {
    aggregate {
      count
    }
    nodes {
      sentiment_label
    }
  }
  quiz_feedback(
    order_by: { submitted_at: desc }
  ) {
    feedback_id
    feedback_text
    submitted_at
    sentiment_label
    sentiment_score
    user {
      username
    }
    quiz {
      title
    }
  }
}
`;
//  Query to get keyword analytics data
export const GET_KEYWORD_ANALYTICS = gql`
query GetKeywordAnalytics($limit: Int) {
    feedback_keywords(
      order_by: { feedback_keyword_mappings_aggregate: { count: desc } }
      limit: $limit
    ) {
      keyword_id
      keyword
      created_at
      feedback_keyword_mappings {
        feedback_keyword_id
        quiz_feedback {
          feedback_id
          feedback_text
          sentiment_label
          sentiment_score
          quiz {
            quiz_id
            title
          }
        }
      }
      feedback_keyword_mappings_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
//  Query to get unprocessed feedback (feedback without keywords extracted)
export const GET_UNPROCESSED_FEEDBACK = gql`
query GetUnprocessedFeedback{
  quiz_feedback(
    where: {
      keyword_extracted_at: { _is_null: true },
      sentiment_label: { _is_null: false }
    }
  ) {
    feedback_id
    feedback_text
    sentiment_label
    sentiment_score
    quiz_id
  }
}
`;