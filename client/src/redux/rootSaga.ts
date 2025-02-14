import { all } from 'redux-saga/effects';
import { watchAuthSaga } from './auth/authSaga';
import { watchQuizSaga } from './quiz/quizSaga';

export default function* rootSaga() {
    yield all([
        watchAuthSaga(),
        watchQuizSaga()
    ]);
}
