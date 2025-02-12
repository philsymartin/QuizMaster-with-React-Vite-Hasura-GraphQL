import { Plus, Edit, Trash2, Check } from 'lucide-react';

interface Option {
    option_id: number;
    option_text: string;
}

interface Question {
    question_id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'text';
    option_ids: number[];
    correct_option_id: number;
    options?: Option[];
}

interface QuestionsTabProps {
    questions: Question[];
}

const QuestionsTab = ({ questions }: QuestionsTabProps) => {
    return (
        <div className="space-y-4">
            <button className="w-full flex items-center justify-center px-4 py-2 
                                border-2 border-dashed border-gray-300 dark:border-gray-600 
                                rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-500 
                                hover:text-purple-500 transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                Add New Question
            </button>

            {questions.map((question, index) => (
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
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 ml-6">
                        {question.options?.map((option) => (
                            <div key={option.option_id} className="flex items-center space-x-2 text-sm">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center
                                               ${option.option_id === question.correct_option_id
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-gray-100 dark:bg-gray-600/30'}`}>
                                    {option.option_id === question.correct_option_id && (
                                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                                <span className={`${option.option_id === question.correct_option_id
                                    ? 'text-green-600 dark:text-green-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300'}`}>
                                    {option.option_text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestionsTab;
