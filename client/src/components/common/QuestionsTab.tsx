import { useDispatch, useSelector } from 'react-redux';
import { Question } from 'src/types/quiz';
import {
    deleteQuestionRequest, openAddQuestionModal, selectAddQuestionModalOpen,
    selectDeleteQuestionError,
    selectDeleteQuestionLoading, selectQuestions, selectSelectedQuiz, setEditingQuestion,
} from '@redux/quiz/quizSlice';
import AddQuestionForm from '@components/AddQuestionForm';
import { useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';

interface QuestionsTabProps {
    questions: Question[];
}

const QuestionsTab = ({ questions }: QuestionsTabProps) => {
    const dispatch = useDispatch();
    const quizQuestions = useSelector(selectQuestions);
    const showAddForm = useSelector(selectAddQuestionModalOpen);
    const selectedQuiz = useSelector(selectSelectedQuiz);
    const isDeleting = useSelector(selectDeleteQuestionLoading);
    const deleteError = useSelector(selectDeleteQuestionError);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (!isDeleting && questionToDelete && !deleteError) {
            closeDeleteModal();
        }
    }, [isDeleting, deleteError]);

    const handleAddQuestion = () => {
        dispatch(setEditingQuestion(null));
        dispatch(openAddQuestionModal());
    };
    const handleEditQuestion = (questionId: number) => {
        const questionToEdit = questions.find(q => q.question_id === questionId);
        if (questionToEdit) {
            dispatch(setEditingQuestion(questionToEdit));
            dispatch(openAddQuestionModal());
        }
    };
    const openDeleteModal = (questionId: number) => {
        setQuestionToDelete(questionId);
        setShowDeleteModal(true);
    };
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    };
    const handleDeleteQuestion = () => {
        if (questionToDelete !== null) {
            dispatch(deleteQuestionRequest(questionToDelete));
        }
    };

    return (
        <>
            <div className="space-y-4">
                <button
                    onClick={handleAddQuestion}
                    className="w-full flex items-center justify-center px-4 py-2 
                          border-2 border-dashed border-gray-300 dark:border-gray-600 
                          rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-500 
                          hover:text-purple-500 transition-colors">
                    <FiPlus className="w-5 h-5 mr-2" />
                    Add New Question
                </button>

                {quizQuestions.map((question, index) => (
                    <div key={question.question_id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                                        Q{index + 1}.
                                    </span>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {question.question_text}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                    Type: {question.question_type}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditQuestion(question.question_id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                    <FiEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(question.question_id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                    <FiTrash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 ml-6">
                            {question.question_options?.map((qOption) => (
                                <div key={qOption.option.option_id} className="flex items-center space-x-2 text-sm">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center
                                               ${qOption.is_correct
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-gray-100 dark:bg-gray-600/30'}`}>
                                        {qOption.is_correct && (
                                            <FiCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        )}
                                    </div>
                                    <span className={`${qOption.is_correct
                                        ? 'text-green-600 dark:text-green-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-300'}`}>
                                        {qOption.option.option_text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Delete Question
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete this question? This action cannot be undone.
                        </p>
                        {deleteError && (
                            <p className="text-red-500 text-sm mb-4">
                                Error: {deleteError}
                            </p>
                        )}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                                         bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 
                                         dark:hover:bg-gray-600 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteQuestion}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                                         rounded-md hover:bg-red-700 focus:outline-none 
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showAddForm && selectedQuiz && (
                <AddQuestionForm
                    quizId={selectedQuiz.quiz_id}
                    quizTitle={selectedQuiz.title}
                />
            )}

        </>
    );
};

export default QuestionsTab;