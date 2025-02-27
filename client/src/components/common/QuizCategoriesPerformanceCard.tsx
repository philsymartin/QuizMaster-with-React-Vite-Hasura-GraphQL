import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useQuery} from '@apollo/client';
import { GET_QUIZZES_DATA } from '@queries/quizzes';
import { FiFilter, FiX } from 'react-icons/fi';

interface Quiz {
    quiz_id: number;
    title: string;
    average_rating: number;
    participants_count: number;
    total_questions: number;
    average_score?: {
        aggregate?: {
            avg?: {
                average_score?: number;
            };
        };
    };
}

interface QuizzesData {
    quizzes: Quiz[];
}

const QuizPerformanceCard = () => {
    const { loading, error, data } = useQuery<QuizzesData>(GET_QUIZZES_DATA);
    const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([]);
    const [showFilter, setShowFilter] = useState(false);

    // Initialize with first 5 quizzes when data loads
    useEffect(() => {
        if (data?.quizzes && data.quizzes.length > 0) {
            setSelectedQuizzes(data.quizzes.slice(0, 5).map(quiz => quiz.quiz_id));
        }
    }, [data]);

    if (loading) return <div className="p-6 text-center">Loading quiz performance data...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error loading quiz data</div>;
    if (!data?.quizzes || data.quizzes.length === 0) return <div className="p-6 text-center">No quiz data available</div>;

    // Format data for the chart
    const chartData = data.quizzes
        .filter(quiz => selectedQuizzes.includes(quiz.quiz_id))
        .map(quiz => ({
            name: `#${quiz.quiz_id}: ${quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title}`,
            avgScore: (quiz.average_score?.aggregate?.avg?.average_score || 0),
            participants: quiz.participants_count
        }));

    const toggleQuiz = (quizId: number) => {
        if (selectedQuizzes.includes(quizId)) {
            setSelectedQuizzes(selectedQuizzes.filter(id => id !== quizId));
        } else {
            setSelectedQuizzes([...selectedQuizzes, quizId]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quiz Performance Overview</h2>
                <button
                    className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => setShowFilter(!showFilter)}
                >
                    <FiFilter className="w-4 h-4 mr-1" />
                    Filter
                </button>
            </div>

            {showFilter && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Select Quizzes to Compare</span>
                        <button onClick={() => setShowFilter(false)} className="text-gray-500">
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {data.quizzes.map(quiz => (
                            <div key={quiz.quiz_id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`quiz-${quiz.quiz_id}`}
                                    checked={selectedQuizzes.includes(quiz.quiz_id)}
                                    onChange={() => toggleQuiz(quiz.quiz_id)}
                                    className="mr-2"
                                />
                                <label htmlFor={`quiz-${quiz.quiz_id}`} className="text-sm truncate">
                                    #{quiz.quiz_id}: {quiz.title}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgScore" name="Average Score (%)" fill="#8B5CF6" />
                        <Bar dataKey="participants" name="Participants" fill="#F59E0B" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {chartData.length === 0 && (
                <div className="text-center mt-4 text-gray-500">
                    Select at least one quiz to display data
                </div>
            )}
        </div>
    );
};

export default QuizPerformanceCard;