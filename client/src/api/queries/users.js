import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id: user_id
      username
      email
      role
      status
      created_at
      last_active
    }
  }
`;
export const GET_USER_DASHBOARD_DATA = gql`
  query GetUserDashboardData {
    users {
      user_id
      username
      email
      role
      created_at
      status
      last_active
      quiz_attempts {
        attempt_id
        start_time
        end_time
        score
        quiz {
          title
          difficulty
        }
      }
      quiz_feedbacks {
        feedback_id
        feedback_text
        rating
        submitted_at
        quiz {
          title
        }
      }
      user_performances {
        performance_id
        total_attempts
        correct_answers
        average_score
        quiz {
          title
        }
      }
    }
  }
`;