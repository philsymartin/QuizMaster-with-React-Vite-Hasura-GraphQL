import { useState } from 'react';
import { Search, Edit, Trash2, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_QUIZZES_BASIC, GET_QUIZ_DETAILS } from '../../../api/queries/quizzes';
import AdminQuizDetailsPanel from '../../components/adminQuizPanel/AdminQuizDetailsPanel';
import { Quiz } from '../../../types/quiz';

// Create a type for the basic quiz data that matches GET_QUIZZES_BASIC query
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
        fetchPolicy: 'cache-and-network',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

    // Separate query for fetching detailed quiz data
    const { data: selectedQuizData } = useQuery(GET_QUIZ_DETAILS, {
        variables: { quiz_id: selectedQuizId },
        skip: !selectedQuizId,
        fetchPolicy: 'network-only'
    });

    const handleClosePanel = () => {
        setDetailsPanelOpen(false);
        setSelectedQuizId(null);
    };

    const handleQuizSelect = (quiz: BasicQuiz) => {
        setSelectedQuizId(quiz.quiz_id);
        setDetailsPanelOpen(true);
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

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage your quizzes</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Quiz
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quiz Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time Limit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredQuizzes.map((quiz: BasicQuiz) => (
                                <tr key={quiz.quiz_id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{quiz.title}</div>
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
                                                onClick={() => handleQuizSelect(quiz)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
                />
            )}
        </div>
    );
};

export default AdminQuizManagementPage;