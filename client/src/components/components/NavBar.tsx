import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import useNavBar from '../../containers/hooks/useNavBar';
import ThemeToggle from '../utils/ThemeToggle';

interface NavBarProps {
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
    const location = useLocation();
    const { user, isDropdownOpen, setIsDropdownOpen, dropdownRef, handleLogout } = useNavBar();

    const isAdminPage = location.pathname.startsWith('/admin-dashboard');

    const isActivePath = (path: string): boolean => {
        return location.pathname === path;
    };

    const linkStyles = (path: string): string => `
        relative px-3 py-2 transition-colors duration-200
        ${isActivePath(path)
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400'}`;

    const renderAuthSection = () => {
        if (user) {
            return (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 
                                 text-white font-semibold flex items-center justify-center"
                        aria-label="User menu"
                    >
                        {user.username ? user.username.slice(0, 2).toUpperCase() : 'U'}
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 
                                      shadow-lg py-1 border border-gray-100 dark:border-gray-700
                                      z-50">
                            {user.role === 'admin' ? (
                                <Link
                                    to="/admin-dashboard"
                                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 
                                         hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Admin Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/user-dashboard"
                                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 
                                         hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    My Profile
                                </Link>
                            )}
                            <button
                                className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400
                                         hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 
                         dark:from-purple-500 dark:to-blue-400 dark:hover:from-purple-600 dark:hover:to-blue-500 
                         text-white px-6 py-2 rounded-xl font-semibold transform hover:scale-105 transition-all
                         shadow-md hover:shadow-lg"
            >
                Login
            </Link>
        );
    };

    return (
        <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/*chechout the tailwind css   */}
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-4">
                        {/* Sidebar Toggle Button - Only shown on admin pages */}
                        {isAdminPage && onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                                         transition-colors focus:outline-none focus:ring-2 
                                         focus:ring-purple-500"
                                aria-label="Toggle Sidebar"
                            >
                                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        )}
                        <Link to="/" className="flex items-center space-x-2 group">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                                         dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent 
                                         group-hover:scale-105 transition-transform">
                                QuizMaster
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/quizzes" className={linkStyles('/quizzes')}>
                            Quizzes
                        </Link>
                        <Link to="/leaderboard" className={linkStyles('/leaderboard')}>
                            Leaderboard
                        </Link>
                        {user && user.role !== 'admin' && (
                            <Link to="/my-quizzes" className={linkStyles('/my-quizzes')}>
                                My Quizzes
                            </Link>
                        )}
                        <ThemeToggle />
                        {renderAuthSection()}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;

