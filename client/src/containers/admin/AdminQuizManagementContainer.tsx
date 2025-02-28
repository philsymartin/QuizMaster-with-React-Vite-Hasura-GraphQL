import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_QUIZZES_BASIC, GET_QUIZ_DETAILS } from '@queries/quizzes';
import { useDispatch, useSelector } from 'react-redux';
import { deleteQuizRequest, selectLoading } from '@redux/quiz/quizSlice';
import { Quiz } from 'src/types/quiz';
import AdminQuizManagementPage from '@pages/admin/AdminQuizManagementPage';

type BasicQuiz = Pick<Quiz,
    'quiz_id' |
    'title' |
    'description' |
    'difficulty' |
    'time_limit_minutes' |
    'total_questions' |
    'participants_count' |
    'average_rating'
>;

const AdminQuizManagementContainer = () => {
    const { loading, error, data } = useQuery(GET_QUIZZES_BASIC, {
        fetchPolicy: 'network-only',
        // This makes the query not execute until rendered
        // Setting to false would cause the query to run immediately
        notifyOnNetworkStatusChange: true,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const dispatch = useDispatch();
    const isLoading = useSelector(selectLoading);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<BasicQuiz | null>(null);

    const { data: selectedQuizData } = useQuery(GET_QUIZ_DETAILS, {
        variables: { quiz_id: selectedQuizId },
        skip: !selectedQuizId,
        fetchPolicy: 'network-only'
    });

    // Filter quizzes based on search term and difficulty (only if data is loaded)
    const filteredQuizzes = data?.quizzes.filter((quiz: BasicQuiz) => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    }) ?? [];

    // Handler functions
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleDifficultyChange = (value: 'all' | 'Easy' | 'Medium' | 'Hard') => {
        setSelectedDifficulty(value);
    };

    const handleDeleteClick = (quiz: BasicQuiz) => {
        setQuizToDelete(quiz);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (quizToDelete) {
            dispatch(deleteQuizRequest(quizToDelete.quiz_id));
            setDeleteDialogOpen(false);
            setQuizToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
    };

    const handleClosePanel = () => {
        setDetailsPanelOpen(false);
        setSelectedQuizId(null);
    };

    const handleQuizSelect = (quiz: BasicQuiz, tab: 'questions' | 'settings' = 'questions') => {
        setSelectedQuizId(quiz.quiz_id);
        setActiveTab(tab);
        setDetailsPanelOpen(true);
    };

    const handleOpenCreateModal = () => {
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
    };

    return (
        <AdminQuizManagementPage
            loading={loading}
            quizzes={filteredQuizzes}
            searchTerm={searchTerm}
            selectedDifficulty={selectedDifficulty}
            detailsPanelOpen={detailsPanelOpen}
            activeTab={activeTab}
            createModalOpen={createModalOpen}
            deleteDialogOpen={deleteDialogOpen}
            quizToDelete={quizToDelete}
            isDeleteLoading={isLoading}
            selectedQuizData={selectedQuizData?.quizzes[0]}
            onSearchChange={handleSearchChange}
            onDifficultyChange={handleDifficultyChange}
            onQuizSelect={handleQuizSelect}
            onDeleteClick={handleDeleteClick}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
            onClosePanel={handleClosePanel}
            onOpenCreateModal={handleOpenCreateModal}
            onCloseCreateModal={handleCloseCreateModal}
        />
    );
};

export default AdminQuizManagementContainer;