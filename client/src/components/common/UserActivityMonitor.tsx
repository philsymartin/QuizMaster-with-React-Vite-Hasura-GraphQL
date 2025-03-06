import { useAdminMonitor } from '@services/liveblocks';
import { FiActivity, FiClock, FiMapPin, FiUser } from 'react-icons/fi';

const UserActivityMonitor = () => {
    const { getActiveUsers, getUsersByPage, getQuizActivity } = useAdminMonitor();

    const activeUsers = getActiveUsers();
    const usersByPage = getUsersByPage();
    const quizActivity = getQuizActivity();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Active Users Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                    <FiActivity className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Active Users</h3>
                </div>
                <div className="space-y-3">
                    {activeUsers.map((user) => (
                        <div key={user.connectionId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>{user.presence?.username}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(user.presence?.lastActiveAt || '').toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Locations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                    <FiMapPin className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">User Locations</h3>
                </div>
                <div className="space-y-3">
                    {Array.from(usersByPage).map(([page, users]) => (
                        <div key={page} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="font-medium mb-2">{page}</div>
                            <div className="flex flex-wrap gap-2">
                                {users.map((user) => (
                                    <span key={user.userId} className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                        {user.username}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quiz Activity */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                    <FiClock className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">Current Quiz Activity</h3>
                </div>
                <div className="space-y-3">
                    {quizActivity.map((activity) => (
                        <div key={activity.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FiUser className="w-5 h-5 text-gray-500" />
                                <span>{activity.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm ${activity.action?.type === 'attempting_quiz'
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                    }`}>
                                    {activity.action?.type === 'attempting_quiz' ? 'Taking Quiz' : 'Completed'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Quiz #{activity.action?.resourceId}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserActivityMonitor;