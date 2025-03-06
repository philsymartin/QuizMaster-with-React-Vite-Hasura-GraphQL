import { gql } from '@apollo/client';

export const CREATE_QUIZ = gql`
  mutation CreateQuiz(
    $title: String!, 
    $description: String!, 
    $difficulty: String!, 
    $time_limit_minutes: Int!
  ) {
    insert_quizzes_one(object: {
      title: $title,
      description: $description,
      difficulty: $difficulty,
      time_limit_minutes: $time_limit_minutes,
      total_questions: 0,
      participants_count: 0,
      average_rating: 0
    }) {
      quiz_id
      title
      description
      difficulty
      time_limit_minutes
      total_questions
      participants_count
      average_rating
      created_at
      updated_at
    }
  }
`;
export const UPDATE_QUIZ_SETTINGS = gql`
    mutation UpdateQuizSettings($quiz_id: Int!, $updates: quizzes_set_input!) {
        update_quizzes_by_pk(
            pk_columns: { quiz_id: $quiz_id }
            _set: $updates
        ) {
            quiz_id
            title
            description
            difficulty
            time_limit_minutes
            updated_at
        }
    }
`;
export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($quiz_id: Int!) {
    delete_quiz_topics(where: { quiz_id: { _eq: $quiz_id } }) {
      affected_rows
    }
    delete_quiz_feedback(where: { quiz_id: { _eq: $quiz_id } }) {
      affected_rows
    }
    delete_user_performance(where: { quiz_id: { _eq: $quiz_id } }) {
      affected_rows
    }
    delete_answers(where: { quiz_attempt: { quiz_id: { _eq: $quiz_id } } }) {
      affected_rows
    }
    delete_quiz_attempts(where: { quiz_id: { _eq: $quiz_id } }) {
      affected_rows
    }
    delete_question_options(where: { question: { quiz_id: { _eq: $quiz_id } } }) {
      affected_rows
    }
    delete_questions(where: { quiz_id: { _eq: $quiz_id } }) {
      affected_rows
    }
    delete_quizzes_by_pk(quiz_id: $quiz_id) {
      quiz_id
      title
    }
  }
`;