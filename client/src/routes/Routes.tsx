import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@pages/public/HomePage';
import LoginPage from '@pages/public/LoginPage';
import RegisterPage from '@pages/public/RegisterPage';
import QuizzesPage from '@pages/public/QuizzesPage';
import QuizDetailPage from '@pages/public/QuizDetailPage';
import QuizAttemptPage from '@pages/user/QuizAttemptPage';
import UserDashboardPage from '@pages/user/UserDashboardPage';
import ProtectedRoute from '@components/ProtectedRoute';
import AdminDashboardPage from '@pages/admin/AdminDashboardPage';
import AdminLayout from '@layouts/AdminLayout';
import AdminUserManagementPage from '@pages/admin/AdminUserManagementPage';
import AdminQuizManagementPage from '@pages/admin/AdminQuizManagementPage';
import ErrorPage from '@pages/public/ErrorPage';
import AdminAnalyticsPage from '@pages/admin/AdminAnalyticsPage';
import LeaderboardPage from '@pages/public/LeaderboardPage';
import MyQuizzesPage from '@pages/user/MyQuizzesPage';
const RoutesComponent = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <MainLayout />,
            errorElement: <ErrorPage />,
            children: [
                // Protected Routes    
                {
                    path: "user-dashboard", element: (<ProtectedRoute requiredRole="user">
                        <UserDashboardPage />
                    </ProtectedRoute>),
                },
                {
                    path: "my-quizzes", element: (<ProtectedRoute requiredRole="user">
                        <MyQuizzesPage />
                    </ProtectedRoute>),
                },
                {
                    path: "quizzes/:quizId/attempt", element: (<ProtectedRoute requiredRole="user">
                        <QuizAttemptPage />
                    </ProtectedRoute>),
                },
                // Public Routes
                { path: "/", element: <HomePage /> },
                { path: "login", element: <LoginPage /> },
                { path: "register", element: <RegisterPage /> },
                { path: "quizzes", element: <QuizzesPage /> },
                { path: "quizzes/:quizId", element: <QuizDetailPage /> },
                { path: "leaderboard", element: <LeaderboardPage /> },
            ],
        },
        {
            path: "/admin-dashboard",
            element: (
                <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                </ProtectedRoute>
            ),
            errorElement: <ErrorPage />,
            children: [
                { path: "", element: <AdminDashboardPage /> },
                { path: "analytics", element: <AdminAnalyticsPage /> },
                { path: "users", element: <AdminUserManagementPage /> },
                { path: "quizzes", element: <AdminQuizManagementPage /> },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default RoutesComponent; 