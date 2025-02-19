import { call, put, select, takeLatest, delay, take, fork, cancel } from 'redux-saga/effects';
import { ApolloQueryResult } from '@apollo/client';
import client from '../../services/hasuraApi';
import {
    startQuizAttempt,
    setQuestions,
    setAttemptId,
    updateTimeRemaining,
    submitQuizRequest,
    submitQuizSuccess,
    submitQuizFailure,
    selectQuizAttemptState,
    startQuizAttemptError,
    resetQuizAttempt
} from './quizAttemptSlice';
import { GET_QUIZ_QUESTIONS } from '../../api/queries/quizzes';
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
    // Check if we already started this quiz
    const { currentQuiz, attemptId } = yield select(selectQuizAttemptState);
    // if true then don't restart
    if (currentQuiz?.quizId === action.payload.quizId && attemptId) {
        console.log('Quiz already started, not restarting');
        return;
    }
    try {
        const user: { user_id: number } | null = yield select((state: RootState) => state.auth.user);
        if (!user || !user.user_id) {
            throw new Error('User not authenticated');
        }
        // Create quiz attempt record
        const startAttemptResult: StartQuizAttemptResponse = yield call([client, client.mutate], {
            mutation: START_QUIZ_ATTEMPT,
            variables: {
                quiz_id: action.payload.quizId,
                user_id: user.user_id,
                start_time: new Date().toISOString()
            },
        });
        if (!startAttemptResult?.data?.insert_quiz_attempts_one?.attempt_id) {
            throw new Error('Failed to create quiz attempt');
        }
        console.log('Start attempt result:', startAttemptResult);
        const attemptId = startAttemptResult.data.insert_quiz_attempts_one.attempt_id;
        yield put(setAttemptId(attemptId));
        // Fetch questions
        console.log('Fetching questions for quiz:', action.payload.quizId);
        const questionsResult: ApolloQueryResult<any> = yield call([client, client.query], {
            query: GET_QUIZ_QUESTIONS,
            variables: { quiz_id: action.payload.quizId },
            fetchPolicy: 'no-cache',
        });
        console.log('Questions result:', questionsResult);
        if (!questionsResult.data || !questionsResult.data.questions) {
            throw new Error('Failed to fetch questions');
        }
        // Transform questions to match expected format
        const formattedQuestions = questionsResult.data.questions.map((q: any) => ({
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
        }));
        // Randomize questions order
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

        const result = yield call([client, client.mutate], {
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
    yield takeLatest(resetQuizAttempt.type, function* resetSaga() {
    });
}