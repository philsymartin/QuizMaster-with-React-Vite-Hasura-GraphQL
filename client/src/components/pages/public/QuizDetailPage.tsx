import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Award, Users, Star, BrainCircuit } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_QUIZ_DETAILS } from '../../../api/queries/quizzes';
import { useDispatch } from 'react-redux';
import { resetQuizAttempt } from '../../../redux/quiz_attempt/quizAttemptSlice';

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

const QuizDetailPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!quizId) {
    return <div>Quiz not found.</div>;
  }

  const { loading, error, data } = useQuery<QuizDetailData>(GET_QUIZ_DETAILS, {
    variables: { quiz_id: parseInt(quizId) },
  });
  const handleStartQuiz = () => {
    dispatch(resetQuizAttempt());
    navigate(`/quizzes/${quizId}/attempt`);
  };

  if (loading) return <div>Loading...</div>;
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
          <div className="flex items-center justify-between mb-6">
            {/* <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
              {quiz.category}
            </span> */}
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Clock className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Time Limit</span>
              <span className="font-semibold">{quiz.time_limit_minutes} mins</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <BrainCircuit className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
              <span className="font-semibold">{quiz.total_questions}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Users className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
              <span className="font-semibold">{quiz.participants_count.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Star className="w-6 h-6 mb-2 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
              <span className="font-semibold">{quiz.average_rating}/5.0</span>
            </div>
          </div>

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

          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Scorers</h3>
            <div className="space-y-2">
              {quiz.user_performances.map((performance, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Award className={`w-5 h-5 mr-2 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`} />
                    <span>{performance.user.username}</span>
                  </div>
                  <span className="font-semibold">{performance.average_score}%</span>
                </div>
              ))}
            </div>
          </div> */}

          <button
            onClick={handleStartQuiz}
            className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-102 transition-all"
          >
            Start Quiz Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizDetailPage;

// import React, { useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Clock, Award, Users, Star, BrainCircuit } from 'lucide-react';
// import { useMutation, useQuery } from '@apollo/client';
// import { GET_QUIZ_DETAILS, GET_TOP_PERFORMERS } from '../../../api/queries/quizzes';
// import { error } from 'console';

// interface Topic {
//   topic_id: number;
//   topic_name: string;
// }

// interface QuizDetailData {
//   quizzes: [
//     {
//       quiz_id: number;
//       title: string;
//       description: string;
//       difficulty: string;
//       time_limit_minutes: number;
//       total_questions: number;
//       participants_count: number;
//       average_rating: number;
//       quiz_topics: {
//         topic: Topic;
//       }[];
//       user_performances: {
//         user: { username: string };
//         average_score: number;
//       }[];
//     }
//   ];
// }

// const QuizDetailPage: React.FC = () => {
//   const { quizId } = useParams<{ quizId: string }>();

//   if (!quizId) {
//     return <div>Quiz not found.</div>;
//   }

//   // Split into two queries
//   const { loading: quizLoading, data: quizData } = useQuery<QuizDetailData>(GET_QUIZ_DETAILS, {
//     variables: { quiz_id: parseInt(quizId) }
//   });
//   const [getTopPerformers, { loading: performersLoading, data: performersData }] =
//     useMutation(GET_TOP_PERFORMERS);

//   // if (loading) return <div>Loading...</div>;
//   // if (error as Error) {
//   //   return <div>Error fetching quiz details. Please try again later.</div>;
//   // }
//   // const quiz = data?.quizzes[0];

//   // Fetch top performers when component mounts
//   useEffect(() => {
//     if (quizId) {
//       getTopPerformers({ variables: { quiz_id: parseInt(quizId) } });
//     }
//   }, [quizId, getTopPerformers]);

//   if (quizLoading || performersLoading) return <div>Loading...</div>;

//   const quiz = quizData?.quizzes[0];
//   if (!quiz) {
//     return <div>Quiz not found.</div>;
//   }


//   const topPerformers = performersData?.getTopPerformers.top_performers || [];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-4xl mx-auto"
//     >
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
//         <div className="p-8">
//           <div className="flex items-center justify-between mb-6">
//             {/* <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
//               {quiz.category}
//             </span> */}
//             <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
//               {quiz.difficulty}
//             </span>
//           </div>

//           <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
//             {quiz.title}
//           </h1>

//           <p className="text-gray-600 dark:text-gray-400 mb-8">
//             {quiz.description}
//           </p>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//             <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
//               <Clock className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
//               <span className="text-sm text-gray-600 dark:text-gray-400">Time Limit</span>
//               <span className="font-semibold">{quiz.time_limit_minutes} mins</span>
//             </div>
//             <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
//               <BrainCircuit className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
//               <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
//               <span className="font-semibold">{quiz.total_questions}</span>
//             </div>
//             <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
//               <Users className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
//               <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
//               <span className="font-semibold">{quiz.participants_count.toLocaleString()}</span>
//             </div>
//             <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
//               <Star className="w-6 h-6 mb-2 text-yellow-400" />
//               <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
//               <span className="font-semibold">{quiz.average_rating}/5.0</span>
//             </div>
//           </div>

//           <div className="mb-8">
//             <h3 className="text-lg font-semibold mb-4">Topics Covered</h3>
//             <div className="flex flex-wrap gap-2">
//               {quiz.quiz_topics.map((topic, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
//                 >
//                   {topic.topic.topic_name}
//                 </span>
//               ))}
//             </div>
//           </div>

//           <div className="mb-8">
//             <h3 className="text-lg font-semibold mb-4">Top Scorers</h3>
//             <div className="space-y-2">
//               {quiz.user_performances.map((performance, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <div className="flex items-center">
//                     <Award className={`w-5 h-5 mr-2 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`} />
//                     <span>{performance.user.username}</span>
//                   </div>
//                   <span className="font-semibold">{performance.average_score}%</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <Link
//             to={`/quizzes/${quizId}/attempt`}
//             className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-102 transition-all"
//           >
//             Start Quiz Now
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default QuizDetailPage;
