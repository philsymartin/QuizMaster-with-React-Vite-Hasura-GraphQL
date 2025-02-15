import { gql } from '@apollo/client';
export const ADD_QUESTION_AND_OPTIONS = gql`
    mutation AddQuestionAndOptions(
        $quiz_id: Int!,
        $question_text: String!,
        $question_type: String!,
        $options: [options_insert_input!]!
    ) {
        question: insert_questions_one(object: {
            quiz_id: $quiz_id,
            question_text: $question_text,
            question_type: $question_type
        }) {
            question_id
            question_text
            question_type
        }
        
        options: insert_options(
            objects: $options,
            on_conflict: {
                constraint: options_option_text_key,
                update_columns: []
            }
        ) {
            returning {
                option_id
                option_text
            }
        }
    }
`;
export const LINK_QUESTION_OPTIONS = gql`
    mutation LinkQuestionOptions(
        $objects: [question_options_insert_input!]!
    ) {
        insert_question_options(objects: $objects) {
            returning {
                question_id
                option_id
                is_correct
            }
        }
    }
`;
// export const GET_UNUSED_OPTIONS = gql`
//     query GetUnusedOptions($question_id: Int!) {
//         options(where: {
//             _not: {
//                 question_options: {
//                     question_id: { _neq: $question_id }
//                 }
//             }
//         }) {
//             option_id
//         }
//     }
// `;
// export const DELETE_QUESTION = gql`
//     mutation DeleteQuestion($question_id: Int!) {
//         # First delete the question_options
//         delete_question_options(where: {
//             question_id: { _eq: $question_id }
//         }) {
//             affected_rows
//         }

//         # Delete orphaned options using a more reliable subquery
//         delete_options(where: {
//             option_id: {
//                 _in: (
//                     SELECT o.option_id 
//                     FROM options o
//                     LEFT JOIN question_options qo ON o.option_id = qo.option_id
//                     GROUP BY o.option_id
//                     HAVING COUNT(qo.question_id) <= 1
//                     AND EXISTS (
//                         SELECT 1 
//                         FROM question_options 
//                         WHERE question_id = $question_id 
//                         AND option_id = o.option_id
//                     )
//                 )
//             }
//         }) {
//             affected_rows
//             returning {
//                 option_id
//                 option_text
//             }
//         }

//         # Finally delete the question
//         delete_questions_by_pk(question_id: $question_id) {
//             question_id
//             question_text
//         }
//     }
// `;

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

export const DELETE_QUESTION_OPTIONS = gql`
    mutation DeleteQuestionOptions($question_id: Int!) {
        delete_question_options(where: { 
            question_id: { _eq: $question_id } 
        }) {
            affected_rows
        }
    }
`;

export const DELETE_OPTION = gql`
    mutation DeleteOption($option_id: Int!) {
        delete_options_by_pk(option_id: $option_id) {
            option_id
            option_text
        }
    }
`;

export const DELETE_QUESTION = gql`
    mutation DeleteQuestion($question_id: Int!) {
        delete_questions_by_pk(question_id: $question_id) {
            question_id
            question_text
        }
    }
`;
export const UPDATE_QUESTION = gql`
    mutation UpdateQuestion(
        $question_id: Int!,
        $question_text: String!,
        $question_type: String!
    ) {
        update_questions_by_pk(
            pk_columns: { question_id: $question_id },
            _set: {
                question_text: $question_text,
                question_type: $question_type
            }
        ) {
            question_id
            question_text
            question_type
        }
    }
`;

export const UPDATE_QUESTION_OPTIONS = gql`
    mutation UpdateQuestionOptions(
        $question_id: Int!,
        $deleteOptionIds: [Int!]!,
        $newOptions: [options_insert_input!]!,
        $questionOptions: [question_options_insert_input!]!
    ) {
        # Delete old options that are no longer needed
        delete_question_options(where: {
            question_id: { _eq: $question_id },
            option_id: { _in: $deleteOptionIds }
        }) {
            affected_rows
        }
        # Insert new options
        insert_options(
            objects: $newOptions,
            on_conflict: {
                constraint: options_option_text_key,
                update_columns: []
            }
        ) {
            returning {
                option_id
                option_text
            }
        }
                # Link new options with question
        insert_question_options(
            objects: $questionOptions,
            on_conflict: {
                constraint: question_options_pkey,
                update_columns: [is_correct]
            }
        ) {
            returning {
                question_id
                option_id
                is_correct
            }
        }
    }
`;
export const INSERT_NEW_OPTIONS = gql`
    mutation InsertNewOptions($options: [options_insert_input!]!) {
        insert_options(
            objects: $options,
            on_conflict: {
                constraint: options_option_text_key,
                update_columns: []
            }
        ) {
            returning {
                option_id
                option_text
            }
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