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
export const GET_QUESTION_OPTIONS = gql`
  query GetQuestionOptions($question_id: Int!) {
      question_options(where: { question_id: { _eq: $question_id } }) {
          option_id
      }
  }
`;
export const CHECK_OPTION_USAGE = gql`
  query CheckOptionUsage($option_id: Int!) {
      question_options_aggregate(
          where: { option_id: { _eq: $option_id } }
      ) {
          aggregate {
              count
          }
      }
  }
`;
// export const GET_QUIZ_DETAILS = gql`
//   query GetQuizDetails($quiz_id: Int!) {
//     quizzes(where: { quiz_id: { _eq: $quiz_id } }) {
//       quiz_id
//       title
//       description
//       difficulty
//       time_limit_minutes
//       total_questions
//       participants_count
//       average_rating
//       quiz_topics {
//         topic {
//           topic_id
//           topic_name
//         }
//       }
//     }
//   }
// `;

// export const GET_TOP_PERFORMERS = gql`
//   mutation GetTopPerformers($quiz_id: Int!) {
//     getTopPerformers(input: { quiz_id: $quiz_id }) {
//       top_performers {
//         username
//         average_score
//       }
//     }
//   }
// `;


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
// Questions
export const GET_SINGLE_QUESTION = gql`
    query GetSingleQuestion($question_id: Int!) {
        questions(where: { question_id: { _eq: $question_id } }) {
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
// options 
export const GET_OPTIONS = gql`
    query GetOptions($optionTexts: [String!]!) {
        options(where: {
            option_text: {_in: $optionTexts}
        }) {
            option_id
            option_text
        }
    }
`;
export const CHECK_EXISTING_ATTEMPT = gql`
                query CheckExistingAttempt($quiz_id: Int!, $user_id: Int!, $time_threshold: timestamptz!) {
                    quiz_attempts(
                        where: {
                            quiz_id: { _eq: $quiz_id },
                            user_id: { _eq: $user_id },
                            start_time: { _gt: $time_threshold },
                            end_time: { _is_null: true }
                        },
                        limit: 1
                    ) {
                        attempt_id
                    }
                }
            `
    ;
export const GET_QUIZZES_DATA = gql`
  query GetQuizzesData {
    quizzes(order_by: {created_at: desc}) {
      quiz_id
      title
      average_rating
      participants_count
      total_questions
      average_score: user_performances_aggregate {
        aggregate {
          avg {
            average_score
          }
        }
      }
    }
  }
`;
