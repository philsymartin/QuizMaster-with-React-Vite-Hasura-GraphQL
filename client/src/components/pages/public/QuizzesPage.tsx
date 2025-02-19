// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { BookOpen, Clock, Star, Users } from 'lucide-react';
// import { useQuery } from '@apollo/client';
// import { GET_QUIZZES_BASIC } from '../../../api/queries/quizzes';

// interface QuizType {
//   id: string;
//   title: string;
//   description: string;
//   difficulty: string;
//   timeLimit: string;
//   participants: number;
//   rating: number;
// }

// const QuizzesPage = () => {
//   const { loading, error, data } = useQuery(GET_QUIZZES_BASIC, {
//     fetchPolicy: 'cache-and-network',
//   });

//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const item = {
//     hidden: { opacity: 0, y: 20 },
//     show: { opacity: 1, y: 0 }
//   };

//   if (loading && !data) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
//           Error loading quizzes
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           {error.message}
//         </p>
//       </div>
//     );
//   }

//   // Explicitly define transformedQuizzes as QuizType[]
//   const transformedQuizzes: QuizType[] = data?.quizzes.map((quiz: any) => ({
//     id: quiz.quiz_id,
//     title: quiz.title,
//     description: quiz.description,
//     difficulty: quiz.difficulty,
//     timeLimit: `${quiz.time_limit_minutes} mins`,
//     participants: quiz.participants_count,
//     rating: quiz.average_rating,
//   })) ?? [];

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="mb-12 text-center">
//         <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
//           Available Quizzes
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 text-lg">
//           Choose from our collection of carefully crafted quizzes
//         </p>
//       </div>

//       <motion.div
//         variants={container}
//         initial="hidden"
//         animate="show"
//         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//       >
//         {transformedQuizzes.map((quiz: QuizType) => (
//           <motion.div key={quiz.id} variants={item} className="group">
//             <Link
//               to={`/quizzes/${quiz.id}`}
//               className="block h-full p-6 rounded-2xl bg-white dark:bg-gray-800 
//                        shadow-md hover:shadow-xl transition-all duration-300 
//                        border border-gray-100 dark:border-gray-700
//                        transform hover:scale-102"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <span className={`px-3 py-1 text-sm font-medium rounded-full
//                               ${quiz.difficulty === 'Hard'
//                     ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
//                     : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
//                   }`}>
//                   {quiz.difficulty}
//                 </span>
//               </div>

//               <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
//                 {quiz.title}
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 {quiz.description}
//               </p>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex items-center text-gray-600 dark:text-gray-400">
//                   <Clock className="w-4 h-4 mr-2" />
//                   <span className="text-sm">{quiz.timeLimit}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600 dark:text-gray-400">
//                   <Users className="w-4 h-4 mr-2" />
//                   <span className="text-sm">{quiz.participants.toLocaleString()}</span>
//                 </div>
//                 <div className="flex items-center text-gray-600 dark:text-gray-400">
//                   <Star className="w-4 h-4 mr-2 text-yellow-400" />
//                   <span className="text-sm">{quiz.rating.toFixed(1)}/5.0</span>
//                 </div>
//                 <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
//                   <BookOpen className="w-4 h-4 mr-2" />
//                   <span className="text-sm">Start Quiz</span>
//                 </div>
//               </div>
//             </Link>
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   );
// };

// export default QuizzesPage;

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Star, Users, Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_QUIZZES_WITH_TOPICS } from '../../../api/queries/quizzes';

interface QuizData {
  quiz_id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time_limit_minutes: number;
  participants_count: number;
  average_rating: number;
  quiz_topics: {
    topic: {
      topic_id: number;
      topic_name: string;
    };
  }[];
}
// Define the transformed quiz structure
interface QuizType {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  participants: number;
  rating: number;
  topics: string[];
}
interface FilterState {
  search: string;
  difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
  timeRange: {
    min: number;
    max: number;
  };
  selectedTopics: string[];
}

