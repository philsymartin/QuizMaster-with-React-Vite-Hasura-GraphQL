import React, { Suspense, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiClock, FiLogIn, FiStar, FiUsers } from 'react-icons/fi';
import { FaBrain } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { GET_QUIZ_DETAILS } from '@queries/quizzes';
import LoadingComponent from '@utils/LoadingSpinner';
import { RootState } from '@redux/store';
import { RoomProvider, getRoomId } from '@services/liveblocks';
import { LiveObject } from '@liveblocks/client';
import { setQuizDetails } from '@redux/quiz_attempt/quizAttemptSlice';

interface Topic {
  topic_id: number;
  topic_name: string;
}

interface QuizDetailData {
  quizzes: [
    {
      quiz_id: number;
      title: string;
      description: string;
      difficulty: string;
      time_limit_minutes: number;
      total_questions: number;
      participants_count: number;
      average_rating: number;
      quiz_topics: {
        topic: Topic;
      }[];
      user_performances: {
        user: { username: string };
        average_score: number;
      }[];
    }
  ];
}

interface QuizStatsProps {
  quiz: QuizDetailData['quizzes'][0];
}

const QuizStats: React.FC<QuizStatsProps> = ({ quiz }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <FiClock className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Time Limit</span>
      <span className="font-semibold">{quiz.time_limit_minutes} mins</span>
    </div>
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <FaBrain className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
      <span className="font-semibold">{quiz.total_questions}</span>
    </div>
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <FiUsers className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
      <span className="font-semibold">{quiz.participants_count.toLocaleString()}</span>
    </div>
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <FiStar className="w-6 h-6 mb-2 text-yellow-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
      <span className="font-semibold">{quiz.average_rating}/10.0</span>
    </div>
  </div>
);

const LoginNotification = () => (
  <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
    <div className="flex items-start">
      <FiAlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
      <p className="text-blue-700 dark:text-blue-300">
        You need to be logged in to attempt this quiz and track your progress.
      </p>
    </div>
  </div>
);

const AuthOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <div className="flex flex-col items-center text-center">
        <FiLogIn className="w-8 h-8 mb-3 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You need to log in or create an account to start this quiz and track your progress.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer "
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer "
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizDetailContent = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  if (!quizId) {
    return <div>Quiz not found.</div>;
  }

  const { loading, error, data } = useQuery<QuizDetailData>(GET_QUIZ_DETAILS, {
    variables: { quiz_id: parseInt(quizId) },
  });

  const handleStartQuiz = () => {
    if (!user) {
      // Show authentication options if user is not logged in
      setShowAuthOptions(true);
      return;
    }
    if (quiz) {
      dispatch(setQuizDetails({
        timeLimit: quiz.time_limit_minutes,
        totalQuestions: quiz.total_questions
      }));
    }
    navigate(`/quizzes/${quizId}/attempt`);
  };

  if (loading) return <LoadingComponent />;
  if (error) {
    console.error(error);
    return <div>Error fetching quiz details. Please try again later.</div>;
  }
  const quiz = data?.quizzes[0];
  if (!quiz) {
    return <div>Quiz not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          {/* Show login notification for guests */}
          {!user && <LoginNotification />}

          <div className="flex items-center justify-between mb-6">
            <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
              {quiz.difficulty}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
            {quiz.title}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {quiz.description}
          </p>

          <QuizStats quiz={quiz} />

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Topics Covered</h3>
            <div className="flex flex-wrap gap-2">
              {quiz.quiz_topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {topic.topic.topic_name}
                </span>
              ))}
            </div>
          </div>
          {showAuthOptions && !user ? (
            <AuthOptions />
          ) : (
            <button
              onClick={handleStartQuiz}
              className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-102 transition-all cursor-pointer"
            >
              {user ? "Start Quiz Now" : "Log In to Start Quiz"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const QuizDetailPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { quizId } = useParams<{ quizId: string }>();

  const initialPresence = useMemo(() => ({
    currentPage: `/quizzes/${quizId}`,
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    userId: user?.user_id?.toString() || 'guest',
    username: user?.username || 'guest User',
    currentAction: {
      type: 'viewing' as const,
      resourceId: quizId,
      startedAt: new Date().toISOString(),
    },
  }), [user?.user_id, user?.username, quizId]);

  const initialStorage = useMemo(() => ({
    userSessions: new LiveObject({})
  }), []);

  return (
    <RoomProvider
      id={getRoomId('admin')}
      initialPresence={initialPresence}
      initialStorage={initialStorage}
    >
      <Suspense fallback={<LoadingComponent />}>
        <QuizDetailContent />
      </Suspense>
    </RoomProvider>
  );
};

export default QuizDetailPage;