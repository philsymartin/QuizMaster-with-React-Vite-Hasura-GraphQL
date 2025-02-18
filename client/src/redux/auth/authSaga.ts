import { Effect, call, put, takeLatest } from 'redux-saga/effects';
import {
    loginUser, logoutUser, refreshToken,
    LoginResponse, RefreshTokenResponse
} from '../../services/authServices';
import {
    loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess,
    refreshTokenSuccess, refreshTokenFailure
} from './authSlice';
import { persistor } from '../store';

function* handleLogin(action: ReturnType<typeof loginRequest>): Generator<Effect, void, LoginResponse> {
    try {
        const response: LoginResponse = yield call(loginUser, action.payload.email, action.payload.password);
        console.log('Login Response:', response);
        if (response.user && response.expiresIn) {
            yield put(loginSuccess({
                user: response.user,
                expiresIn: response.expiresIn,
                accessToken: response.accessToken,
            }));
        } else {
            yield put(loginFailure('Invalid response from server'));
        }
    } catch (error: any) {
        yield put(loginFailure(error.message || 'Login failed'));
    }
}

function* handleRefreshToken(): Generator<Effect, void, RefreshTokenResponse> {
    try {
        const response: RefreshTokenResponse = yield call(refreshToken);
        if (response.expiresIn) {
            yield put(refreshTokenSuccess({
                expiresIn: response.expiresIn,
                accessToken: response.accessToken,
            }));
        } else {
            yield put(refreshTokenFailure('Failed to refresh token'));
            yield put(logoutSuccess());
            persistor.purge(); // Clear Redux persisted state
        }
    } catch (error) {
        yield put(refreshTokenFailure('Error refreshing token'));
        yield put(logoutSuccess());
        persistor.purge();
    }
}

function* handleLogout(): Generator<Effect, void, void> {
    try {
        yield call(logoutUser);
        yield put(logoutSuccess());
    } catch (error) {
        yield put(logoutSuccess());
        console.error('Logout failed:', error);
    }
}

export function* watchAuthSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(logoutRequest.type, handleLogout);
    yield takeLatest('CHECK_TOKEN_EXPIRATION', handleRefreshToken);
}

// import { Effect, call, put, select, takeLatest } from 'redux-saga/effects';
// import {
//     loginUser, logoutUser, refreshToken,
//     LoginResponse, RefreshTokenResponse
// } from '../../services/authServices';
// import {
//     loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess,
//     refreshTokenSuccess, refreshTokenFailure
// } from './authSlice';
// import { RootState, persistor } from '../store';

// function* handleLogin(action: ReturnType<typeof loginRequest>): Generator<Effect, void, LoginResponse> {
//     try {
//         const response: LoginResponse = yield call(loginUser, action.payload.email, action.payload.password);
//         console.log('Login Response:', response);
//         if (response.user && response.expiresIn) {
//             yield put(loginSuccess({
//                 user: response.user,
//                 expiresIn: response.expiresIn
//             }));
//         } else {
//             yield put(loginFailure('Invalid response from server'));
//         }
//     } catch (error: any) {
//         yield put(loginFailure(error.message || 'Login failed'));
//     }
// }

// function* handleRefreshToken(): Generator<Effect, void, RefreshTokenResponse> {
//     try {
//         const auth: RootState['auth'] = yield select(state => state.auth);

//         // Only attempt refresh if user is authenticated
//         if (!auth.isAuthenticated) {
//             return;
//         }

//         const response: RefreshTokenResponse = yield call(refreshToken);
//         if (response.expiresIn) {
//             yield put(refreshTokenSuccess({
//                 expiresIn: response.expiresIn
//             }));
//         } else {
//             yield put(refreshTokenFailure('Failed to refresh token'));
//             yield put(logoutSuccess());
//             persistor.purge();
//         }
//     } catch (error) {
//         const auth: RootState['auth'] = yield select(state => state.auth);
//         if (auth.isAuthenticated) {
//             yield put(refreshTokenFailure('Error refreshing token'));
//             yield put(logoutSuccess());
//             persistor.purge();
//         }
//     }
// }

// function* handleLogout(): Generator<Effect, void, void> {
//     try {
//         yield call(logoutUser);
//         yield put(logoutSuccess());
//     } catch (error) {
//         yield put(logoutSuccess());
//         console.error('Logout failed:', error);
//     }
// }

// export function* watchAuthSaga() {
//     yield takeLatest(loginRequest.type, handleLogin);
//     yield takeLatest(logoutRequest.type, handleLogout);
//     yield takeLatest('CHECK_TOKEN_EXPIRATION', handleRefreshToken);
// }
