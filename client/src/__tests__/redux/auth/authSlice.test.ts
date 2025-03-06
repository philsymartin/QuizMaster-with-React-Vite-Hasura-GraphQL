import authReducer, {
    loginRequest, loginSuccess, loginFailure, logoutSuccess,
    refreshTokenSuccess, refreshTokenFailure, checkAuthStatus
} from '../../../redux/auth/authSlice';

describe('authSlice reducer', () => {
    const initialState = {
        user: null,
        isAuthenticated: false,
        tokenExpiration: null,
        loading: false,
        error: null,
    };

    it('should return the initial state', () => {
        expect(authReducer(undefined, { type: '' })).toEqual(initialState);
    });

    it('should handle loginRequest', () => {
        const action = loginRequest({ email: 'test@example.com', password: 'password' });
        const state = authReducer(initialState, action);
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
        const mockUser = { user_id: 1, username: 'testuser', email: 'test@example.com', role: 'admin' };
        const action = loginSuccess({ user: mockUser, expiresIn: 3600, accessToken: 'test_token' });
        const state = authReducer(initialState, action);

        expect(state.user).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
        expect(state.tokenExpiration).toBeGreaterThan(Date.now());
    });

    it('should handle loginFailure', () => {
        const errorMessage = 'Invalid credentials';
        const action = loginFailure(errorMessage);
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.isAuthenticated).toBe(false);
    });

    it('should handle logoutSuccess', () => {
        const state = authReducer(initialState, logoutSuccess());
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.tokenExpiration).toBeNull();
    });

    it('should handle refreshTokenSuccess', () => {
        const expiresIn = 3600;
        const action = refreshTokenSuccess({ expiresIn, accessToken: 'new_token' });
        const state = authReducer(initialState, action);

        expect(state.tokenExpiration).toBeGreaterThan(Date.now());
        expect(localStorage.getItem('authToken')).toBe('new_token');
    });

    it('should handle refreshTokenFailure', () => {
        const errorMessage = 'Token refresh failed';
        const action = refreshTokenFailure(errorMessage);
        const state = authReducer(initialState, action);

        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.tokenExpiration).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should handle checkAuthStatus with expired token', () => {
        localStorage.setItem('tokenExpiration', (Date.now() - 1000).toString());
        const state = authReducer(initialState, checkAuthStatus());
        expect(state.isAuthenticated).toBe(false);
    });
});
