// import { useState } from 'react';
// import { X } from 'lucide-react';
// import QuestionsTab from './QuestionsTab';
// import SettingsTab from './SettingsTab';

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

//     return (
//         <>
//             {isOpen && (
//                 <div
//                     className="fixed top-16 right-0 w-96 bottom-0 bg-black/20 dark:bg-black/40 z-30"
//                     onClick={onClose}
//                 />
//             )}

//             <div className={`fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
//                         shadow-xl transform transition-transform duration-300 ease-in-out z-40
//                         ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

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

//                     <div className="px-4 pb-4">
//                         <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.description}</p>
//                     </div>

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

//                 <div className="overflow-y-auto h-[calc(100vh-16rem)] p-4">
//                     {activeTab === 'questions' ? (
//                         <QuestionsTab questions={quiz.questions || []} />
//                     ) : (
//                         <SettingsTab timeLimit={quiz.time_limit_minutes} difficulty={quiz.difficulty} />
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default AdminQuizDetailsPanel;
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import QuestionsTab from './QuestionsTab';
import SettingsTab from './SettingsTab';
import { Quiz } from '../../../types/quiz';
import {
    selectQuestions,
    setSelectedQuiz,
    selectLoading,
    selectError
} from '../../../redux/quiz/quizSlice';

interface AdminQuizDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    quiz: Quiz;
}

const AdminQuizDetailsPanel = ({ isOpen, onClose, quiz }: AdminQuizDetailsPanelProps) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
    const questions = useSelector(selectQuestions);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        if (isOpen && quiz) {
            dispatch(setSelectedQuiz(quiz));
        }
    }, [dispatch, isOpen, quiz]);

    if (loading) {
        return <div className="p-4">Loading quiz details...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

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
                        <QuestionsTab questions={questions} />
                    ) : (
                        <SettingsTab quiz={quiz} />
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminQuizDetailsPanel;