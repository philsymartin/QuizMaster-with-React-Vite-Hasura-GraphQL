import { all } from 'redux-saga/effects';
import { watchAuthSaga } from './auth/authSaga';

export default function* rootSaga() {
    yield all([watchAuthSaga()]);
}