const QuizzesPage = () => {
  const { loading, error, data } = useQuery(GET_QUIZZES_WITH_TOPICS, {
    fetchPolicy: 'cache-and-network',
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: 'all',
    timeRange: { min: 0, max: 0 },
    selectedTopics: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Transform and memoize the quiz data
  const transformedQuizzes: QuizType[] = useMemo(() => {
    if (!data?.quizzes) return [];

    return data.quizzes.map((quiz: QuizData): QuizType => ({
      id: quiz.quiz_id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.time_limit_minutes,
      participants: quiz.participants_count,
      rating: quiz.average_rating,
      topics: quiz.quiz_topics.map(qt => qt.topic.topic_name),
    }));
  }, [data]);

  // Get unique topics and time ranges for filter options
  const filterOptions = useMemo(() => {
    const topics = new Set<string>();
    let maxTime = 0;

    transformedQuizzes.forEach((quiz) => {
      quiz.topics?.forEach((topic) => topics.add(topic));
      maxTime = Math.max(maxTime, quiz.timeLimit);
    });
    if (maxTime > 0 && filters.timeRange.max === 0) {
      setFilters(prev => ({
        ...prev,
        timeRange: { ...prev.timeRange, max: maxTime }
      }));
    }

    return {
      topics: Array.from(topics),
      maxTime,
    };
  }, [transformedQuizzes, filters.timeRange.max]);

  // Filter quizzes based on current filter state
  const filteredQuizzes = useMemo(() => {
    return transformedQuizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        quiz.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesDifficulty =
        filters.difficulty === 'all' || quiz.difficulty === filters.difficulty;

      const matchesTimeRange =
        quiz.timeLimit >= filters.timeRange.min &&
        quiz.timeLimit <= filters.timeRange.max;

      const matchesTopics =
        filters.selectedTopics.length === 0 ||
        filters.selectedTopics.some(topic => quiz.topics.includes(topic));

      return matchesSearch && matchesDifficulty && matchesTimeRange && matchesTopics;
    });
  }, [transformedQuizzes, filters]);

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

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
          Available Quizzes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Choose from our collection of carefully crafted quizzes
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quizzes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2"
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    difficulty: e.target.value as FilterState['difficulty']
                  }))}
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Range (minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={filterOptions.maxTime}
                    value={filters.timeRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, min: Number(e.target.value) }
                    }))}
                    className="w-24 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">to</span>
                  <input
                    type="number"
                    min="0"
                    max={filterOptions.maxTime}
                    value={filters.timeRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, max: Number(e.target.value) }
                    }))}
                    className="w-24 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-2"
                  />
                </div>
              </div>

              {/* Topics Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics ({filters.selectedTopics.length} selected)
                </label>
                <div className="space-y-2">
                  {/* Selected Topics Pills */}
                  {filters.selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {filters.selectedTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                     bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                        >
                          {topic}
                          <button
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                selectedTopics: prev.selectedTopics.filter(t => t !== topic)
                              }));
                            }}
                            className="ml-2 hover:text-purple-800 dark:hover:text-purple-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Topics Checkbox List */}
                  <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 
                    rounded-lg bg-white dark:bg-gray-800 p-2">
                    {filterOptions.topics.map((topic) => (
                      <label
                        key={topic}
                        className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                     rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedTopics.includes(topic)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              selectedTopics: e.target.checked
                                ? [...prev.selectedTopics, topic]
                                : prev.selectedTopics.filter(t => t !== topic)
                            }));
                          }}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 
                       focus:ring-purple-500 dark:border-gray-600 
                       dark:focus:ring-purple-600"
                        />
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {topic}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        selectedTopics: filterOptions.topics
                      }))}
                      className="text-sm text-purple-600 dark:text-purple-400 
                   hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        selectedTopics: []
                      }))}
                      className="text-sm text-purple-600 dark:text-purple-400 
                   hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quizzes Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredQuizzes.map((quiz) => (
          <motion.div key={quiz.id} variants={item} className="group">
            <Link
              to={`/quizzes/${quiz.id}`}
              className="block h-full p-6 rounded-2xl bg-white dark:bg-gray-800 
                       shadow-md hover:shadow-xl transition-all duration-300 
                       border border-gray-100 dark:border-gray-700
                       hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full
                              ${quiz.difficulty === 'Hard'
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : quiz.difficulty === 'Medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                      : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
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
                  <span className="text-sm">{quiz.timeLimit} mins</span>
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