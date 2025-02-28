import { useCallback, useEffect, useRef, Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startQuizAttempt,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  submitQuizRequest,
  selectQuizAttemptState,
  selectCurrentQuestion,
  selectTimeRemaining,
  selectIsComplete,
  selectQuizScore,
  resetQuizAttempt,
} from '@redux/quiz_attempt/quizAttemptSlice';
import LoadingComponent from '@utils/LoadingSpinner';
import { FiArrowLeft, FiArrowRight, FiClock } from 'react-icons/fi';
import { Question } from 'src/types/quiz';
import { RootState } from '@redux/store';
import { LiveObject } from '@liveblocks/client';
import { RoomProvider, getRoomId, useUserTracker } from '@services/liveblocks';

const QuestionContent = ({
  currentQuestion,
  answers,
  handleAnswer
}: {
  currentQuestion: Question;
  answers: Record<number, number>;
  handleAnswer: (optionId: number) => void;
}) => (
  <div className="grid grid-cols-1 gap-4">
    {currentQuestion.question_options?.map((option: any) => (
      <button
        key={option.option.option_id}
        onClick={() => handleAnswer(option.option.option_id)}
        className={`p-4 text-left rounded-xl transition-all transform hover:scale-102
          ${answers[currentQuestion.question_id] === option.option.option_id
            ? 'bg-purple-100 dark:bg-purple-900 border-purple-500'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
          border-2
          ${answers[currentQuestion.question_id] === option.option.option_id
            ? 'border-purple-500'
            : 'border-transparent'}`}
      >
        {option.option.option_text}
      </button>
    ))}
  </div>
);

const QuizAttemptContent = ({ quizId }: { quizId: string | undefined }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initializationRef = useRef(false);

  const userId = useMemo(() => user?.user_id?.toString() || 'guest', [user?.user_id]);
  const username = useMemo(() => user?.username || 'guest user', [user?.username]);

  const { trackQuizAttempt } = useUserTracker(userId, username);

  const {
    questions,
    currentQuestionIndex,
    answers,
    isSubmitting,
    error,
  } = useSelector(selectQuizAttemptState);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const timeRemaining = useSelector(selectTimeRemaining);
  const isComplete = useSelector(selectIsComplete);
  const score = useSelector(selectQuizScore);

  const initializeQuiz = useCallback(() => {
    if (quizId && !initializationRef.current) {
      initializationRef.current = true;
      dispatch(startQuizAttempt({
        quizId: parseInt(quizId),
        timeLimit: 10,
        totalQuestions: 6,
      }));

      if (trackQuizAttempt && quizId) {
        trackQuizAttempt(quizId, "attempting_quiz");
      }
    }
  }, [quizId, dispatch, trackQuizAttempt]);

  useEffect(() => {
    initializeQuiz();

    return () => {
      initializationRef.current = false;
      dispatch(resetQuizAttempt());
    };
  }, [dispatch, initializeQuiz]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const handleAnswer = useCallback((optionId: number) => {
    if (currentQuestion && !isComplete) {
      dispatch(answerQuestion({
        questionId: currentQuestion.question_id,
        optionId,
      }));
    }
  }, [currentQuestion, isComplete, dispatch]);

  const handleSubmit = useCallback(() => {
    dispatch(submitQuizRequest());
    if (trackQuizAttempt && quizId) {
      trackQuizAttempt(quizId, "completed_quiz");
    }
  }, [dispatch, trackQuizAttempt, quizId]);

  if (!questions || questions.length === 0) {
    return <LoadingComponent />;
  }

  if (isComplete) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 
                      dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
            Quiz Complete!
          </h2>
          <p className="text-2xl mb-8">
            Your score: <span className="font-bold text-purple-600 dark:text-purple-400">
              {score?.toFixed(1)}%
            </span>
          </p>
          <button
            onClick={() => navigate('/quizzes')}
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 
                      hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 
                      rounded-xl font-semibold transform hover:scale-105 transition-all"
          >
            Try Another Quiz
          </button>
        </motion.div>
      </Suspense>
    );
  }

  if (!currentQuestion) return <LoadingComponent />;

  return (
    <Suspense fallback={<LoadingComponent />}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1}/{questions.length}
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
            <FiClock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              {currentQuestion.question_text}
            </h2>
            <Suspense fallback={<LoadingComponent />}>
              <QuestionContent
                currentQuestion={currentQuestion}
                answers={answers}
                handleAnswer={handleAnswer}
              />
            </Suspense>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => dispatch(previousQuestion())}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                ${currentQuestionIndex === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
          >
            <FiArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-500 
                         hover:from-purple-700 hover:to-blue-600 text-white 
                         px-8 py-3 rounded-xl font-semibold transform 
                         hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => dispatch(nextQuestion())}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                         bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Next
              <FiArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-xl">
            {error}
          </div>
        )}
      </div>
    </Suspense>
  );
};

const QuizAttemptPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const initialPresence = useMemo(() => ({
    currentPage: `/quizzes/${quizId}/attempt`,
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    userId: user?.user_id?.toString() || 'guest',
    username: user?.username || 'guest User',
    currentAction: {
      type: 'attempting_quiz' as const,
      startedAt: new Date().toISOString(),
    },
  }), [quizId, user?.user_id, user?.username]);

  const initialStorage = useMemo(() => ({
    userSessions: new LiveObject({})
  }), []);

  return (
    <RoomProvider
      id={getRoomId('admin')}
      initialPresence={initialPresence}
      initialStorage={initialStorage}
    >
      <QuizAttemptContent quizId={quizId} />
    </RoomProvider>
  );
};

export default QuizAttemptPage;