import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import HomePage from '../components/pages/public/HomePage';
import LoginPage from '../components/pages/public/LoginPage';
import RegisterPage from '../components/pages/public/RegisterPage';
import QuizzesPage from '../components/pages/public/QuizzesPage';
import QuizDetailPage from '../components/pages/public/QuizDetailPage';
import QuizAttemptPage from '../components/pages/user/QuizAttemptPage';
import UserDashboardPage from '../components/pages/user/UserDashboardPage';
import ProtectedRoute from '../components/components/ProtectedRoute';
import AdminDashboardPage from '../components/pages/admin/AdminDashboardPage';
import AdminLayout from '../components/layouts/AdminLayout';
import AdminUserManagementPage from '../components/pages/admin/AdminUserManagementPage';
import AdminQuizManagementPage from '../components/pages/admin/AdminQuizManagementPage';
import ErrorPage from '../components/pages/public/ErrorPage';
import AdminAnalyticsPage from '../components/pages/admin/AdminAnalyticsPage';
import LeaderboardPage from '../components/pages/public/LeaderboardPage';
import MyQuizzesPage from '../components/pages/user/MyQuizzesPage';
import SentimentAnalyzer from '../components/components/SentimentAnalyzer';
import FeedbackAnalysis from '../components/components/FeedbackAnalysis';

const RoutesComponent: React.FC = () => {
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
                // Public Routes
                { path: "/", element: <HomePage /> },
                { path: "login", element: <LoginPage /> },
                { path: "register", element: <RegisterPage /> },
                { path: "quizzes", element: <QuizzesPage /> },
                { path: "quizzes/:quizId", element: <QuizDetailPage /> }, // change the params passing way ???
                { path: "quizzes/:quizId/attempt", element: <QuizAttemptPage /> },  // inside teh path quizzes    ???
                { path: "leaderboard", element: <LeaderboardPage /> },
                // sample for trial
                { path: "analysis", element: <SentimentAnalyzer /> },
                { path: "analysis/feedback", element: <FeedbackAnalysis /> },
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