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
import { useDispatch } from 'react-redux';
import { Quiz } from '../../../types/quiz';
import { updateQuizSettings } from '../../../redux/quiz/quizSlice';

interface SettingsTabProps {
    quiz: Quiz;
}

const SettingsTab = ({ quiz }: SettingsTabProps) => {
    const dispatch = useDispatch();

    const handleUpdateSettings = (field: string, value: string | number) => {
        dispatch(updateQuizSettings({
            quizId: quiz.quiz_id,
            field,
            value
        }));
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
                    value={quiz.time_limit_minutes}
                    onChange={(e) => handleUpdateSettings('time_limit_minutes', parseInt(e.target.value))}
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
                    value={quiz.difficulty}
                    onChange={(e) => handleUpdateSettings('difficulty', e.target.value)}
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
                    value={quiz.title}
                    onChange={(e) => handleUpdateSettings('title', e.target.value)}
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
                    value={quiz.description}
                    onChange={(e) => handleUpdateSettings('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-md bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:ring-2 
                             focus:ring-purple-500 focus:border-transparent"
                />
            </div>
        </div>
    );
};

export default SettingsTab;