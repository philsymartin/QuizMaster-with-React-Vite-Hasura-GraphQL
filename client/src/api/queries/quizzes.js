import { gql } from '@apollo/client';

export const GET_QUIZZES = gql`
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