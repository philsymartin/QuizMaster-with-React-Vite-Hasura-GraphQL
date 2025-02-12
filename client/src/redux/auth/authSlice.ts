// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface AuthState {
//     user: { username: string; email: string; role: string } | null;
//     isAuthenticated: boolean;
//     tokenExpiration: number | null;
//     loading: boolean;
//     error: string | null;
// }

// const initialState: AuthState = {
//     user: (() => {
//         const user = localStorage.getItem('user');
//         try {
//             return user ? JSON.parse(user) : null;
//         } catch (e) {
//             console.error("Error parsing user data from localStorage", e);
//             return null;
//         }
//     })(),
//     isAuthenticated: false,
//     tokenExpiration: null,
//     loading: false,
//     error: null,
// };

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         loginRequest: (state, action: PayloadAction<{ email: string; password: string }>) => {
//             state.loading = true;
//             state.error = null;
//             console.log(action.payload);
//         },
//         loginSuccess: (state, action: PayloadAction<{ user: AuthState['user']; expiresIn: number }>) => {
//             state.loading = false;
//             state.user = action.payload.user;
//             state.isAuthenticated = true;
//             state.tokenExpiration = Date.now() + (action.payload.expiresIn * 1000);

//             localStorage.setItem('user', JSON.stringify(action.payload.user));
//             localStorage.setItem('tokenExpiration', state.tokenExpiration.toString());
//         },
//         loginFailure: (state, action: PayloadAction<string>) => {
//             state.loading = false;
//             state.error = action.payload;
//             state.isAuthenticated = false;
//         },
//         logoutRequest: (state) => {
//             state.loading = true;
//         },
//         logoutSuccess: (state) => {
//             state.loading = false;
//             state.user = null;
//             state.isAuthenticated = false;
//             state.tokenExpiration = null;
//             localStorage.removeItem('user');
//             localStorage.removeItem('tokenExpiration');
//         },
//         refreshTokenSuccess: (state, action: PayloadAction<{ expiresIn: number }>) => {
//             state.loading = false;
//             state.tokenExpiration = Date.now() + (action.payload.expiresIn * 1000);
//             localStorage.setItem('tokenExpiration', state.tokenExpiration.toString());
//         },
//         refreshTokenFailure: (state, action: PayloadAction<string>) => {
//             state.user = null;
//             state.isAuthenticated = false;
//             state.tokenExpiration = null;
//             localStorage.removeItem('user');
//             localStorage.removeItem('tokenExpiration');
//             state.loading = false;
//             state.error = action.payload;
//         },
//         checkAuthStatus: (state) => {
//             const tokenExpiration = localStorage.getItem('tokenExpiration');
//             const user = localStorage.getItem('user');

//             if (tokenExpiration && user) {
//                 const expirationTime = parseInt(tokenExpiration);
//                 if (Date.now() < expirationTime) {
//                     state.isAuthenticated = true;
//                     state.user = JSON.parse(user);
//                     state.tokenExpiration = expirationTime;
//                 } else {
//                     state.isAuthenticated = false;
//                 }
//             } else {
//                 state.isAuthenticated = false;
//             }
//         },
//     },
// });

// export const { loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess,
//     refreshTokenSuccess, refreshTokenFailure, checkAuthStatus } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: { username: string; email: string; role: string } | null;
    isAuthenticated: boolean;
    tokenExpiration: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: (() => {
        const user = localStorage.getItem('user');
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            console.error("Error parsing user data from localStorage", e);
            return null;
        }
    })(),
    isAuthenticated: false,
    tokenExpiration: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest: (state, action: PayloadAction<{ email: string; password: string }>) => {
            state.loading = true;
            state.error = null;
            console.log(action.payload);
        },
        loginSuccess: (state, action: PayloadAction<{ user: AuthState['user']; expiresIn: number }>) => {
            state.loading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.tokenExpiration = Date.now() + (action.payload.expiresIn * 1000);

            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('tokenExpiration', state.tokenExpiration.toString());
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },
        logoutRequest: (state) => {
            state.loading = true;
        },
        logoutSuccess: (state) => {
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.tokenExpiration = null;
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiration');
        },
        refreshTokenSuccess: (state, action: PayloadAction<{ expiresIn: number }>) => {
            state.loading = false;
            state.tokenExpiration = Date.now() + (action.payload.expiresIn * 1000);
            localStorage.setItem('tokenExpiration', state.tokenExpiration.toString());
        },
        refreshTokenFailure: (state, action: PayloadAction<string>) => {
            state.user = null;
            state.isAuthenticated = false;
            state.tokenExpiration = null;
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiration');
            state.loading = false;
            state.error = action.payload;
        },
        checkAuthStatus: (state) => {
            const tokenExpiration = localStorage.getItem('tokenExpiration');
            const user = localStorage.getItem('user');

            if (tokenExpiration && user) {
                const expirationTime = parseInt(tokenExpiration);
                if (Date.now() < expirationTime) {
                    state.isAuthenticated = true;
                    state.user = JSON.parse(user);
                    state.tokenExpiration = expirationTime;
                } else {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.tokenExpiration = null;
                    localStorage.removeItem('user');
                    localStorage.removeItem('tokenExpiration');
                }
            } else {
                state.isAuthenticated = false;
                state.user = null;
                state.tokenExpiration = null;
            }
        },
    },
});

export const { loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess,
    refreshTokenSuccess, refreshTokenFailure, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;
