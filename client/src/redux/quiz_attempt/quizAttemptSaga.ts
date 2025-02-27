import { call, put, select, takeLatest, delay, take, fork, cancel } from 'redux-saga/effects';
import { ApolloQueryResult } from '@apollo/client';
import client from '@services/hasuraApi';
import {
    startQuizAttempt,
    setQuestions,
    setAttemptId,
    updateTimeRemaining,
    submitQuizRequest,
    submitQuizSuccess,
    submitQuizFailure,
    selectQuizAttemptState,
    resetQuizAttempt
} from './quizAttemptSlice';
import { CHECK_EXISTING_ATTEMPT, GET_QUIZ_QUESTIONS } from '../../api/queries/quizzes';
import { START_QUIZ_ATTEMPT, SUBMIT_QUIZ_ATTEMPT } from '../../api/mutations/questionsMutate';
import { RootState } from '../store';
interface StartQuizAttemptResponse {
    data: {
        insert_quiz_attempts_one: {
            attempt_id: number;
            start_time: string;
        };
    };
}
interface QuizQuestion {
    question_id: number;
    question_text: string;
    question_options: Array<{
        option: {
            option_id: number;
            option_text: string;
        };
        is_correct: boolean;
    }>;
}
function* startTimerSaga() {
    while (true) {
        const { timeRemaining, isComplete } = yield select(selectQuizAttemptState);
        if (isComplete || timeRemaining <= 0) {
            if (timeRemaining <= 0) {
                yield put(submitQuizRequest());
            }
            break;
        }
        yield delay(1000);
        yield put(updateTimeRemaining(timeRemaining - 1));
    }
}
function* startQuizSaga(action: ReturnType<typeof startQuizAttempt>): Generator<any, void, any> {
    try {
        console.log('Starting quiz saga with payload:', action.payload);
        const quizAttemptState = yield select(selectQuizAttemptState);
        // Only prevent reinitialization if the quiz is already fully initialized
        if (quizAttemptState.isInitialized && quizAttemptState.currentQuiz?.quizId === action.payload.quizId) {
            console.log('Quiz already fully initialized, returning');
            return;
        }
        const user: { user_id: number } | null = yield select((state: RootState) => state.auth.user);
        if (!user || !user.user_id) {
            console.error('User not authenticated');
            throw new Error('User not authenticated');
        }
        // Only proceed if:
        // 1. The quiz is not initialized OR
        // 2. The quiz is different from the current one
        if (quizAttemptState.isInitialized && quizAttemptState.currentQuiz?.quizId === action.payload.quizId) {
            console.log('Quiz already initialized, returning');
            return;
        }
        // Check for existing attempt in the last 5 seconds
        const checkExistingAttempt: ApolloQueryResult<any> = yield call([client, client.query], {
            query: CHECK_EXISTING_ATTEMPT,
            variables: {
                quiz_id: action.payload.quizId,
                user_id: user.user_id,
                time_threshold: new Date(Date.now() - 5000).toISOString() // Last 5 seconds
            },
            fetchPolicy: 'no-cache'
        });

        let attemptId;
        if (checkExistingAttempt.data?.quiz_attempts?.length > 0) {
            // Use existing attempt
            attemptId = checkExistingAttempt.data.quiz_attempts[0].attempt_id;
            console.log('Using existing attempt:', attemptId);
        } else {
            // Create new attempt
            console.log('Creating new quiz attempt for user:', user.user_id);
            const startAttemptResult: StartQuizAttemptResponse = yield call([client, client.mutate], {
                mutation: START_QUIZ_ATTEMPT,
                variables: {
                    quiz_id: action.payload.quizId,
                    user_id: user.user_id,
                },
            });
            console.log('returned start_time', startAttemptResult.data.insert_quiz_attempts_one.start_time);

            if (!startAttemptResult?.data?.insert_quiz_attempts_one?.attempt_id) {
                throw new Error('Failed to create quiz attempt');
            }
            attemptId = startAttemptResult.data.insert_quiz_attempts_one.attempt_id;
        }

        yield put(setAttemptId(attemptId));


        console.log('Fetching questions for quiz:', action.payload.quizId);
        const questionsResult: ApolloQueryResult<any> = yield call([client, client.query], {
            query: GET_QUIZ_QUESTIONS,
            variables: { quiz_id: action.payload.quizId },
            fetchPolicy: 'no-cache',
        });
        if (!questionsResult.data || !questionsResult.data.questions) {
            throw new Error('Failed to fetch questions');
        }
        // Transform questions to match expected format
        const formattedQuestions = questionsResult.data.questions.map((q: any) => {
            console.log('Processing question:', q);
            return {
                question_id: q.question_id,
                question_text: q.question_text,
                question_type: q.question_type,
                question_options: q.question_options.map((opt: any) => ({
                    option: {
                        option_id: opt.option.option_id,
                        option_text: opt.option.option_text,
                    },
                    is_correct: opt.is_correct,
                })),
            };
        });

        const shuffledQuestions = [...formattedQuestions].sort(() => Math.random() - 0.5);
        console.log('Dispatching questions:', shuffledQuestions);
        yield put(setQuestions(shuffledQuestions));

        const timerTask = yield fork(startTimerSaga);
        yield take([resetQuizAttempt.type, submitQuizSuccess.type, submitQuizFailure.type]);
        yield cancel(timerTask);
    } catch (error) {
        console.error('Error in startQuizSaga:', error);
        yield put(submitQuizFailure(error instanceof Error ? error.message : 'Failed to start quiz'));
    }
}

function* submitQuizSaga(): Generator<any, void, any> {
    try {
        const state = yield select(selectQuizAttemptState);
        const user: { user_id: number } | null = yield select((state: RootState) => state.auth.user);
        if (!user || !user.user_id) {
            throw new Error('User not authenticated');
        }
        // Calculate score
        const totalQuestions = state.questions.length;
        const correctAnswers = state.questions.reduce((count: number, question: QuizQuestion) => {
            const userAnswer = state.answers[question.question_id];
            const correctOption = question.question_options.find(opt => opt.is_correct);
            return count + (userAnswer === correctOption?.option.option_id ? 1 : 0);
        }, 0);

        const score = (correctAnswers / totalQuestions) * 100;

        // Prepare answers for submission
        const answersInput = Object.entries(state.answers).map(([questionId, optionId]) => ({
            attempt_id: state.attemptId,
            question_id: parseInt(questionId),
            option_id: optionId,
        }));

        yield call([client, client.mutate], {
            mutation: SUBMIT_QUIZ_ATTEMPT,
            variables: {
                attempt_id: state.attemptId,
                answers: answersInput,
                end_time: new Date().toISOString(),
                score,
                user_id: user.user_id,
            },
        });

        yield put(submitQuizSuccess(score));

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
        yield put(submitQuizFailure(errorMessage));
    }
}
export function* watchQuizAttemptSaga() {
    yield takeLatest(startQuizAttempt.type, startQuizSaga);
    yield takeLatest(submitQuizRequest.type, submitQuizSaga);
    yield takeLatest(resetQuizAttempt.type, function* resetSaga() { });
}