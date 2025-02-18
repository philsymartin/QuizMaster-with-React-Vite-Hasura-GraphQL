// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const QuizAttemptPage = () => {
//   const [questions] = useState([
//     {
//       id: 1,
//       text: 'What is the capital of France?',
//       options: ['Paris', 'London', 'Berlin', 'Madrid'],
//       correct: 'Paris'
//     },
//     {
//       id: 2,
//       text: 'Which planet is known as the Red Planet?',
//       options: ['Mars', 'Venus', 'Jupiter', 'Mercury'],
//       correct: 'Mars'
//     },
//     {
//       id: 3,
//       text: 'What is 2 + 2?',
//       options: ['3', '4', '5', '6'],
//       correct: '4'
//     }
//   ]);

//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [score, setScore] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [showResult, setShowResult] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(30);

//   useEffect(() => {
//     if (timeLeft > 0 && !showResult) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0) {
//       handleNextQuestion();
//     }
//   }, [timeLeft]);

//   const handleAnswer = (answer) => {
//     setSelectedAnswer(answer);
//     if (answer === questions[currentQuestion].correct) {
//       setScore(score + 1);
//     }
//   };

//   const handleNextQuestion = () => {
//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//       setSelectedAnswer(null);
//       setTimeLeft(30);
//     } else {
//       setShowResult(true);
//     }
//   };

//   if (showResult) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
//       >
//         <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 
//                            dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
//           Quiz Complete!
//         </h2>
//         <p className="text-2xl mb-8">
//           Your score: <span className="font-bold text-purple-600 dark:text-purple-400">
//             {score}/{questions.length}
//           </span>
//         </p>
//         <Link
//           to="/quizzes"
//           className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 
//                              hover:from-purple-700 hover:to-blue-600 text-white px-8 py-3 
//                              rounded-xl font-semibold transform hover:scale-105 transition-all"
//         >
//           Try Another Quiz
//         </Link>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="mb-8 flex justify-between items-center">
//         <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
//           Question {currentQuestion + 1}/{questions.length}
//         </div>
//         <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
//           Time Left: {timeLeft}s
//         </div>
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentQuestion}
//           initial={{ opacity: 0, x: 50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -50 }}
//           className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8"
//         >
//           <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
//             {questions[currentQuestion].text}
//           </h2>
//           <div className="grid grid-cols-1 gap-4">
//             {questions[currentQuestion].options.map((option, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleAnswer(option)}
//                 className={`p-4 text-left rounded-xl transition-all transform hover:scale-102
//                                     ${selectedAnswer === option
//                     ? selectedAnswer === questions[currentQuestion].correct
//                       ? 'bg-green-100 dark:bg-green-900 border-green-500'
//                       : 'bg-red-100 dark:bg-red-900 border-red-500'
//                     : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
//                                     ${selectedAnswer ? 'cursor-default' : 'cursor-pointer'}
//                                     border-2
//                                     ${selectedAnswer === option ? 'border-current' : 'border-transparent'}`}
//                 disabled={selectedAnswer !== null}
//               >
//                 {option}
//               </button>
//             ))}
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       {selectedAnswer && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center"
//         >
//           <button
//             onClick={handleNextQuestion}
//             className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 
//                                  hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold 
//                                  transform hover:scale-105 transition-all"
//           >
//             {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
//           </button>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default QuizAttemptPage;

import React, { useEffect } from 'react';
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
} from '../../../redux/quiz_attempt/quizAttemptSlice';

const QuizAttemptPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    if (quizId && !currentQuiz) {
      dispatch(startQuizAttempt({
        quizId: parseInt(quizId),
        timeLimit: 10,
        totalQuestions: 6,
      }));
    }
  }, [quizId, currentQuiz, dispatch]);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading questions...</div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionId: number) => {
    if (currentQuestion && !isComplete) {
      dispatch(answerQuestion({
        questionId: currentQuestion.question_id,
        optionId,
      }));
    }
  };

  const handleSubmit = () => {
    dispatch(submitQuizRequest());
  };

  if (isComplete) {
    return (
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
    );
  }

  if (!currentQuestion) return <div>Loading...</div>;

  return (
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
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.question_options?.map((option) => (
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
  );
};

export default QuizAttemptPage;