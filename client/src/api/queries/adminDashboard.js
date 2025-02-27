import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    users_aggregate {
      aggregate {
        count
      }
    }
    quizzes_aggregate {
      aggregate {
        count
      }
    }
    quiz_attempts_aggregate {
      aggregate {
        count
        avg {
          score
        }
      }
    }
    completed_attempts: quiz_attempts_aggregate(where: {end_time: {_is_null: false}}) {
      aggregate {
        count
      }
    }
    total_attempts: quiz_attempts_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity {
    quiz_attempts(order_by: {end_time: desc}, limit: 5, where: {end_time: {_is_null: false}}) {
      attempt_id
      user {
        username
      }
      quiz {
        title
      }
      score
      end_time
    }
    users(order_by: {created_at: desc}, limit: 5) {
      user_id
      username
      created_at
    }
    quizzes(order_by: {created_at: desc}, limit: 5) {
      quiz_id
      title
      created_at
    }
  }
`;

export const GET_QUICK_STATS = gql`
  query GetQuickStats($yesterday: timestamptz!) {
    quiz_attempts_with_duration: quiz_attempts(where: {end_time: {_is_null: false}}) {
      start_time
      end_time
    }
    new_users_today: users_aggregate(where: {created_at: {_gte: $yesterday}}) {
      aggregate {
        count
      }
    }
    new_quizzes_today: quizzes_aggregate(where: {created_at: {_gte: $yesterday}}) {
      aggregate {
        count
      }
    }
  }
`;