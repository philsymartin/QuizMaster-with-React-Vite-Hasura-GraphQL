import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addQuizRequest } from '@redux/quiz/quizSlice';
import { Quiz } from '../../types/quiz';
import { FiX } from 'react-icons/fi';

interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateQuizModal = ({ isOpen, onClose }: CreateQuizModalProps) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        difficulty: "Easy" | "Medium" | "Hard";
        time_limit_minutes: number;
    }>({
        title: '',
        description: '',
        difficulty: 'Easy',
        time_limit_minutes: 30,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'time_limit_minutes' ? parseInt(value) :
                name === 'difficulty' ? value as "Easy" | "Medium" | "Hard" : value,
        }));

        // Clear error when field is updated
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        if (formData.time_limit_minutes <= 0) {
            errors.time_limit_minutes = 'Time limit must be greater than 0';
        }
        return errors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const newQuiz: Omit<Quiz, "quiz_id" | "created_at" | "updated_at"> = {
            ...formData,
            total_questions: 0,
            participants_count: 0,
            average_rating: 0,
        };

        dispatch(addQuizRequest(newQuiz));
        onClose();
        setFormData({
            title: '',
            description: '',
            difficulty: 'Easy',
            time_limit_minutes: 30,
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center z-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Quiz</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border ${formErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md border ${formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Difficulty
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="time_limit_minutes"
                                    value={formData.time_limit_minutes}
                                    onChange={handleChange}
                                    min="1"
                                    className={`mt-1 block w-full rounded-md border ${formErrors.time_limit_minutes ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                />
                                {formErrors.time_limit_minutes && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.time_limit_minutes}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700 cursor-pointer"
                            >
                                Create Quiz
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateQuizModal;