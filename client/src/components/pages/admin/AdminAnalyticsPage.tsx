import React, { useState } from 'react';
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Area, AreaChart
} from 'recharts';
import {
    BarChart2, TrendingUp, PieChart as PieChartIcon, ThumbsUp, ThumbsDown,
    Users, BookOpen, MessageCircle, Calendar, ChevronDown, Download, Filter
} from 'lucide-react';

// Mock data for charts
const performanceData = [
    { name: 'Jan', avgScore: 75, completionRate: 68, participants: 120 },
    { name: 'Feb', avgScore: 78, completionRate: 72, participants: 145 },
    { name: 'Mar', avgScore: 82, completionRate: 77, participants: 160 },
    { name: 'Apr', avgScore: 79, completionRate: 75, participants: 155 },
    { name: 'May', avgScore: 85, completionRate: 80, participants: 175 },
    { name: 'Jun', avgScore: 88, completionRate: 83, participants: 190 },
];

const categoryPerformanceData = [
    { name: 'JavaScript', avgScore: 82, participants: 450 },
    { name: 'Python', avgScore: 78, participants: 380 },
    { name: 'React', avgScore: 75, participants: 320 },
    { name: 'Node.js', avgScore: 68, participants: 290 },
    { name: 'SQL', avgScore: 72, participants: 310 },
];

const sentimentData = [
    { name: 'Positive', value: 65, color: '#10B981' },
    { name: 'Neutral', value: 25, color: '#6B7280' },
    { name: 'Negative', value: 10, color: '#EF4444' },
];

const feedbackKeywords = [
    { text: 'Clear explanations', value: 25, sentiment: 'positive' },
    { text: 'Challenging', value: 18, sentiment: 'positive' },
    { text: 'Difficult', value: 15, sentiment: 'negative' },
    { text: 'Helpful', value: 22, sentiment: 'positive' },
    { text: 'Confusing questions', value: 12, sentiment: 'negative' },
    { text: 'Well-structured', value: 19, sentiment: 'positive' },
    { text: 'Too long', value: 10, sentiment: 'negative' },
    { text: 'Informative', value: 20, sentiment: 'positive' },
    { text: 'Repetitive', value: 8, sentiment: 'negative' },
];

// Recent feedback with sentiment
const recentFeedback = [
    {
        id: 1,
        user: 'John Smith',
        quiz: 'JavaScript Fundamentals',
        feedback: 'The quiz was very informative and helped me understand closures better.',
        sentiment: 'positive',
        date: '2 days ago'
    },
    {
        id: 2,
        user: 'Sarah Johnson',
        quiz: 'React Hooks',
        feedback: 'Some questions were confusing and didnt align with the course material.',
        sentiment: 'negative',
        date: '3 days ago'
    },
    {
        id: 3,
        user: 'Michael Brown',
        quiz: 'Python Basics',
        feedback: 'Good quiz overall, but could use more practical examples.',
        sentiment: 'neutral',
        date: '4 days ago'
    },
    {
        id: 4,
        user: 'Emily Davis',
        quiz: 'SQL Advanced',
        feedback: 'Excellent structure and progression of difficulty. Very well done!',
        sentiment: 'positive',
        date: '5 days ago'
    },
];

const AdminAnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState('6 months');

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Results & Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track performance metrics and feedback analysis</p>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                            <Calendar className="w-4 h-4 mr-2" />
                            {timeRange}
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance Overview</h2>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">Scores</button>
                        <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">Completion</button>
                        <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">Participants</button>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={performanceData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#6B7280" />
                            <YAxis stroke="#6B7280" />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="avgScore"
                                name="Average Score"
                                stroke="#8B5CF6"
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                            />
                            <Line type="monotone" dataKey="completionRate" name="Completion Rate" stroke="#10B981" strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="participants" name="Participants" stroke="#F59E0B" strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quiz Category Performance and Sentiment Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quiz Category Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quiz Categories Performance</h2>
                        <button className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Filter className="w-4 h-4 mr-1" />
                            Filter
                        </button>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryPerformanceData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#6B7280" />
                                <YAxis stroke="#6B7280" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="avgScore" name="Average Score" fill="#8B5CF6" />
                                <Bar dataKey="participants" name="Participants" fill="#F59E0B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sentiment Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feedback Sentiment Analysis</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Based on 542 feedback submissions
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">65%</span>
                            <span className="text-sm text-green-600 dark:text-green-400">Positive</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="w-8 h-8 flex items-center justify-center mb-2">
                                <div className="w-6 h-1 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                            </div>
                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">25%</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Neutral</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <ThumbsDown className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">10%</span>
                            <span className="text-sm text-red-600 dark:text-red-400">Negative</span>
                        </div>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sentimentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Common Feedback Keywords and Recent Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Common Feedback Keywords */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Common Feedback Keywords</h2>
                    <div className="space-y-3">
                        {feedbackKeywords.map((keyword, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${keyword.sentiment === 'positive' ? 'bg-green-500' : keyword.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 flex-1">{keyword.text}</div>
                                <div className="flex items-center">
                                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 w-32">
                                        <div
                                            className={`h-2 rounded-full ${keyword.sentiment === 'positive' ? 'bg-green-500' : keyword.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'}`}
                                            style={{ width: `${(keyword.value / 25) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{keyword.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Feedback */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Feedback</h2>
                        <button className="text-purple-600 dark:text-purple-400 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentFeedback.map((item) => (
                            <div key={item.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.user}</div>
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${item.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            item.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                    >
                                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">Quiz: </span>
                                    {item.quiz}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">"{item.feedback}"</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">{item.date}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Retention Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Retention Analysis</h2>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">Monthly</button>
                        <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">Quarterly</button>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={performanceData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#6B7280" />
                            <YAxis stroke="#6B7280" />
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="participants"
                                stroke="#8B5CF6"
                                fillOpacity={1}
                                fill="url(#colorParticipants)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;