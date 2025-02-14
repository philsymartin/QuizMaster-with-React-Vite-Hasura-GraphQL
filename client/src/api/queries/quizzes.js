import { gql } from '@apollo/client';

export const GET_QUIZZES_BASIC = gql`
    query GetQuizzes {
      quizzes {
        quiz_id
        title
        description
        difficulty
        time_limit_minutes
        total_questions
        participants_count
        average_rating
      }
    }
  `;

export const GET_QUIZ_DETAILS = gql`
    query GetQuizDetails($quiz_id: Int!) {
    quizzes(where: {quiz_id: {_eq: $quiz_id}}) {
      quiz_id
      title
      description
      created_at
      updated_at
      difficulty
      time_limit_minutes
      total_questions
      participants_count
      average_rating
      quiz_topics {
        topic {
          topic_id
          topic_name
        }
      }
      questions_aggregate(where: {quiz_id: {_eq: $quiz_id}}) {
        aggregate {
          count
        }
      }
      user_performances(where: {quiz_id: {_eq: $quiz_id}}, order_by: {average_score: desc}, limit: 3) {
        user_id
        total_attempts
        correct_answers
        average_score
        user {
          username
        }
      }
    }
  }
  `;


export const GET_QUIZZES_WITH_TOPICS = gql`
query GetQuizzes {
    quizzes {
        quiz_id
        title
        description
        created_at
        updated_at
        difficulty
        time_limit_minutes
        total_questions
        participants_count
        average_rating
        quiz_topics {
            topic {
                topic_id
                topic_name
            }
        }
    }
}
`;

export const GET_QUIZ_QUESTIONS = gql`
    query GetQuizQuestions($quiz_id: Int!) {
        questions(where: { quiz_id: { _eq: $quiz_id } }) {
            question_id
            quiz_id
            question_text
            question_type
            created_at
            question_options {
                option {
                    option_id
                    option_text
                }
                is_correct
            }
        }
    }
`;
