export type BasicQuiz = Pick<Quiz,
    'quiz_id' |
    'title' |
    'description' |
    'difficulty' |
    'time_limit_minutes' |
    'total_questions' |
    'participants_count' |
    'average_rating'
>;

export interface AdminQuizManagementPageProps {
    loading: boolean;
    quizzes: BasicQuiz[];
    searchTerm: string;
    selectedDifficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
    detailsPanelOpen: boolean;
    activeTab: 'questions' | 'settings';
    createModalOpen: boolean;
    deleteDialogOpen: boolean;
    quizToDelete: BasicQuiz | null;
    isDeleteLoading: boolean;
    selectedQuizData: Quiz | undefined;
    onSearchChange: (value: string) => void;
    onDifficultyChange: (value: 'all' | 'Easy' | 'Medium' | 'Hard') => void;
    onQuizSelect: (quiz: BasicQuiz, tab?: 'questions' | 'settings') => void;
    onDeleteClick: (quiz: BasicQuiz) => void;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    onClosePanel: () => void;
    onOpenCreateModal: () => void;
    onCloseCreateModal: () => void;
}