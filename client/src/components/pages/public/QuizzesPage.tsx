import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiClock, FiSearch, FiSliders, FiStar, FiUsers } from 'react-icons/fi';
import { FilterState, FilterOptions, QuizType } from '@containers/public/QuizzesContainer';
import { motionContainer, motionItem } from '@styles/common';

interface QuizzesPageProps {
  loading: boolean;
  error: any;
  filteredQuizzes: QuizType[];
  filters: FilterState;
  filterOptions: FilterOptions;
  isFilterOpen: boolean;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: FilterState['difficulty']) => void;
  onTimeRangeChange: (type: 'min' | 'max', value: number) => void;
  onTopicChange: (topic: string, checked: boolean) => void;
  onSelectAllTopics: () => void;
  onClearAllTopics: () => void;
  toggleFilter: () => void;
}

const SkeletonCard = () => (
  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    </div>
    <div className="w-3/4 h-7 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse"></div>
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse"></div>
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

const PageHeader = () => (
  <div className="mb-12 text-center">
    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
      Available Quizzes
    </h1>
    <p className="text-gray-600 dark:text-gray-400 text-lg">
      Choose from our collection of carefully crafted quizzes
    </p>
  </div>
);

const SearchBar = ({ value, onChange, onToggleFilter, isFilterOpen }: {
  value: string;
  onChange: (value: string) => void;
  onToggleFilter: () => void;
  isFilterOpen: boolean;
}) => (
  <div className="flex items-center gap-4">
    <div className="relative flex-1">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search quizzes..."
        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
    <button
      onClick={onToggleFilter}
      className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    >
      <FiSliders className="w-5 h-5 mr-2" />
      Filters
    </button>
  </div>
);

const FilterPanel = ({
  filters,
  filterOptions,
  onDifficultyChange,
  onTimeRangeChange,
  onTopicChange,
  onSelectAllTopics,
  onClearAllTopics
}: {
  filters: FilterState;
  filterOptions: FilterOptions;
  onDifficultyChange: (value: FilterState['difficulty']) => void;
  onTimeRangeChange: (type: 'min' | 'max', value: number) => void;
  onTopicChange: (topic: string, checked: boolean) => void;
  onSelectAllTopics: () => void;
  onClearAllTopics: () => void;
}) => (
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
          onChange={(e) => onDifficultyChange(e.target.value as FilterState['difficulty'])}
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
            onChange={(e) => onTimeRangeChange('min', Number(e.target.value))}
            className="w-24 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-2"
          />
          <span className="text-gray-600 dark:text-gray-400">to</span>
          <input
            type="number"
            min="0"
            max={filterOptions.maxTime}
            value={filters.timeRange.max}
            onChange={(e) => onTimeRangeChange('max', Number(e.target.value))}
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
                    onClick={() => onTopicChange(topic, false)}
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
                  onChange={(e) => onTopicChange(topic, e.target.checked)}
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
              onClick={onSelectAllTopics}
              className="text-sm text-purple-600 dark:text-purple-400 
               hover:text-purple-800 dark:hover:text-purple-200"
            >
              Select All
            </button>
            <button
              onClick={onClearAllTopics}
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
);

const QuizCard = ({ quiz }: { quiz: QuizType }) => (
  <motion.div variants={motionItem} className="group">
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
          <FiClock className="w-4 h-4 mr-2" />
          <span className="text-sm">{quiz.timeLimit} mins</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FiUsers className="w-4 h-4 mr-2" />
          <span className="text-sm">{quiz.participants.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FiStar className="w-4 h-4 mr-2 text-yellow-400" />
          <span className="text-sm">{quiz.rating.toFixed(1)}/5.0</span>
        </div>
        <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
          <FiBookOpen className="w-4 h-4 mr-2" />
          <span className="text-sm">Start Quiz</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
      Error loading quizzes
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mt-2">
      {message}
    </p>
  </div>
);

// Main component
const QuizzesPage = ({
  loading,
  error,
  filteredQuizzes,
  filters,
  filterOptions,
  isFilterOpen,
  onSearchChange,
  onDifficultyChange,
  onTimeRangeChange,
  onTopicChange,
  onSelectAllTopics,
  onClearAllTopics,
  toggleFilter
}: QuizzesPageProps) => {
  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <PageHeader />

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <SearchBar
          value={filters.search}
          onChange={onSearchChange}
          onToggleFilter={toggleFilter}
          isFilterOpen={isFilterOpen}
        />

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <FilterPanel
            filters={filters}
            filterOptions={filterOptions}
            onDifficultyChange={onDifficultyChange}
            onTimeRangeChange={onTimeRangeChange}
            onTopicChange={onTopicChange}
            onSelectAllTopics={onSelectAllTopics}
            onClearAllTopics={onClearAllTopics}
          />
        )}
      </div>

      {/* Quizzes Grid or Skeleton */}
      {loading && filteredQuizzes.length === 0 ? (
        <SkeletonGrid />
      ) : (
        <motion.div
          variants={motionContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default QuizzesPage;