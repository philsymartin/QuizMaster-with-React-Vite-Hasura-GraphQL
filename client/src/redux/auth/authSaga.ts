import { Effect, call, put, select, takeLatest } from 'redux-saga/effects';
import {
    loginUser, logoutUser, refreshToken,
    LoginResponse, RefreshTokenResponse
} from '@services/authServices';
import {
    loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess,
    refreshTokenSuccess, refreshTokenFailure
} from '@redux/auth/authSlice';
import { RootState, persistor } from '@redux/store';
import client from '@services/hasuraApi';
import { UPDATE_USER_STATUS } from '@mutations/usersMutate'

export function* updateUserStatus(status: string): Generator<Effect, void, any> {
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
export function* handleLogin(action: ReturnType<typeof loginRequest>): Generator<Effect, void, LoginResponse> {
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

export function* handleRefreshToken() {
    const authState: { isAuthenticated: boolean, user: any } = yield select((state: RootState) => state.auth);
    if (!authState.isAuthenticated || !authState.user) {
        console.log('User not logged in, skipping token refresh');
        return;
    }

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

export function* handleLogout(): Generator<Effect, void, void> {
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
