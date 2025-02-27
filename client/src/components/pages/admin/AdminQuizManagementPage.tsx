
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_QUIZZES_BASIC, GET_QUIZ_DETAILS } from '@queries/quizzes';
import AdminQuizDetailsPanel from '@components/AdminQuizDetailsPanel';
import CreateQuizModal from '@components/CreateQuizModal';
import { Quiz } from '../../../types/quiz';
import { deleteQuizRequest, selectLoading } from '../../../redux/quiz/quizSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FiBookOpen, FiEdit, FiPlus, FiSearch, FiSettings, FiTrash2 } from 'react-icons/fi';

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

const AdminQuizManagementPage = () => {
    const { loading, error, data } = useQuery(GET_QUIZZES_BASIC, {
        fetchPolicy: 'network-only',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { data: selectedQuizData } = useQuery(GET_QUIZ_DETAILS, {
        variables: { quiz_id: selectedQuizId },
        skip: !selectedQuizId,
        fetchPolicy: 'network-only'
    });
    // Add state for confirm dialog
    const dispatch = useDispatch();
    const isLoading = useSelector(selectLoading);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<BasicQuiz | null>(null);
    // Handle delete click
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

    // New function to open the create quiz modal
    const handleOpenCreateModal = () => {
        setCreateModalOpen(true);
    };

    // Function to close the create quiz modal
    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
    };

    // Use the fetched data with proper typing
    const filteredQuizzes = data?.quizzes.filter((quiz: BasicQuiz) => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    }) ?? [];
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return '';
        }
    };
    const tableHeaders = [
        { label: "Quiz Info", align: "text-left" },
        { label: "Difficulty", align: "text-left" },
        { label: "Questions", align: "text-left" },
        { label: "Time Limit", align: "text-left" },
        { label: "Stats", align: "text-left" },
        { label: "Actions", align: "text-right" },
    ];
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage your quizzes</p>
                </div>
                <button
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={handleOpenCreateModal} // Add click handler
                >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Create New Quiz
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search quizzes..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'Easy' | 'Medium' | 'Hard')}
                >
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            {/* Quizzes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th
                                        key={index}
                                        className={`px-6 py-3 ${header.align} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                                    >
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuizzes.map((quiz: BasicQuiz) => (
                                <tr key={quiz.quiz_id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <FiBookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div
                                                    className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                                                    onClick={() => handleQuizSelect(quiz)}
                                                >
                                                    {quiz.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{quiz.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                                            {quiz.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {quiz.total_questions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {quiz.time_limit_minutes} minutes
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{quiz.participants_count} participants</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{quiz.average_rating.toFixed(1)} avg rating</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleQuizSelect(quiz, 'questions')}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                title="Edit Questions"
                                            >
                                                <FiEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                onClick={() => handleQuizSelect(quiz, 'settings')}
                                                title="Edit Settings"
                                            >
                                                <FiSettings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                onClick={() => handleDeleteClick(quiz)}
                                                title="Delete Quiz"
                                            >
                                                <FiTrash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quiz Details Panel */}
            {detailsPanelOpen && selectedQuizData?.quizzes[0] && (
                <AdminQuizDetailsPanel
                    isOpen={detailsPanelOpen}
                    quiz={selectedQuizData.quizzes[0]}
                    onClose={handleClosePanel}
                    initialTab={activeTab}
                />
            )}

            {/* Create Quiz Modal */}
            <CreateQuizModal
                isOpen={createModalOpen}
                onClose={handleCloseCreateModal}
            />
            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Delete Quiz</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone and will remove all questions, attempts, and feedback associated with this quiz.
                        </p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuizManagementPage;