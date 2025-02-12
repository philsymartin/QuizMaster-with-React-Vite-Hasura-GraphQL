// import { useState } from 'react';
// import { X, Plus, Edit, Trash2, Check } from 'lucide-react';

// interface Option {
//     option_id: number;
//     option_text: string;
// }

// interface Question {
//     question_id: number;
//     question_text: string;
//     question_type: 'multiple_choice' | 'true_false' | 'text';
//     option_ids: number[];
//     correct_option_id: number;
//     options?: Option[];
// }

// interface Quiz {
//     quiz_id: number;
//     title: string;
//     description: string;
//     difficulty: 'Easy' | 'Medium' | 'Hard';
//     time_limit_minutes: number;
//     total_questions: number;
//     questions?: Question[];
// }

// interface AdminQuizDetailsPanelProps {
//     isOpen: boolean;
//     onClose: () => void;
//     quiz: Quiz;
// }

// const AdminQuizDetailsPanel = ({ isOpen, onClose, quiz }: AdminQuizDetailsPanelProps) => {
//     const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

//     // Mock questions data
//     const mockQuestions: Question[] = [
//         {
//             question_id: 1,
//             question_text: "What is the chemical symbol for water?",
//             question_type: "multiple_choice",
//             option_ids: [1, 2, 3, 4],
//             correct_option_id: 1,
//             options: [
//                 { option_id: 1, option_text: "H2O" },
//                 { option_id: 2, option_text: "CO2" },
//                 { option_id: 3, option_text: "O2" },
//                 { option_id: 4, option_text: "N2" }
//             ]
//         },
//         {
//             question_id: 2,
//             question_text: "The Earth is flat.",
//             question_type: "true_false",
//             option_ids: [5, 6],
//             correct_option_id: 6,
//             options: [
//                 { option_id: 5, option_text: "True" },
//                 { option_id: 6, option_text: "False" }
//             ]
//         }
//     ];

//     return (
//         <>
//             {/* Overlay that only covers the panel area */}
//             {isOpen && (
//                 <div
//                     className="fixed top-16 right-0 w-96 bottom-0 bg-black/20 dark:bg-black/40 z-30"
//                     onClick={onClose}
//                 />
//             )}

//             {/* Panel */}
//             <div className={`fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
//                         shadow-xl transform transition-transform duration-300 ease-in-out z-40
//                         ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//                 {/* Header */}
//                 <div className="border-b border-gray-200 dark:border-gray-700">
//                     <div className="p-4 flex justify-between items-center">
//                         <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                             Quiz Details
//                         </h2>
//                         <button
//                             onClick={onClose}
//                             className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
//                         >
//                             <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                         </button>
//                     </div>

//                     {/* Quiz Title and Basic Info */}
//                     <div className="px-4 pb-4">
//                         <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.description}</p>
//                     </div>

//                     {/* Tabs */}
//                     <div className="flex border-b border-gray-200 dark:border-gray-700">
//                         <button
//                             className={`px-4 py-2 text-sm font-medium ${activeTab === 'questions'
//                                 ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
//                                 : 'text-gray-500 dark:text-gray-400'
//                                 }`}
//                             onClick={() => setActiveTab('questions')}
//                         >
//                             Questions
//                         </button>
//                         <button
//                             className={`px-4 py-2 text-sm font-medium ${activeTab === 'settings'
//                                 ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
//                                 : 'text-gray-500 dark:text-gray-400'
//                                 }`}
//                             onClick={() => setActiveTab('settings')}
//                         >
//                             Settings
//                         </button>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="overflow-y-auto h-[calc(100vh-16rem)] p-4">
//                     {activeTab === 'questions' ? (
//                         <div className="space-y-4">
//                             <button className="w-full flex items-center justify-center px-4 py-2 
//                                          border-2 border-dashed border-gray-300 dark:border-gray-600 
//                                          rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-500 
//                                          hover:text-purple-500 transition-colors">
//                                 <Plus className="w-5 h-5 mr-2" />
//                                 Add New Question
//                             </button>

//                             {mockQuestions.map((question, index) => (
//                                 <div key={question.question_id}
//                                     className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
//                                     <div className="flex justify-between items-start">
//                                         <div className="flex-1">
//                                             <div className="flex items-center">
//                                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
//                                                     Q{index + 1}.
//                                                 </span>
//                                                 <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                                                     {question.question_text}
//                                                 </p>
//                                             </div>
//                                             <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
//                                                 Type: {question.question_type}
//                                             </span>
//                                         </div>
//                                         <div className="flex space-x-2">
//                                             <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
//                                                 <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                                             </button>
//                                             <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
//                                                 <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     <div className="space-y-2 ml-6">
//                                         {question.options?.map((option) => (
//                                             <div key={option.option_id}
//                                                 className="flex items-center space-x-2 text-sm">
//                                                 <div className={`w-4 h-4 rounded-full flex items-center justify-center
//                                                            ${option.option_id === question.correct_option_id
//                                                         ? 'bg-green-100 dark:bg-green-900/30'
//                                                         : 'bg-gray-100 dark:bg-gray-600/30'}`}>
//                                                     {option.option_id === question.correct_option_id && (
//                                                         <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
//                                                     )}
//                                                 </div>
//                                                 <span className={`${option.option_id === question.correct_option_id
//                                                     ? 'text-green-600 dark:text-green-400 font-medium'
//                                                     : 'text-gray-600 dark:text-gray-300'}`}>
//                                                     {option.option_text}
//                                                 </span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="space-y-4">
//                             <div className="space-y-2">
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                                     Time Limit (minutes)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     value={quiz.time_limit_minutes}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
//                                          rounded-md bg-white dark:bg-gray-700 
//                                          text-gray-900 dark:text-gray-100"
//                                 />
//                             </div>
//                             <div className="space-y-2">
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                                     Difficulty
//                                 </label>
//                                 <select
//                                     value={quiz.difficulty}
//                                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
//                                          rounded-md bg-white dark:bg-gray-700 
//                                          text-gray-900 dark:text-gray-100"
//                                 >
//                                     <option value="Easy">Easy</option>
//                                     <option value="Medium">Medium</option>
//                                     <option value="Hard">Hard</option>
//                                 </select>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default AdminQuizDetailsPanel;

import { useState } from 'react';
import { X } from 'lucide-react';
import QuestionsTab from './QuestionsTab';
import SettingsTab from './SettingsTab';

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

interface Quiz {
    quiz_id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    time_limit_minutes: number;
    total_questions: number;
    questions?: Question[];
}

interface AdminQuizDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    quiz: Quiz;
}

const AdminQuizDetailsPanel = ({ isOpen, onClose, quiz }: AdminQuizDetailsPanelProps) => {
    const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

    return (
        <>
            {isOpen && (
                <div
                    className="fixed top-16 right-0 w-96 bottom-0 bg-black/20 dark:bg-black/40 z-30"
                    onClick={onClose}
                />
            )}

            <div className={`fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
                        shadow-xl transform transition-transform duration-300 ease-in-out z-40
                        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Quiz Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.description}</p>
                    </div>

                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'questions'
                                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                            onClick={() => setActiveTab('questions')}
                        >
                            Questions
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'settings'
                                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-16rem)] p-4">
                    {activeTab === 'questions' ? (
                        <QuestionsTab questions={quiz.questions || []} />
                    ) : (
                        <SettingsTab timeLimit={quiz.time_limit_minutes} difficulty={quiz.difficulty} />
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminQuizDetailsPanel;
