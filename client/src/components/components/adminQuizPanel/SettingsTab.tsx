// import { useDispatch } from 'react-redux';
// import { Quiz } from '../../../types/quiz';
// import { updateQuizSettings } from '../../../redux/quiz/quizSlice';

// interface SettingsTabProps {
//     quiz: Quiz;
// }

// const SettingsTab = ({ quiz }: SettingsTabProps) => {
//     const dispatch = useDispatch();

//     const handleUpdateSettings = (field: string, value: string | number) => {
//         dispatch(updateQuizSettings({
//             quizId: quiz.quiz_id,
//             field,
//             value
//         }));
//     };

//     return (
//         <div className="space-y-4">
//             <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Time Limit (minutes)
//                 </label>
//                 <input
//                     type="number"
//                     value={quiz.time_limit_minutes}
//                     onChange={(e) => handleUpdateSettings('time_limit_minutes', parseInt(e.target.value))}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
//                              rounded-md bg-white dark:bg-gray-700
//                              text-gray-900 dark:text-gray-100"
//                 />
//             </div>
//             <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Difficulty
//                 </label>
//                 <select
//                     value={quiz.difficulty}
//                     onChange={(e) => handleUpdateSettings('difficulty', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
//                              rounded-md bg-white dark:bg-gray-700
//                              text-gray-900 dark:text-gray-100"
//                 >
//                     <option value="Easy">Easy</option>
//                     <option value="Medium">Medium</option>
//                     <option value="Hard">Hard</option>
//                 </select>
//             </div>
//         </div>
//     );
// };

// export default SettingsTab;
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Quiz } from '../../../types/quiz';
import { updateQuizSettings, selectUpdateSettingsLoading, selectUpdateSettingsError } from '../../../redux/quiz/quizSlice';

interface SettingsTabProps {
    quiz: Quiz;
}

const SettingsTab = ({ quiz }: SettingsTabProps) => {
    const dispatch = useDispatch();
    const isLoading = useSelector(selectUpdateSettingsLoading);
    const error = useSelector(selectUpdateSettingsError);
    const [formValues, setFormValues] = useState({
        time_limit_minutes: quiz.time_limit_minutes,
        difficulty: quiz.difficulty,
        title: quiz.title,
        description: quiz.description
    });
    const [hasChanges, setHasChanges] = useState(false);
    useEffect(() => {
        setFormValues({
            time_limit_minutes: quiz.time_limit_minutes,
            difficulty: quiz.difficulty,
            title: quiz.title,
            description: quiz.description
        });
        setHasChanges(false);
    }, [quiz]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        Object.entries(formValues).forEach(([field, value]) => {
            if (value !== quiz[field as keyof Quiz]) {
                dispatch(updateQuizSettings({
                    quizId: quiz.quiz_id,
                    field,
                    value
                }));
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label
                    htmlFor="timeLimit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Time Limit (minutes)
                </label>
                <input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={formValues.time_limit_minutes}
                    onChange={(e) => handleInputChange('time_limit_minutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:ring-2 
                             focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Difficulty
                </label>
                <select
                    id="difficulty"
                    value={formValues.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:ring-2 
                             focus:ring-purple-500 focus:border-transparent"
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Quiz Title
                </label>
                <input
                    id="title"
                    type="text"
                    value={formValues.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:ring-2 
                             focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    value={formValues.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:ring-2 
                             focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    Error: {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || isLoading}
                    className={`px-4 py-2 rounded-md font-medium ${hasChanges && !isLoading
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default SettingsTab;