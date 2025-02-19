import { call, put, select, takeLatest } from 'redux-saga/effects';
import client from '../../services/hasuraApi';
import {
    fetchQuizzesSuccess,
    fetchQuizzesFailure,
    fetchQuestionsSuccess,
    fetchQuizzesRequest,
    setSelectedQuiz,
    addQuestionRequest,
    addQuestionSuccess,
    addQuestionFailure,
    deleteQuestionRequest,
    deleteQuestionSuccess,
    deleteQuestionFailure,
    selectSelectedQuiz,
    editQuestionRequest,
    editQuestionSuccess,
    editQuestionFailure,
    updateQuizSettings,
    updateQuizSettingsSuccess,
    updateQuizSettingsFailure,
    refetchQuizzes,
} from './quizSlice';
import { CHECK_OPTION_USAGE, GET_OPTIONS, GET_QUESTION_OPTIONS, GET_QUIZZES_BASIC, GET_QUIZZES_WITH_TOPICS, GET_QUIZ_QUESTIONS, GET_SINGLE_QUESTION } from '../../api/queries/quizzes';
import { ADD_QUESTION_AND_OPTIONS, LINK_QUESTION_OPTIONS, DELETE_QUESTION, DELETE_QUESTION_OPTIONS, DELETE_OPTION, UPDATE_QUESTION, INSERT_NEW_OPTIONS, UPDATE_QUIZ_SETTINGS } from '../../api/mutations/questionsMutate';
import { Question, QuestionOption, Quiz, Option } from '../../types/quiz';
import { ApolloQueryResult, FetchResult } from '@apollo/client';

interface QuizzesQueryResponse {
    quizzes: Quiz[];
}
interface QuestionsQueryResponse {
    questions: Array<Question & {
        question_options: QuestionOption[];
    }>;
}
interface QuizQueryVariables {
    quiz_id: number;
}
interface AddQuestionResponse {
    question: {
        question_id: number;
        question_text: string;
        question_type: string;
    };
    options: {
        returning: Option[];
    };
}
interface GetOptionsResponse {
    options: Option[];
}
interface SingleQuestionResponse {
    questions: Array<Question & {
        question_options: QuestionOption[];
    }>;
}

function* fetchQuizzesSaga() {
    try {
        const response: ApolloQueryResult<QuizzesQueryResponse> = yield call([client, client.query], {
            query: GET_QUIZZES_WITH_TOPICS,
            fetchPolicy: 'network-only'
        });
        yield put(fetchQuizzesSuccess(response.data.quizzes));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        yield put(fetchQuizzesFailure(errorMessage));
    }
}
function* refetchQuizzesSaga() {
    try {
        const response: ApolloQueryResult<QuizzesQueryResponse> = yield call([client, client.query], {
            query: GET_QUIZZES_BASIC,
            fetchPolicy: 'network-only'
        });
        yield put(fetchQuizzesSuccess(response.data.quizzes));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        yield put(fetchQuizzesFailure(errorMessage));
    }
}
function* fetchQuizQuestionsSaga(action: ReturnType<typeof setSelectedQuiz>) {
    try {
        const token = localStorage.getItem('authToken');
        const variables: QuizQueryVariables = {
            quiz_id: action.payload.quiz_id
        };
        const response: ApolloQueryResult<QuestionsQueryResponse> = yield call(
            [client, client.query],
            {
                query: GET_QUIZ_QUESTIONS,
                variables,
            }
        );
        const formattedQuestions = response.data.questions.map((question) => ({
            ...question,
            question_options: question.question_options.map((qOption) => ({
                ...qOption,
                option: qOption.option
            }))
        }));
        yield put(fetchQuestionsSuccess(formattedQuestions));
    } catch (error) {
        console.error('Error fetching questions:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
    }
}
function* updateQuizSettingsSaga(action: ReturnType<typeof updateQuizSettings>) {
    try {
        const { quizId, field, value } = action.payload;
        const response: FetchResult = yield call([client, client.mutate], {
            mutation: UPDATE_QUIZ_SETTINGS,
            variables: {
                quiz_id: quizId,
                updates: {
                    [field]: value
                }
            }
        });
        if (response.data && response.data.update_quizzes_by_pk) {
            yield put(updateQuizSettingsSuccess(response.data.update_quizzes_by_pk));
            yield put(refetchQuizzes());
        } else {
            throw new Error('Failed to update quiz settings');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        yield put(updateQuizSettingsFailure(errorMessage));
    }
}
function* addQuestionSaga(action: ReturnType<typeof addQuestionRequest>) {
    try {
        const { quiz_id, question_text, question_type, options } = action.payload;
        // Add question and options
        const addQuestionResult: { data: AddQuestionResponse } = yield call([client, client.mutate], {
            mutation: ADD_QUESTION_AND_OPTIONS,
            variables: {
                quiz_id,
                question_text,
                question_type,
                options: options.map(opt => ({ option_text: opt.option_text }))
            }
        });

        const questionId = addQuestionResult.data.question.question_id;
        const optionTexts = options.map(opt => opt.option_text);
        const getOptionsResult: { data: GetOptionsResponse } = yield call([client, client.query], {
            query: GET_OPTIONS,
            variables: {
                optionTexts
            }
        });

        const optionsMap = new Map(
            getOptionsResult.data.options.map(opt => [opt.option_text, opt.option_id])
        );

        // Link questions with options and set correct answers
        const questionOptionsInput = options.map(opt => ({
            question_id: questionId,
            option_id: optionsMap.get(opt.option_text),
            is_correct: opt.is_correct
        }));

        yield call([client, client.mutate], {
            mutation: LINK_QUESTION_OPTIONS,
            variables: {
                objects: questionOptionsInput
            }
        });

        // Fetch the complete question data
        const completeQuestionResult: ApolloQueryResult<SingleQuestionResponse> = yield call(
            [client, client.query],
            {
                query: GET_SINGLE_QUESTION,
                variables: { question_id: questionId },
                fetchPolicy: 'network-only' // Ensure we get fresh data
            }
        );

        if (completeQuestionResult.data.questions.length === 0) {
            throw new Error('Failed to fetch the newly created question');
        }
        yield put(addQuestionSuccess(completeQuestionResult.data.questions[0]));
        yield put(refetchQuizzes());

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add question';
        yield put(addQuestionFailure(errorMessage));
    }
}
function* deleteQuestionSaga(action: ReturnType<typeof deleteQuestionRequest>) {
    try {
        const questionId = action.payload;
        // 1. Get all options associated with the question
        const optionsResult: ApolloQueryResult<{ question_options: { option_id: number }[] }> =
            yield call([client, client.query], {
                query: GET_QUESTION_OPTIONS,
                variables: { question_id: questionId }
            });

        const optionIds = optionsResult.data.question_options.map(qo => qo.option_id);

        // 2. Delete question_options
        yield call([client, client.mutate], {
            mutation: DELETE_QUESTION_OPTIONS,
            variables: { question_id: questionId }
        });

        // 3. Check and delete orphaned options
        for (const optionId of optionIds) {
            const usageResult: ApolloQueryResult<{
                question_options_aggregate: {
                    aggregate: { count: number }
                }
            }> = yield call([client, client.query], {
                query: CHECK_OPTION_USAGE,
                variables: { option_id: optionId }
            });

            if (usageResult.data.question_options_aggregate.aggregate.count === 0) {
                yield call([client, client.mutate], {
                    mutation: DELETE_OPTION,
                    variables: { option_id: optionId }
                });
            }
        }

        // 4. Delete the question
        const deleteResult: FetchResult<{
            delete_questions_by_pk: {
                question_id: number;
                question_text: string;
            } | null
        }> = yield call([client, client.mutate], {
            mutation: DELETE_QUESTION,
            variables: { question_id: questionId }
        });

        if (!deleteResult.data?.delete_questions_by_pk) {
            throw new Error('Question not found or already deleted');
        }

        // 5. Update UI state
        yield put(deleteQuestionSuccess(questionId));

        // 6. Refresh questions list
        const quiz: Quiz | null = yield select(selectSelectedQuiz);
        if (quiz) {
            const questionsResponse: ApolloQueryResult<QuestionsQueryResponse> = yield call(
                [client, client.query],
                {
                    query: GET_QUIZ_QUESTIONS,
                    variables: { quiz_id: quiz.quiz_id },
                    fetchPolicy: 'network-only'
                }
            );

            if (questionsResponse.data) {
                yield put(fetchQuestionsSuccess(questionsResponse.data.questions));
                yield put(refetchQuizzes());
            }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
        yield put(deleteQuestionFailure(errorMessage));
        console.error('Delete question error:', error);
    }
}
function* editQuestionSaga(action: ReturnType<typeof editQuestionRequest>) {
    try {
        const { question_id, quiz_id, question_text, question_type, options } = action.payload;

        // Update question basic info
        yield call([client, client.mutate], {
            mutation: UPDATE_QUESTION,
            variables: {
                question_id,
                question_text,
                question_type
            }
        });

        // Get existing options for comparison
        const existingQuestion: ApolloQueryResult<SingleQuestionResponse> = yield call(
            [client, client.query],
            {
                query: GET_SINGLE_QUESTION,
                variables: { question_id }
            }
        );

        const existingOptions = existingQuestion.data.questions[0].question_options;

        // Step 1: Insert all new options first
        const newOptionsInput = options
            .filter(opt => !existingOptions.some(eo =>
                eo.option.option_text === opt.option_text
            ))
            .map(opt => ({
                option_text: opt.option_text
            }));

        if (newOptionsInput.length > 0) {
            yield call([client, client.mutate], {
                mutation: INSERT_NEW_OPTIONS,
                variables: {
                    options: newOptionsInput
                }
            });
        }

        // Step 2: Get all option IDs (both existing and newly created)
        const allOptionsResult: ApolloQueryResult<GetOptionsResponse> = yield call(
            [client, client.query],
            {
                query: GET_OPTIONS,
                variables: {
                    optionTexts: options.map(opt => opt.option_text)
                }
            }
        );

        const optionsMap = new Map(
            allOptionsResult.data.options.map(opt => [opt.option_text, opt.option_id])
        );

        // Step 3: Remove old question-option relationships
        yield call([client, client.mutate], {
            mutation: DELETE_QUESTION_OPTIONS,
            variables: {
                question_id
            }
        });

        // Step 4: Create new question-option relationships
        const questionOptionsInput = options
            .map(opt => {
                const option_id = optionsMap.get(opt.option_text);
                if (!option_id) {
                    throw new Error(`Option ID not found for text: ${opt.option_text}`);
                }
                return {
                    question_id,
                    option_id,
                    is_correct: opt.is_correct
                };
            });

        yield call([client, client.mutate], {
            mutation: LINK_QUESTION_OPTIONS,
            variables: {
                objects: questionOptionsInput
            }
        });

        // Step 5: Clean up orphaned options
        const existingOptionIds = existingOptions.map(eo => eo.option.option_id);
        for (const optionId of existingOptionIds) {
            const usageResult: ApolloQueryResult<{
                question_options_aggregate: {
                    aggregate: { count: number }
                }
            }> = yield call([client, client.query], {
                query: CHECK_OPTION_USAGE,
                variables: { option_id: optionId }
            });

            if (usageResult.data.question_options_aggregate.aggregate.count === 0) {
                yield call([client, client.mutate], {
                    mutation: DELETE_OPTION,
                    variables: { option_id: optionId }
                });
            }
        }

        // Step 6: Fetch and return updated question
        const updatedQuestion: ApolloQueryResult<SingleQuestionResponse> = yield call(
            [client, client.query],
            {
                query: GET_SINGLE_QUESTION,
                variables: { question_id },
                fetchPolicy: 'network-only'
            }
        );
        yield put(editQuestionSuccess(updatedQuestion.data.questions[0]));
        yield put(refetchQuizzes());
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to edit question';
        yield put(editQuestionFailure(errorMessage));
    }
}


export function* watchQuizSaga() {
    yield takeLatest(fetchQuizzesRequest.type, fetchQuizzesSaga);
    yield takeLatest(refetchQuizzes.type, refetchQuizzesSaga);
    yield takeLatest(setSelectedQuiz.type, fetchQuizQuestionsSaga);
    yield takeLatest(updateQuizSettings.type, updateQuizSettingsSaga);
    yield takeLatest(addQuestionRequest.type, addQuestionSaga);
    yield takeLatest(deleteQuestionRequest.type, deleteQuestionSaga);
    yield takeLatest(editQuestionRequest.type, editQuestionSaga);

}