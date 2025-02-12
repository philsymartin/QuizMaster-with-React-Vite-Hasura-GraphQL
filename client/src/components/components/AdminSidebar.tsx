import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    X,
    Users,
    BookOpen,
    Award,
    Settings,
    AlertCircle,
    Home
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const menuItems = [
        { icon: Home, label: 'Overview', path: '/admin-dashboard' },
        { icon: Users, label: 'User Management', path: '/admin-dashboard/users' },
        { icon: BookOpen, label: 'Quiz Management', path: '/admin-dashboard/quizzes' },
        { icon: Award, label: 'Results & Analytics', path: '/admin-dashboard/analytics' },
        { icon: AlertCircle, label: 'Reports', path: '/admin-dashboard/reports' },
        { icon: Settings, label: 'Settings', path: '/admin-dashboard/settings' },
    ];

    return (
        <motion.div
            initial={{ x: -280 }}
            animate={{ x: isOpen ? 0 : -280 }}
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
                       shadow-xl transition-all duration-300 z-20
                       ${isOpen ? 'w-72' : 'w-0'}`}
        >
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                                     dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                            Admin Panel
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                                     transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-4">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg
                                     text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                                     dark:hover:bg-gray-700 transition-colors mb-2"
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 
                                      flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                {user?.username?.slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {user?.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Administrator
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminSidebar;