// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
// import {
//   startQuizAttempt,
//   answerQuestion,
//   nextQuestion,
//   previousQuestion,
//   submitQuizRequest,
//   selectQuizAttemptState,
//   selectCurrentQuestion,
//   selectTimeRemaining,
//   selectIsComplete,
//   selectQuizScore,
//   resetQuizAttempt,
//   endQuizEarly,
// } from '../../../redux/quiz_attempt/quizAttemptSlice';

// const QuizAttemptPage: React.FC = () => {
//   const { quizId } = useParams<{ quizId: string }>();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [isStarting, setIsStarting] = useState(false);
//   const initializationRef = useRef(false);

//   const {
//     questions,
//     currentQuestionIndex,
//     answers,
//     isSubmitting,
//     error,
//     isInitialized,
//     isComplete,
//   } = useSelector(selectQuizAttemptState);
//   const currentQuestion = useSelector(selectCurrentQuestion);
//   const timeRemaining = useSelector(selectTimeRemaining);
//   const score = useSelector(selectQuizScore);

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (!isComplete && isInitialized) {
//         e.preventDefault();
//         e.returnValue = '';
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, [isComplete, isInitialized]);

//   // Start quiz when component mounts - with debounce protection
//   useEffect(() => {
//     if (!quizId || isStarting || isComplete || initializationRef.current || isInitialized) {
//       return;
//     }

//     console.log('Initializing quiz', quizId);
//     setIsStarting(true);
//     initializationRef.current = true;

//     // Reset any previous quiz attempt first
//     dispatch(resetQuizAttempt());

//     // Start new quiz attempt with slight delay to ensure reset completes
//     const timer = setTimeout(() => {
//       dispatch(startQuizAttempt({
//         quizId: parseInt(quizId),
//         timeLimit: 10,
//         totalQuestions: 6,
//       }));
//       setIsStarting(false);
//     }, 100);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [quizId, dispatch, isComplete, isInitialized, isStarting]);

//   // Cleanup effect - only run when unmounting
//   useEffect(() => {
//     return () => {
//       if (isInitialized && !isComplete) {
//         console.log('Cleaning up quiz attempt');
//         dispatch(endQuizEarly());
//       }
//     };
//   }, []);  // Empty dependency array = only on unmount

//   const handleQuitQuiz = useCallback(() => {
//     const confirmed = window.confirm(
//       'Are you sure you want to quit this quiz? Your progress will be lost and you will receive a score of 0.'
//     );

//     if (confirmed) {
//       dispatch(endQuizEarly());
//       navigate('/quizzes');
//     }
//   }, [dispatch, navigate]);

//   // After completion, navigate with a clean slate
//   useEffect(() => {
//     if (isComplete && score !== null && !isStarting) {
//       // Allow navigation to continue naturally without cleanup issues
//       initializationRef.current = true;
//     }
//   }, [isComplete, score, isStarting]);

//   // Loading state while starting quiz
//   if (isStarting || (!questions.length && !error && !isComplete)) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-xl font-semibold">Loading quiz...</div>
//       </div>
//     );
//   }

//   // Show error if quiz initialization failed
//   if (error && !isComplete && !questions.length) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-screen">
//         <div className="text-xl font-semibold text-red-600 mb-4">Failed to load quiz</div>
//         <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
//         <button
//           onClick={() => navigate('/quizzes')}
//           className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//         >
//           Return to Quizzes
//         </button>
//       </div>
//     );
//   }

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const handleAnswer = (optionId: number) => {
//     if (currentQuestion && !isComplete) {
//       dispatch(answerQuestion({
//         questionId: currentQuestion.question_id,
//         optionId,
//       }));
//     }
//   };

//   const handleSubmit = () => {
//     dispatch(submitQuizRequest());
//   };

//   const handleReturnToQuizzes = () => {
//     // Set ref to prevent re-initialization attempts
//     initializationRef.current = true;
//     navigate('/quizzes');
//   };

//   if (isComplete) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
//       >
//         <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 
//                               dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
//           Quiz Complete!
//         </h2>
//         <p className="text-2xl mb-8">
//           Your score: <span className="font-bold text-purple-600 dark:text-purple-400">
//             {score !== null ? score.toFixed(1) : 0}%
//           </span>
//         </p>
//         <button
//           onClick={handleReturnToQuizzes}
//           className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 
//                               hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 
//                               rounded-xl font-semibold transform hover:scale-105 transition-all"
//         >
//           Try Another Quiz
//         </button>
//       </motion.div>
//     );
//   }

//   if (!currentQuestion) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-xl font-semibold">Loading question...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="mb-8 flex justify-between items-center">
//         <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
//           Question {currentQuestionIndex + 1}/{questions.length}
//         </div>
//         <div className="flex items-center gap-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
//           <Clock className="w-5 h-5" />
//           {formatTime(timeRemaining)}
//         </div>
//         <button
//           onClick={handleQuitQuiz}
//           className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 
//                     border border-red-600 dark:border-red-400 rounded-lg 
//                     hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
//         >
//           Quit Quiz
//         </button>
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentQuestionIndex}
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -50 }}
//           className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8"
//         >
//           <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
//             {currentQuestion.question_text}
//           </h2>
//           <div className="grid grid-cols-1 gap-4">
//             {currentQuestion.question_options?.map((option) => (
//               <button
//                 key={option.option.option_id}
//                 onClick={() => handleAnswer(option.option.option_id)}
//                 className={`p-4 text-left rounded-xl transition-all transform hover:scale-102
//                                     ${answers[currentQuestion.question_id] === option.option.option_id
//                     ? 'bg-purple-100 dark:bg-purple-900 border-purple-500'
//                     : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
//                                     border-2
//                                     ${answers[currentQuestion.question_id] === option.option.option_id
//                     ? 'border-purple-500'
//                     : 'border-transparent'}`}
//               >
//                 {option.option.option_text}
//               </button>
//             ))}
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       <div className="flex justify-between items-center mt-8">
//         <button
//           onClick={() => dispatch(previousQuestion())}
//           disabled={currentQuestionIndex === 0}
//           className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
//                         ${currentQuestionIndex === 0
//               ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
//               : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Previous
//         </button>

//         {currentQuestionIndex === questions.length - 1 ? (
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="bg-gradient-to-r from-purple-600 to-blue-500 
//                                  hover:from-purple-700 hover:to-blue-600 text-white 
//                                  px-8 py-3 rounded-xl font-semibold transform 
//                                  hover:scale-105 transition-all disabled:opacity-50"
//           >
//             {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
//           </button>
//         ) : (
//           <button
//             onClick={() => dispatch(nextQuestion())}
//             className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
//                                  bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
//           >
//             Next
//             <ArrowRight className="w-5 h-5" />
//           </button>
//         )}
//       </div>

//       {error && (
//         <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-xl">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuizAttemptPage;





// import React, { useCallback, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
// import {
//   startQuizAttempt,
//   answerQuestion,
//   nextQuestion,
//   previousQuestion,
//   submitQuizRequest,
//   selectQuizAttemptState,
//   selectCurrentQuestion,
//   selectTimeRemaining,
//   selectIsComplete,
//   selectQuizScore,
//   resetQuizAttempt,
// } from '../../../redux/quiz_attempt/quizAttemptSlice';

// const QuizAttemptPage: React.FC = () => {
//   const { quizId } = useParams<{ quizId: string }>();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const initializationRef = useRef(false);

//   const {
//     currentQuiz,
//     questions,
//     currentQuestionIndex,
//     answers,
//     isSubmitting,
//     error,
//   } = useSelector(selectQuizAttemptState);
//   const currentQuestion = useSelector(selectCurrentQuestion);
//   const timeRemaining = useSelector(selectTimeRemaining);
//   const isComplete = useSelector(selectIsComplete);
//   const score = useSelector(selectQuizScore);

//   useEffect(() => {
//     // Only initialize if not already initialized and quizId exists
//     if (quizId && !initializationRef.current) {
//       initializationRef.current = true;
//       dispatch(startQuizAttempt({
//         quizId: parseInt(quizId),
//         timeLimit: 10,
//         totalQuestions: 6,
//       }));
//     }

//     // Cleanup function
//     return () => {
//       initializationRef.current = false;
//       dispatch(resetQuizAttempt());
//     };
//   }, [quizId, dispatch]);

