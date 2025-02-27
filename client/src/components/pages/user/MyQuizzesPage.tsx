import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import type { QuizAttempt, QuizFeedback, Quiz } from '../../../types/quiz';
import { GET_USER_QUIZZES } from '@queries/users';
import { ADD_QUIZ_FEEDBACK, UPDATE_FEEDBACK_SENTIMENT } from '@mutations/questionsMutate';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import { analyzeSentiment } from '@services/sentiment';
import LoadingComponent from '@utils/LoadingSpinner';
import { FiClock, FiMessageSquare, FiStar, FiTarget, FiX } from 'react-icons/fi';

interface QuizAttemptWithQuiz extends QuizAttempt {
  quiz: Pick<Quiz, 'quiz_id' | 'title' | 'difficulty' | 'description' | 'time_limit_minutes'>;
}

interface QuizFeedbackWithQuiz extends QuizFeedback {
  quiz: Pick<Quiz, 'quiz_id' | 'title'>;
}

interface UserQuizzesData {
  users: [{
    quiz_attempts: QuizAttemptWithQuiz[];
    quiz_feedbacks: QuizFeedbackWithQuiz[];
  }];
}

const MyQuizzesPage = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<{
    quizId: number;
    title: string;
  } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  const { loading, error, data, refetch } = useQuery<UserQuizzesData>(GET_USER_QUIZZES);
  const [addFeedback] = useMutation(ADD_QUIZ_FEEDBACK);
  const [updateSentiment] = useMutation(UPDATE_FEEDBACK_SENTIMENT);

  const feedbackMap = useMemo(() => {
    if (!data?.users[0]?.quiz_feedbacks) return {};
    return data.users[0].quiz_feedbacks.reduce((acc: Record<number, QuizFeedbackWithQuiz>, feedback: QuizFeedbackWithQuiz) => {
      acc[feedback.quiz.quiz_id] = feedback;
      return acc;
    }, {});
  }, [data?.users[0]?.quiz_feedbacks]);

  const performSentimentAnalysis = async (feedbackId: number, text: string) => {
    try {
      const sentimentData = await analyzeSentiment(text);

      await updateSentiment({
        variables: {
          feedbackId,
          sentimentLabel: sentimentData.label,
          sentimentScore: sentimentData.score,
        }
      });
    } catch (err) {
      console.warn('Sentiment analysis failed:', err);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedQuiz || !userId || !feedbackText.trim() || !rating) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Submit feedback immediately
      const result = await addFeedback({
        variables: {
          quizId: selectedQuiz.quizId,
          userId,
          feedbackText,
          rating
        }
      });
      // Reset form and close modal
      setSelectedQuiz(null);
      setFeedbackText('');
      setRating(0);
      setShowModal(false);
      setSubmitError(null);
      refetch();
      // Trigger sentiment analysis in background
      const feedbackId = result.data.insert_quiz_feedback_one.feedback_id;
      performSentimentAnalysis(feedbackId, feedbackText);

    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmitError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };




  const openFeedbackModal = (quizId: number, title: string) => {
    setSelectedQuiz({ quizId, title });
    setShowModal(true);
    setSubmitError(null);
  };

  if (loading) return <LoadingComponent />

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Error loading quizzes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
      </div>
    );
  }

  const userData = data?.users[0];
  if (!userData) return null;

  const { quiz_attempts } = userData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
            dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-8">
            My Quizzes
          </h1>

          <div className="space-y-6">
            {quiz_attempts.map((attempt: QuizAttemptWithQuiz) => {
              const feedback = feedbackMap[attempt.quiz.quiz_id];

              return (
                <div key={attempt.attempt_id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {attempt.quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {attempt.quiz.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${attempt.quiz.difficulty === 'Hard'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : attempt.quiz.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                      {attempt.quiz.difficulty}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <StatItem
                      icon={<FiTarget className="w-4 h-4" />}
                      label="Score"
                      value={`${attempt.score}%`}
                    />
                    <StatItem
                      icon={<FiClock className="w-4 h-4" />}
                      label="Time Limit"
                      value={`${attempt.quiz.time_limit_minutes} min`}
                    />
                    <StatItem
                      icon={<FiMessageSquare className="w-4 h-4" />}
                      label="Feedback"
                      value={feedback ? "Submitted" : "Not yet"}
                    />
                    {feedback && (
                      <StatItem
                        icon={<FiStar className="w-4 h-4" />}
                        label="Rating"
                        value={`${feedback.rating}/5`}
                      />
                    )}
                  </div>

                  {feedback ? (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600/30 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {feedback.feedback_text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Submitted on {new Date(feedback.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => openFeedbackModal(attempt.quiz.quiz_id, attempt.quiz.title)}
                      className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 
                        dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                        dark:hover:bg-gray-600 transition-colors"
                    >
                      Add Feedback
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform 
              bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Add Feedback for {selectedQuiz?.title}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRating(value)}
                        className={`p-2 rounded-full transition-colors ${rating >= value
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                          }`}
                      >
                        <FiStar className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your thoughts about this quiz..."
                    className="w-full h-32 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 
                      bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                      rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                      focus:border-transparent resize-none"
                  />
                </div>
                {submitError && (
                  <div className="text-red-500 text-sm mt-2">
                    {submitError}
                  </div>
                )}
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting || !rating || !feedbackText.trim() || !userId}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 
                    rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 
                    disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Submitting..." : !userId ? "Please log in to submit feedback" : "Submit Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <div className="text-purple-600 dark:text-purple-400">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

export default MyQuizzesPage;