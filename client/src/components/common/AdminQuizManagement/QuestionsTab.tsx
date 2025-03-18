import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FiCheck, FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import AddQuestionForm from "@components/AdminQuizManagement/AddQuestionForm";
import { Question } from "src/types/quiz";
import {
  deleteQuestionRequest,
  openAddQuestionModal,
  selectAddQuestionModalOpen,
  selectDeleteQuestionError,
  selectDeleteQuestionLoading,
  selectQuestions,
  selectSelectedQuiz,
  setEditingQuestion,
} from "@redux/quiz/quizSlice";
import DeleteConfirmationModal from "@components/DeleteConfirmationModal";

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
  }, [isDeleting, deleteError, questionToDelete]);

  const handleAddQuestion = () => {
    dispatch(setEditingQuestion(null));
    dispatch(openAddQuestionModal());
  };
  const handleEditQuestion = (questionId: number) => {
    const questionToEdit = questions.find((q) => q.question_id === questionId);
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
                          hover:text-purple-500 transition-colors cursor-pointer"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add New Question
        </button>

        {quizQuestions.map((question, index) => (
          <div
            key={question.question_id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3"
          >
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
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                >
                  <FiEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => openDeleteModal(question.question_id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                >
                  <FiTrash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 ml-6">
              {question.question_options?.map((qOption) => (
                <div
                  key={qOption.option.option_id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center
                                               ${qOption.is_correct
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-100 dark:bg-gray-600/30"
                      }`}
                  >
                    {qOption.is_correct && (
                      <FiCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <span
                    className={`${qOption.is_correct
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-gray-600 dark:text-gray-300"
                      }`}
                  >
                    {qOption.option.option_text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* delete confirmation dialog  */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteQuestion}
        itemName="this question"
        isLoading={isDeleting}
        deleteButtonText="Delete Question"
        warningMessage="This action cannot be undone."
      />

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
