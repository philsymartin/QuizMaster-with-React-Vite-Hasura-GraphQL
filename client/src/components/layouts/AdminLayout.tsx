import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@components/NavBar';
import AdminSidebar from '@components/AdminSidebar';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleToggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar onToggleSidebar={handleToggleSidebar} />
            <div className="flex flex-1">
                <AdminSidebar isOpen={isSidebarOpen} />
                <main
                    className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'
                        }`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
            <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        © 2025 QuizMaster. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;