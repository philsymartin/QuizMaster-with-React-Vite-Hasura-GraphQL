import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@utils/ThemeProvider';
import { store } from '@redux/store';
import { FiAlertTriangle } from 'react-icons/fi';

const ErrorContent = () => {
    const error = useRouteError();

    const getErrorMessage = () => {
        if (isRouteErrorResponse(error)) {
            switch (error.status) {
                case 404:
                    return "Oops! The page you're looking for doesn't exist.";
                case 401:
                    return 'Sorry! You need to be logged in to access this page.';
                case 403:
                    return "Sorry! You don't have permission to access this page.";
                default:
                    return 'Oops! Something went wrong.';
            }
        }
        return 'An unexpected error occurred.';
    };

    const getErrorStatus = () => {
        if (isRouteErrorResponse(error)) {
            return error.status;
        }
        return 'Error';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-200">
            <div className="text-center">
                <div className="flex justify-center mb-8">
                    <FiAlertTriangle className="w-24 h-24 text-purple-600 dark:text-purple-400" />
                </div>

                <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                    {getErrorStatus()}
                </h1>

                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                    {getErrorMessage()}
                </p>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex justify-center items-center px-6 py-3 text-lg font-semibold rounded-xl
                     bg-gradient-to-r from-purple-600 to-blue-500
                     hover:from-purple-700 hover:to-blue-600
                     dark:from-purple-500 dark:to-blue-400
                     dark:hover:from-purple-600 dark:hover:to-blue-500
                     text-white transform hover:scale-105 transition-all
                     shadow-lg hover:shadow-xl group"
                    >
                        Return Home
                        <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Wrapper component that provides all necessary contexts
const ErrorPage = () => {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <ErrorContent />
            </ThemeProvider>
        </Provider>
    );
};

export default ErrorPage;