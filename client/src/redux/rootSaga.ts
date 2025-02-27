import { all } from 'redux-saga/effects';
import { watchAuthSaga } from '@redux/auth/authSaga';
import { watchQuizSaga } from '@redux/quiz/quizSaga';
import { watchQuizAttemptSaga } from '@redux/quiz_attempt/quizAttemptSaga';

export default function* rootSaga() {
    yield all([
        watchAuthSaga(),
        watchQuizSaga(),
        watchQuizAttemptSaga(),
    ]);
}
