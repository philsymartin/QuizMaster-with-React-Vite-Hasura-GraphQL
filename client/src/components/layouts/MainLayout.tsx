import { Outlet } from 'react-router-dom';
import Navbar from '@components/NavBar';
const MainLayout = () => {

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto transition-colors duration-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        © 2025 QuizMaster. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
