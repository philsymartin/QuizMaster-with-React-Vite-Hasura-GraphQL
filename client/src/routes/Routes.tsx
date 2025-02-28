import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '@layouts/MainLayout';
import AdminLayout from '@layouts/AdminLayout';
import ErrorPage from '@pages/public/ErrorPage';
import LoadingComponent from '@utils/LoadingSpinner';
import ProtectedRoute from '@components/ProtectedRoute';

const HomePage = lazy(() => import('@pages/public/HomePage'));
const LeaderboardContainer = lazy(() => import('@containers/public/LeaderboardContainer'));
const LoginPage = lazy(() => import('@pages/public/LoginPage'));
const RegisterPage = lazy(() => import('@pages/public/RegisterPage'));
const QuizzesContainer = lazy(() => import('@containers/public/QuizzesContainer'));
const QuizDetailPage = lazy(() => import('@pages/public/QuizDetailPage'));
const QuizAttemptPage = lazy(() => import('@pages/user/QuizAttemptPage'));
// user
const UserDashboardPage = lazy(() => import('@pages/user/UserDashboardPage'));
const MyQuizzesPage = lazy(() => import('@pages/user/MyQuizzesPage'));
// admin
const AdminUserManagementPage = lazy(() => import('@pages/admin/AdminUserManagementPage'));
const AdminAnalyticsPage = lazy(() => import('@pages/admin/AdminAnalyticsPage'));
const AdminDashboardContainer = lazy(() => import('@containers/admin/AdminDashboardContainer'));
const AdminQuizManagementContainer = lazy(() => import('@containers/admin/AdminQuizManagementContainer'));

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
                        <Suspense fallback={<LoadingComponent />}>
                            <UserDashboardPage />
                        </Suspense>
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
                {
                    path: "/", element: (<Suspense fallback={<LoadingComponent />}>
                        <HomePage />
                    </Suspense>)
                },
                {
                    path: "login", element: (<Suspense fallback={<LoadingComponent />}>
                        <LoginPage />
                    </Suspense>)
                },
                {
                    path: "register", element: (<Suspense fallback={<LoadingComponent />}>
                        <RegisterPage />
                    </Suspense>)
                },
                {
                    path: "quizzes", element: (<Suspense fallback={<LoadingComponent />}>
                        <QuizzesContainer />
                    </Suspense>)
                },
                {
                    path: "quizzes/:quizId", element: (<Suspense fallback={<LoadingComponent />}>
                        <QuizDetailPage />
                    </Suspense>)
                },
                {
                    path: "leaderboard", element: (<Suspense fallback={<LoadingComponent />}>
                        <LeaderboardContainer />
                    </Suspense>)
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
                {
                    path: "", element: (<Suspense fallback={<LoadingComponent />}>
                        <AdminDashboardContainer />
                    </Suspense>)
                },
                {
                    path: "analytics", element: (<Suspense fallback={<LoadingComponent />}>
                        <AdminAnalyticsPage />
                    </Suspense>),
                },
                {
                    path: "users", element: (<Suspense fallback={<LoadingComponent />}>
                        <AdminUserManagementPage />
                    </Suspense>),
                },
                {
                    path: "quizzes", element: (<Suspense fallback={<LoadingComponent />}>
                        <AdminQuizManagementContainer />
                    </Suspense>),
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default RoutesComponent; 