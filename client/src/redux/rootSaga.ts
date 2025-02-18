import { all } from 'redux-saga/effects';
import { watchAuthSaga } from './auth/authSaga';
import { watchQuizSaga } from './quiz/quizSaga';
import { watchQuizAttemptSaga } from './quiz_attempt/quizAttemptSaga';

export default function* rootSaga() {
    yield all([
        watchAuthSaga(),
        watchQuizSaga(),
        watchQuizAttemptSaga(),
    ]);
}
