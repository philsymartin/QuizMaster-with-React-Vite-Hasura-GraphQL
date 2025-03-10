import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question } from 'src/types/quiz';

interface QuizAttemptState {
    currentQuiz: {
        quizId: number;
        timeLimit: number;
        totalQuestions: number;
    } | null;
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<number, number>;
    timeRemaining: number;
    isSubmitting: boolean;
    isComplete: boolean;
    score: number | null;
    error: string | null;
    attemptId: number | null;
    isInitialized: boolean;
}

const initialState: QuizAttemptState = {
    currentQuiz: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    isSubmitting: false,
    isComplete: false,
    score: null,
    error: null,
    attemptId: null,
    isInitialized: false,
};

const quizAttemptSlice = createSlice({
    name: 'quizAttempt',
    initialState,
    reducers: {
        setQuizDetails: (state, action) => {
            state.currentQuiz = action.payload;
        },
        startQuizAttempt: (state, action: PayloadAction<{
            quizId: number;
            timeLimit: number;
            totalQuestions: number;
        }>) => {
            // Always update the quiz state when starting a new attempt
            state.currentQuiz = action.payload;
            state.timeRemaining = action.payload.timeLimit * 60;
            state.isComplete = false;
            state.score = null;
            state.answers = {};
            state.currentQuestionIndex = 0;
            state.error = null;
            state.questions = [];
            state.isInitialized = false;
            state.attemptId = null;
        },
        setAttemptId: (state, action: PayloadAction<number>) => {
            state.attemptId = action.payload;
            state.isInitialized = true;
        },
        setQuestions: (state, action: PayloadAction<Question[]>) => {
            state.questions = action.payload;
        },
        updateTimeRemaining: (state, action: PayloadAction<number>) => {
            state.timeRemaining = action.payload;
            if (action.payload <= 0) {
                state.isComplete = true;
            }
        },
        answerQuestion: (state, action: PayloadAction<{
            questionId: number;
            optionId: number;
        }>) => {
            state.answers[action.payload.questionId] = action.payload.optionId;
        },
        nextQuestion: (state) => {
            if (state.currentQuestionIndex < state.questions.length - 1) {
                state.currentQuestionIndex += 1;
            }
        },
        previousQuestion: (state) => {
            if (state.currentQuestionIndex > 0) {
                state.currentQuestionIndex -= 1;
            }
        },
        submitQuizRequest: (state) => {
            state.isSubmitting = true;
            state.error = null;
        },
        submitQuizSuccess: (state, action: PayloadAction<number>) => {
            state.isSubmitting = false;
            state.isComplete = true;
            state.score = action.payload;
        },
        submitQuizFailure: (state, action: PayloadAction<string>) => {
            state.isSubmitting = false;
            state.error = action.payload;
        },
        startQuizAttemptError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isInitialized = false;
        },
        endQuizEarly: (state) => {
            state.isComplete = true;
            state.isSubmitting = true;
        },
        resetQuizAttempt: () => initialState,
    },
});

// Selectors
export const selectQuizAttemptState = (state: { quizAttempt: QuizAttemptState }) => state.quizAttempt;
export const selectCurrentQuestion = (state: { quizAttempt: QuizAttemptState }) =>
    state.quizAttempt.questions[state.quizAttempt.currentQuestionIndex];
export const selectTimeRemaining = (state: { quizAttempt: QuizAttemptState }) =>
    state.quizAttempt.timeRemaining;
export const selectIsComplete = (state: { quizAttempt: QuizAttemptState }) =>
    state.quizAttempt.isComplete;
export const selectQuizScore = (state: { quizAttempt: QuizAttemptState }) =>
    state.quizAttempt.score;

export const {
    setQuizDetails,
    startQuizAttempt,
    setAttemptId,
    setQuestions,
    updateTimeRemaining,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuizRequest,
    submitQuizSuccess,
    submitQuizFailure,
    resetQuizAttempt,
    startQuizAttemptError,
    endQuizEarly,
} = quizAttemptSlice.actions;

export default quizAttemptSlice.reducer;