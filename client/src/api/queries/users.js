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
// Query to fetch quiz attempts and feedback
export const GET_USER_QUIZZES = gql`
  query GetUserQuizzes {
    users {
      quiz_attempts {
        attempt_id
        start_time
        end_time
        score
        quiz {
          quiz_id
          title
          difficulty
          description
          time_limit_minutes
        }
      }
      quiz_feedbacks {
        feedback_id
        feedback_text
        rating
        submitted_at
        quiz {
          quiz_id
          title
        }
      }
    }
  }
`;
export const LEADERBOARD_QUERY = gql`
    query GetLeaderboardData {
        users(
            where: {
                _and: [
                    { role: { _eq: "user" } },
                    { quiz_attempts: { end_time: { _is_null: false } } }  
                ]
            }
        ) {
            user_id
            username
            user_performances {
                quiz_id
                total_attempts
                correct_answers
                average_score
                quiz {
                    title
                    total_questions
                }
            }
            quiz_attempts(
                where: { end_time: { _is_null: false } }  
                order_by: { score: desc } 
            ) {
                quiz_id
                score
                quiz {
                    title
                }
            }
        }
    }
`;
