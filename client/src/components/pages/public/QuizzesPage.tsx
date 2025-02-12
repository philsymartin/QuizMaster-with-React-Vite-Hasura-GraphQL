import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_QUIZZES } from '../../../api/queries/quizzes';

interface QuizType {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  participants: number;
  rating: number;
}

const QuizzesPage = () => {
  const { loading, error, data } = useQuery(GET_QUIZZES, {
    fetchPolicy: 'cache-and-network', // Ensures fresh data while showing cached data
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Error loading quizzes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  // Explicitly define transformedQuizzes as QuizType[]
  const transformedQuizzes: QuizType[] = data?.quizzes.map((quiz: any) => ({
    id: quiz.quiz_id,
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
    timeLimit: `${quiz.time_limit_minutes} mins`,
    participants: quiz.participants_count,
    rating: quiz.average_rating,
  })) ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
          Available Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Choose from our collection of carefully crafted quizzes
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {transformedQuizzes.map((quiz: QuizType) => (
          <motion.div key={quiz.id} variants={item} className="group">
            <Link
              to={`/quizzes/${quiz.id}`}
              className="block h-full p-6 rounded-2xl bg-white dark:bg-gray-800 
                       shadow-md hover:shadow-xl transition-all duration-300 
                       border border-gray-100 dark:border-gray-700
                       transform hover:scale-102"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full
                              ${quiz.difficulty === 'Hard'
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  }`}>
                  {quiz.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {quiz.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {quiz.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{quiz.timeLimit}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">{quiz.participants.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  <span className="text-sm">{quiz.rating.toFixed(1)}/5.0</span>
                </div>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">Start Quiz</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default QuizzesPage;