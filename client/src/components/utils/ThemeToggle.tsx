import { useTheme } from '@utils/ThemeProvider';
import { FiMoon, FiSun } from 'react-icons/fi';

const ThemeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-lg 
                hover:bg-gray-100 dark:hover:bg-gray-700 
                transition-colors duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
        >
            <div className="relative w-5 h-5 transition-opacity duration-200">
                <FiSun
                    className={`absolute inset-0 w-full h-full text-gray-600 dark:text-gray-300 transform transition-transform duration-200 
                     ${isDarkMode ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                />
                <FiMoon
                    className={`absolute inset-0 w-full h-full text-gray-600 dark:text-gray-300 transform transition-transform duration-200 
                     ${!isDarkMode ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;