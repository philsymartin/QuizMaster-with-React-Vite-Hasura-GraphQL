import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question, Quiz } from '../../types/quiz';

interface QuizState {
    quizzes: Quiz[];
    loading: boolean;
    error: string | null;
    selectedQuiz: Quiz | null;
    questions: Question[];
}

const initialState: QuizState = {
    quizzes: [],
    loading: false,
    error: null,
    selectedQuiz: null,
    questions: []
};

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        fetchQuizzesRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchQuizzesSuccess: (state, action: PayloadAction<Quiz[]>) => {
            state.loading = false;
            state.quizzes = action.payload;
            state.error = null;
        },
        fetchQuizzesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
            state.quizzes = [];
        },
        setSelectedQuiz: (state, action: PayloadAction<Quiz>) => {
            state.selectedQuiz = action.payload;
            state.questions = [];
        },
        fetchQuestionsSuccess: (state, action: PayloadAction<Question[]>) => {
            state.questions = action.payload;
            state.error = null;
        },
        clearQuizState: (state) => {
            return initialState;
        },
    }
});

// Selectors
export const selectQuizState = (state: { quiz: QuizState }) => state.quiz;
export const selectQuizzes = (state: { quiz: QuizState }) => state.quiz.quizzes;
export const selectLoading = (state: { quiz: QuizState }) => state.quiz.loading;
export const selectError = (state: { quiz: QuizState }) => state.quiz.error;
export const selectSelectedQuiz = (state: { quiz: QuizState }) => state.quiz.selectedQuiz;
export const selectQuestions = (state: { quiz: QuizState }) => state.quiz.questions;
export const selectQuizWithDetails = (state: { quiz: QuizState }) => {
    const quiz = state.quiz.selectedQuiz;
    const questions = state.quiz.questions;
    return quiz ? {
        ...quiz,
        questionCount: questions.length,
        questions
    } : null;
};

export const {
    fetchQuizzesRequest,
    fetchQuizzesSuccess,
    fetchQuizzesFailure,
    setSelectedQuiz,
    fetchQuestionsSuccess,
    clearQuizState
} = quizSlice.actions;

export const updateQuizSettings = createAction<{
    quizId: number;
    field: string;
    value: string | number;
}>('quiz/updateQuizSettings');

export default quizSlice.reducer;