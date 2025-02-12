import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center px-4 py-16 bg-gradient-to-b from-transparent via-white/5 to-transparent dark:from-transparent dark:via-black/5 dark:to-transparent rounded-3xl backdrop-blur-sm">
        <h1 className="text-6xl font-extrabold mb-8 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
          Welcome to QuizMaster
        </h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
            Test your knowledge with our interactive quizzes and compete with others in this
            <span className="text-purple-600 dark:text-purple-400 font-semibold"> exciting </span>
            learning journey!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Link
              to="/quizzes"
              className="inline-flex justify-center items-center px-6 py-3 text-lg font-semibold rounded-xl
                         bg-gradient-to-r from-purple-600 to-blue-500
                         hover:from-purple-700 hover:to-blue-600
                         dark:from-purple-500 dark:to-blue-400
                         dark:hover:from-purple-600 dark:hover:to-blue-500
                         text-white transform hover:scale-105 transition-all
                         shadow-lg hover:shadow-xl group"
            >
              Start a Quiz
              <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex justify-center items-center px-6 py-3 text-lg font-semibold rounded-xl
                         bg-gradient-to-r from-pink-500 to-rose-500
                         hover:from-pink-600 hover:to-rose-600
                         dark:from-pink-400 dark:to-rose-400
                         dark:hover:from-pink-500 dark:hover:to-rose-500
                         text-white transform hover:scale-105 transition-all
                         shadow-lg hover:shadow-xl group"
            >
              View Leaderboard
              <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
            </Link>
          </div>
          <div className="mt-16 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Join thousands of learners worldwide
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-100"></div>
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;