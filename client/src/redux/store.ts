import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from '@redux/auth/authSlice';
import quizReducer from '@redux/quiz/quizSlice';
import quizAttemptReducer from '@redux/quiz_attempt/quizAttemptSlice';
import rootSaga from '@redux/rootSaga';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'auth',
    storage, // Use the localStorage as the storage mechanism
    whitelist: ['user', 'isAuthenticated', 'tokenExpiration'],
};
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// to Setup the logger middleware to log actions
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
    console.log('Dispatching action:', action);
    console.log('Current state:', store.getState());
    return next(action);  // to Call the next middleware or reducer
};
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        quiz: quizReducer,
        quizAttempt: quizAttemptReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // to prevent serialization errors
            },
            thunk: false
        })
            .concat(sagaMiddleware, loggerMiddleware)
});

sagaMiddleware.run(rootSaga);

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };

