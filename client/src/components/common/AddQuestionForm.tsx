import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    closeAddQuestionModal,
    addQuestionRequest,
    selectAddQuestionLoading,
    selectAddQuestionError,
    selectEditingQuestion,
    selectIsEditing,
    editQuestionRequest,
} from '../../redux/quiz/quizSlice';
import { FiMinus, FiPlus, FiX } from 'react-icons/fi';

interface AddQuestionFormProps {
    quizId: number;
    quizTitle: string;
}

interface QuestionOption {
    option_text: string;
    is_correct: boolean;
}

const AddQuestionForm = ({ quizId, quizTitle }: AddQuestionFormProps) => {
    const dispatch = useDispatch();
    const loading = useSelector(selectAddQuestionLoading);
    const error = useSelector(selectAddQuestionError);
    const editingQuestion = useSelector(selectEditingQuestion);
    const isEditing = useSelector(selectIsEditing);

    // Initialize state with editing data if available
    const [formData, setFormData] = useState<{
        question_text: string;
        question_type: 'multiple_choice' | 'true_false';
        options: QuestionOption[];
    }>(() => {
        if (editingQuestion) {
            return {
                question_text: editingQuestion.question_text,
                question_type: editingQuestion.question_type as 'multiple_choice' | 'true_false',
                options: editingQuestion.question_options?.map(qo => ({
                    option_text: qo.option.option_text,
                    is_correct: qo.is_correct
                })) || []
            };
        }
        return {
            question_text: '',
            question_type: 'multiple_choice',
            options: [
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false }
            ]
        };
    });

    const handleAddOption = () => {
        if (formData.options.length < 4) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, { option_text: '', is_correct: false }]
            }));
        }
    };

    const handleRemoveOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleOptionChange = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((opt, i) =>
                i === index ? { ...opt, [field]: value } : field === 'is_correct' ? { ...opt, is_correct: false } : opt
            )
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            quiz_id: quizId,
            question_text: formData.question_text,
            question_type: formData.question_type,
            options: formData.options
        };

        if (isEditing && editingQuestion) {
            dispatch(editQuestionRequest({
                ...payload,
                question_id: editingQuestion.question_id
            }));
        } else {
            dispatch(addQuestionRequest(payload));
        }
    };

    const handleQuestionTypeChange = (type: 'multiple_choice' | 'true_false') => {
        setFormData(prev => ({
            ...prev,
            question_type: type,
            options: type === 'true_false'
                ? [
                    { option_text: 'True', is_correct: false },
                    { option_text: 'False', is_correct: false }
                ]
                : prev.options
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {isEditing ? 'Edit Question' : 'Add Question'} - {quizTitle}
                        </h2>
                        <button
                            onClick={() => dispatch(closeAddQuestionModal())}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question Type
                            </label>
                            <select
                                value={formData.question_type}
                                onChange={(e) => handleQuestionTypeChange(e.target.value as 'multiple_choice' | 'true_false')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="true_false">True/False</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question Text
                            </label>
                            <textarea
                                value={formData.question_text}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    question_text: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Options
                            </label>
                            <div className="space-y-3">
                                {formData.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="correct_answer"
                                            checked={option.is_correct}
                                            onChange={() => handleOptionChange(index, 'is_correct', true)}
                                            className="w-4 h-4 text-purple-600"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={option.option_text}
                                            onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                                            disabled={formData.question_type === 'true_false'}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                                            placeholder={`Option ${index + 1}`}
                                            required
                                        />
                                        {formData.question_type === 'multiple_choice' && formData.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <FiMinus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {formData.question_type === 'multiple_choice' && formData.options.length < 4 && (
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="mt-3 flex items-center text-sm text-purple-600 hover:text-purple-700"
                                >
                                    <FiPlus className="w-4 h-4 mr-1" />
                                    Add Option
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => dispatch(closeAddQuestionModal())}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Question'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddQuestionForm;