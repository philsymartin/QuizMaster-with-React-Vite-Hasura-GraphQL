import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './auth/authSlice';
import quizReducer from './quiz/quizSlice';
import rootSaga from './rootSaga';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Setup redux-persist configuration
const persistConfig = {
    key: 'auth',
    storage, // Use the localStorage as the storage mechanism
    whitelist: ['user', 'isAuthenticated', 'tokenExpiration'],
};

// Persisted reducer for auth
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Setup the logger middleware to log actions
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
    console.log('Dispatching action:', action);
    console.log('Current state:', store.getState());
    return next(action);  // Call the next middleware or reducer
};
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        quiz: quizReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Add this to prevent serialization errors
            },
            thunk: false
        })
            .concat(sagaMiddleware)
            .concat(loggerMiddleware),
});

sagaMiddleware.run(rootSaga);

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };

