import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';
import { call, put, select } from 'redux-saga-test-plan/matchers';

interface LoginRequestAction {
  type: 'auth/loginRequest';
  payload: {
    email: string;
    password: string;
  };
}

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

interface LoginResponse {
  user: User;
  expiresIn: number;
  accessToken: string;
  message: string;
}

interface RootState {
  auth: {
    user: User | null;
  };
}

// Simple mock for the saga function to test with proper return type annotation
// function* handleLogin(action: LoginRequestAction): Generator<any, void, any> {
//   try {
//     const response: LoginResponse = yield call(
//       loginUser,
//       action.payload.email,
//       action.payload.password
//     );

//     if (response.user && response.expiresIn) {
//       yield put({
//         type: 'auth/loginSuccess',
//         payload: {
//           user: response.user,
//           expiresIn: response.expiresIn,
//           accessToken: response.accessToken,
//         }
//       });

//       const state: RootState = yield select();
//       const userId = state.auth.user?.user_id;

//       if (userId) {
//         yield call(client.mutate, {
//           mutation: 'UPDATE_USER_STATUS',
//           variables: {
//             user_id: userId,
//             status: 'active'
//           }
//         });
//       }
//     } else {
//       yield put({
//         type: 'auth/loginFailure',
//         payload: 'Invalid response from server'
//       });
//     }
//   } catch (error: any) {
//     yield put({
//       type: 'auth/loginFailure',
//       payload: error.message || 'Login failed'
//     });
//   }
// }

const loginUser = jest.fn();
const client = { mutate: jest.fn() };

describe('Auth Sagas', () => {
  describe('handleLogin saga', () => {
    const email = 'test@example.com';
    const password = 'password123';

    const mockUser: User = {
      user_id: 123,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };

    const mockLoginResponse: LoginResponse = {
      user: mockUser,
      expiresIn: 3600,
      accessToken: 'mock-token-123',
      message: 'Login successful'
    };

    const loginRequest = (email: string, password: string): LoginRequestAction => ({
      type: 'auth/loginRequest',
      payload: { email, password }
    });

    it('should handle successful login', () => {
      const action = loginRequest(email, password);

      return expectSaga(handleLogin, action)
        .provide([
          [call(loginUser, email, password), mockLoginResponse],
          [select(), { auth: { user: mockUser } }]
        ])
        .put({
          type: 'auth/loginSuccess',
          payload: {
            user: mockUser,
            expiresIn: 3600,
            accessToken: 'mock-token-123'
          }
        })
        .call(client.mutate, {
          mutation: 'UPDATE_USER_STATUS',
          variables: {
            user_id: 123,
            status: 'active'
          }
        })
        .run();
    });

    it('should handle login with invalid server response', () => {
      const invalidResponse = {
        message: 'Partial response',
        // Missing user and expiresIn properties
      };

      const action = loginRequest(email, password);

      return expectSaga(handleLogin, action)
        .provide([
          [call(loginUser, email, password), invalidResponse]
        ])
        .put({
          type: 'auth/loginFailure',
          payload: 'Invalid response from server'
        })
        .not.call.fn(client.mutate)
        .run();
    });

    it('should handle login failure when API throws an error', () => {
      const error = new Error('Invalid credentials');

      const action = loginRequest(email, password);

      return expectSaga(handleLogin, action)
        .provide([
          [call(loginUser, email, password), throwError(error)]
        ])
        .put({
          type: 'auth/loginFailure',
          payload: 'Invalid credentials'
        })
        .not.call.fn(client.mutate)
        .run();
    });

});