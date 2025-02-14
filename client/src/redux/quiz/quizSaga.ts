import { call, put, takeLatest } from 'redux-saga/effects';
import client from '../../services/hasuraApi';
import {
    fetchQuizzesSuccess,
    fetchQuizzesFailure,
    fetchQuestionsSuccess,
    fetchQuizzesRequest,
    setSelectedQuiz,
    updateQuizSettings
} from './quizSlice';
import { GET_QUIZZES_WITH_TOPICS, GET_QUIZ_QUESTIONS } from '../../api/queries/quizzes';
import { Question, QuestionOption, Quiz } from '../../types/quiz';
import { ApolloQueryResult } from '@apollo/client';

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

function* fetchQuizQuestionsSaga(action: ReturnType<typeof setSelectedQuiz>) {
    try {
        const variables: QuizQueryVariables = {
            quiz_id: action.payload.quiz_id
        };

        const response: ApolloQueryResult<QuestionsQueryResponse> = yield call(
            [client, client.query],
            {
                query: GET_QUIZ_QUESTIONS,
                variables
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
        console.error('Error fetching questions:', error instanceof Error ? error.message : error);
    }
}

function* updateQuizSettingsSaga(action: ReturnType<typeof updateQuizSettings>) {
    try {
        console.log("updateQuizSettings called");
        // Implement your API call here
        // yield call(api.updateQuizSettings, action.payload);
    } catch (error) {
        console.error('Error updating quiz settings:', error);
    }
}

export function* watchQuizSaga() {
    yield takeLatest(fetchQuizzesRequest.type, fetchQuizzesSaga);
    yield takeLatest(setSelectedQuiz.type, fetchQuizQuestionsSaga);
    yield takeLatest(setSelectedQuiz.type, updateQuizSettingsSaga);
}