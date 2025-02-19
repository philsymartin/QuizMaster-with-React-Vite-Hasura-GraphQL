import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import HomePage from '../components/pages/public/HomePage';
import LoginPage from '../components/pages/public/LoginPage';
import RegisterPage from '../components/pages/public/RegisterPage';
import QuizzesPage from '../components/pages/public/QuizzesPage';
import QuizDetailPage from '../components/pages/public/QuizDetailPage';
import QuizAttemptPage from '../components/pages/user/QuizAttemptPage';
import LeaderboardPage from '../components/pages/user/LeaderboardPage';
import UserDashboardPage from '../components/pages/user/UserDashboardPage';
import ProtectedRoute from '../components/components/ProtectedRoute';
import AdminDashboardPage from '../components/pages/admin/AdminDashboardPage';
import AdminLayout from '../components/layouts/AdminLayout';
import AdminUserManagementPage from '../components/pages/admin/AdminUserManagementPage';
import AdminQuizManagementPage from '../components/pages/admin/AdminQuizManagementPage';
import ErrorPage from '../components/pages/public/ErrorPage';
import AdminAnalyticsPage from '../components/pages/admin/AdminAnalyticsPage';

const RoutesComponent: React.FC = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <MainLayout />,
            errorElement: <ErrorPage />,
            children: [
                // Public Routes
                { path: "/", element: <HomePage /> },
                { path: "login", element: <LoginPage /> },
                { path: "register", element: <RegisterPage /> },
                { path: "quizzes", element: <QuizzesPage /> },
                { path: "quizzes/:quizId", element: <QuizDetailPage /> }, // change the params passing way ???
                { path: "quizzes/:quizId/attempt", element: <QuizAttemptPage /> },  // inside teh path quizzes    ???
                { path: "leaderboard", element: <LeaderboardPage /> },

                // Protected Routes     make protected rout first ??? 
                {
                    path: "user-dashboard",
                    element: (
                        <ProtectedRoute requiredRole="user">
                            <UserDashboardPage />
                        </ProtectedRoute>
                    ),
                },
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