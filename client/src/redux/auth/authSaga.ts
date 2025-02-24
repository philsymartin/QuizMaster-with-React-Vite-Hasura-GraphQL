import { Effect, call, put, select, takeLatest } from 'redux-saga/effects';
import {
    loginUser, logoutUser, refreshToken,
    LoginResponse, RefreshTokenResponse
} from '../../services/authServices';
import {
    loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess,
    refreshTokenSuccess, refreshTokenFailure
} from './authSlice';
import { RootState, persistor } from '../store';
import client from '../../services/hasuraApi';
import { UPDATE_USER_STATUS } from '../../api/mutations/usersMutate'

function* updateUserStatus(status: string): Generator<Effect, void, any> {
    const state: RootState = yield select();
    const userId = state.auth.user?.user_id;

    if (userId) {
        try {
            yield call(client.mutate, ({
                mutation: UPDATE_USER_STATUS,
                variables: {
                    user_id: userId,
                    status: status
                }
            }));
        } catch (error) {
            console.error(`Failed to update user status to ${status}:`, error);
        }
    }
}
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
            yield call(updateUserStatus, 'active');
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
            yield call(updateUserStatus, 'inactive');
            yield put(refreshTokenFailure('Failed to refresh token'));
            yield put(logoutSuccess());
            persistor.purge();
        }
    } catch (error) {
        yield call(updateUserStatus, 'inactive');
        yield put(refreshTokenFailure('Error refreshing token'));
        yield put(logoutSuccess());
        persistor.purge();
    }
}

function* handleLogout(): Generator<Effect, void, void> {
    try {
        yield call(updateUserStatus, 'inactive');
        yield call(logoutUser);
        yield put(logoutSuccess());
    } catch (error) {
        yield call(updateUserStatus, 'inactive');
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