//   if (!questions || questions.length === 0) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-xl font-semibold">Loading questions...</div>
//       </div>
//     );
//   }

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const handleAnswer = (optionId: number) => {
//     if (currentQuestion && !isComplete) {
//       dispatch(answerQuestion({
//         questionId: currentQuestion.question_id,
//         optionId,
//       }));
//     }
//   };

//   const handleSubmit = () => {
//     dispatch(submitQuizRequest());
//   };

//   if (isComplete) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
//       >
//         <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 
//                               dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
//           Quiz Complete!
//         </h2>
//         <p className="text-2xl mb-8">
//           Your score: <span className="font-bold text-purple-600 dark:text-purple-400">
//             {score?.toFixed(1)}%
//           </span>
//         </p>
//         <button
//           onClick={() => navigate('/quizzes')}
//           className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 
//                               hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 
//                               rounded-xl font-semibold transform hover:scale-105 transition-all"
//         >
//           Try Another Quiz
//         </button>
//       </motion.div>
//     );
//   }

//   if (!currentQuestion) return <div>Loading...</div>;

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="mb-8 flex justify-between items-center">
//         <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
//           Question {currentQuestionIndex + 1}/{questions.length}
//         </div>
//         <div className="flex items-center gap-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
//           <Clock className="w-5 h-5" />
//           {formatTime(timeRemaining)}
//         </div>
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentQuestionIndex}
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -50 }}
//           className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8"
//         >
//           <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
//             {currentQuestion.question_text}
//           </h2>
//           <div className="grid grid-cols-1 gap-4">
//             {currentQuestion.question_options?.map((option) => (
//               <button
//                 key={option.option.option_id}
//                 onClick={() => handleAnswer(option.option.option_id)}
//                 className={`p-4 text-left rounded-xl transition-all transform hover:scale-102
//                                     ${answers[currentQuestion.question_id] === option.option.option_id
//                     ? 'bg-purple-100 dark:bg-purple-900 border-purple-500'
//                     : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
//                                     border-2
//                                     ${answers[currentQuestion.question_id] === option.option.option_id
//                     ? 'border-purple-500'
//                     : 'border-transparent'}`}
//               >
//                 {option.option.option_text}
//               </button>
//             ))}
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       <div className="flex justify-between items-center mt-8">
//         <button
//           onClick={() => dispatch(previousQuestion())}
//           disabled={currentQuestionIndex === 0}
//           className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
//                         ${currentQuestionIndex === 0
//               ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
//               : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Previous
//         </button>

//         {currentQuestionIndex === questions.length - 1 ? (
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="bg-gradient-to-r from-purple-600 to-blue-500 
//                                  hover:from-purple-700 hover:to-blue-600 text-white 
//                                  px-8 py-3 rounded-xl font-semibold transform 
//                                  hover:scale-105 transition-all disabled:opacity-50"
//           >
//             {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
//           </button>
//         ) : (
//           <button
//             onClick={() => dispatch(nextQuestion())}
//             className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
//                                  bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
//           >
//             Next
//             <ArrowRight className="w-5 h-5" />
//           </button>
//         )}
//       </div>

//       {error && (
//         <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-xl">
//           {error}
//         </div>
//       )}
//     </div>
//   );

// };

// export default QuizAttemptPage;


import React, { useCallback, useEffect, useRef, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
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
} from '../../../redux/quiz_attempt/quizAttemptSlice';
import LoadingComponent from '../../utils/LoadingSpinner';

// Separate component for question content to enable lazy loading
const QuestionContent = ({
  currentQuestion,
  answers,
  handleAnswer
}: {
  currentQuestion: any;
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

const QuizAttemptPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initializationRef = useRef(false);

  const {
    currentQuiz,
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

  useEffect(() => {
    if (quizId && !initializationRef.current) {
      initializationRef.current = true;
      dispatch(startQuizAttempt({
        quizId: parseInt(quizId),
        timeLimit: 10,
        totalQuestions: 6,
      }));
    }

    return () => {
      initializationRef.current = false;
      dispatch(resetQuizAttempt());
    };
  }, [quizId, dispatch]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback((optionId: number) => {
    if (currentQuestion && !isComplete) {
      dispatch(answerQuestion({
        questionId: currentQuestion.question_id,
        optionId,
      }));
    }
  }, [currentQuestion, isComplete, dispatch]);

  const handleSubmit = () => {
    dispatch(submitQuizRequest());
  };

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
            <Clock className="w-5 h-5" />
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
            <ArrowLeft className="w-5 h-5" />
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
              <ArrowRight className="w-5 h-5" />
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

export default QuizAttemptPage;