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
            quiz_id
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
export const START_QUIZ_ATTEMPT = gql`
    mutation StartQuizAttempt($quiz_id: Int!, $user_email: String!, $start_time: timestamptz!) {
        insert_quiz_attempts_one(object: {
            quiz_id: $quiz_id,
            user_email: $user_email,
            start_time: $start_time
        }) {
            attempt_id
            start_time
        }
    }
`;
export const SUBMIT_QUIZ_ATTEMPT = gql`
    mutation SubmitQuizAttempt(
        $attempt_id: Int!,
        $answers: [answers_insert_input!]!,
        $end_time: timestamptz!,
        $score: numeric!,
        $user_email: String!
    ) {
        update_quiz_attempts_by_pk(
            pk_columns: { attempt_id: $attempt_id },
            _set: { 
                end_time: $end_time,
                score: $score,
                user_email: $user_email
            }
        ) {
            attempt_id
            score
            end_time
        }
        insert_answers(objects: $answers) {
            affected_rows
        }
    }
`;