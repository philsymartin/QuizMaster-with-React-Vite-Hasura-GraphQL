import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditQuestionPayload, NewQuestion, Question, Quiz } from '../../types/quiz';

interface QuizState {
    quizzes: Quiz[];
    loading: boolean;
    error: string | null;
    selectedQuiz: Quiz | null;
    questions: Question[];
    addQuestionModalOpen: boolean;
    addQuestionLoading: boolean;
    addQuestionError: string | null;
    deleteQuestionLoading: boolean;
    deleteQuestionError: string | null;
    editingQuestion: Question | null;
    isEditing: boolean;
    updateSettingsLoading: boolean;
    updateSettingsError: string | null;
}

const initialState: QuizState = {
    quizzes: [],
    loading: false,
    error: null,
    selectedQuiz: null,
    questions: [],
    addQuestionModalOpen: false,
    addQuestionLoading: false,
    addQuestionError: null,
    deleteQuestionLoading: false,
    deleteQuestionError: null,
    editingQuestion: null,
    isEditing: false,
    updateSettingsLoading: false,
    updateSettingsError: null,
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
        openAddQuestionModal: (state) => {
            state.addQuestionModalOpen = true;
            state.addQuestionError = null;
        },
        closeAddQuestionModal: (state) => {
            state.addQuestionModalOpen = false;
            state.addQuestionError = null;
            state.editingQuestion = null;
            state.isEditing = false;
        },
        addQuestionRequest: (state, action: PayloadAction<NewQuestion>) => {
            state.addQuestionLoading = true;
            state.addQuestionError = null;
        },
        addQuestionSuccess: (state, action: PayloadAction<Question>) => {
            state.questions = [...state.questions, action.payload];
            state.addQuestionLoading = false;
            state.addQuestionModalOpen = false;
        },
        addQuestionFailure: (state, action: PayloadAction<string>) => {
            state.addQuestionLoading = false;
            state.addQuestionError = action.payload;
        },
        deleteQuestionRequest: (state, action: PayloadAction<number>) => {
            state.deleteQuestionLoading = true;
            state.deleteQuestionError = null;
        },
        deleteQuestionSuccess: (state, action: PayloadAction<number>) => {
            state.questions = state.questions.filter(
                question => question.question_id !== action.payload
            );
            state.deleteQuestionLoading = false;
        },
        deleteQuestionFailure: (state, action: PayloadAction<string>) => {
            state.deleteQuestionLoading = false;
            state.deleteQuestionError = action.payload;
        },
        editQuestionRequest: (state, action: PayloadAction<EditQuestionPayload>) => {
            state.addQuestionLoading = true;
            state.addQuestionError = null;
        },
        setEditingQuestion: (state, action: PayloadAction<Question | null>) => {
            state.editingQuestion = action.payload;
            state.isEditing = action.payload !== null;
        },
        editQuestionSuccess: (state, action: PayloadAction<Question>) => {
            state.questions = state.questions.map(question =>
                question.question_id === action.payload.question_id
                    ? action.payload
                    : question
            );
            state.addQuestionLoading = false;
            state.addQuestionModalOpen = false;
        },
        editQuestionFailure: (state, action: PayloadAction<string>) => {
            state.addQuestionLoading = false;
            state.addQuestionError = action.payload;
        },
        updateQuizSettingsRequest: (state, action: PayloadAction<{
            quizId: number;
            field: string;
            value: string | number;
        }>) => {
            state.updateSettingsLoading = true;
            state.updateSettingsError = null;
        },
        updateQuizSettingsSuccess: (state, action: PayloadAction<Quiz>) => {
            state.updateSettingsLoading = false;
            if (state.selectedQuiz && state.selectedQuiz.quiz_id === action.payload.quiz_id) {
                state.selectedQuiz = action.payload;
            }
            state.quizzes = state.quizzes.map(quiz =>
                quiz.quiz_id === action.payload.quiz_id ? action.payload : quiz
            );
        },
        updateQuizSettingsFailure: (state, action: PayloadAction<string>) => {
            state.updateSettingsLoading = false;
            state.updateSettingsError = action.payload;
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
export const selectAddQuestionModalOpen = (state: { quiz: QuizState }) => state.quiz.addQuestionModalOpen;
export const selectAddQuestionLoading = (state: { quiz: QuizState }) => state.quiz.addQuestionLoading;
export const selectAddQuestionError = (state: { quiz: QuizState }) => state.quiz.addQuestionError;
export const selectDeleteQuestionLoading = (state: { quiz: QuizState }) => state.quiz.deleteQuestionLoading;
export const selectDeleteQuestionError = (state: { quiz: QuizState }) => state.quiz.deleteQuestionError;
export const selectEditingQuestion = (state: { quiz: QuizState }) => state.quiz.editingQuestion;
export const selectIsEditing = (state: { quiz: QuizState }) => state.quiz.isEditing;
export const selectUpdateSettingsLoading = (state: { quiz: QuizState }) => state.quiz.updateSettingsLoading;
export const selectUpdateSettingsError = (state: { quiz: QuizState }) => state.quiz.updateSettingsError;

export const {
    fetchQuizzesRequest,
    fetchQuizzesSuccess,
    fetchQuizzesFailure,
    setSelectedQuiz,
    fetchQuestionsSuccess,
    clearQuizState,
    openAddQuestionModal,
    closeAddQuestionModal,
    addQuestionRequest,
    addQuestionSuccess,
    addQuestionFailure,
    deleteQuestionRequest,
    deleteQuestionSuccess,
    deleteQuestionFailure,
    editQuestionRequest,
    editQuestionSuccess,
    editQuestionFailure,
    setEditingQuestion,
    updateQuizSettingsRequest,
    updateQuizSettingsSuccess,
    updateQuizSettingsFailure,
} = quizSlice.actions;

export const updateQuizSettings = createAction<{
    quizId: number;
    field: string;
    value: string | number;
}>('quiz/updateQuizSettingsRequest');

export default quizSlice.reducer;