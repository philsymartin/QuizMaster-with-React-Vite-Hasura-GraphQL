import { useState } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_USERS } from '@queries/users';
import { DELETE_USER } from '@mutations/usersMutate'
import { USERS_SUBSCRIPTION } from '@subscriptions/userSubscription';
import { RoomProvider, getRoomId } from '@services/liveblocks';
import UserActivityMonitor from '@components/UserActivityMonitor';
import { LiveObject } from '@liveblocks/client';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import LoadingComponent from '@utils/LoadingSpinner';
import AdminUserEditModal from '@components/AdminUserEditModal';
import AdminCreateUserModal from '@components/AdminCreateUserModal';
import { FiAlertTriangle, FiEdit, FiSearch, FiTrash2, FiUserPlus } from 'react-icons/fi';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'deleted' | 'banned';
    created_at: string;
    last_active: string;
}

const AdminUserManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'admin'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'deleted' | 'banned'>('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const user = useSelector((state: RootState) => state.auth.user);

    const initialPresence = {
        currentPage: window.location.pathname,
        isActive: true,
        lastActiveAt: new Date().toISOString(),
        userId: user?.user_id?.toString() || '',
        username: user?.username || '',
        currentAction: {
            type: 'viewing' as const,
            startedAt: new Date().toISOString(),
        },
    };

    const initialStorage = {
        userSessions: new LiveObject({})
    };

    const { loading: queryLoading, error: queryError, data: queryData, refetch } = useQuery(GET_USERS, {
        fetchPolicy: 'cache-and-network',
        onError: (error) => {
            console.error('GraphQL Error Details:', {
                message: error.message,
                graphQLErrors: error.graphQLErrors,
                networkError: error.networkError,
                extraInfo: error.extraInfo
            });
        }
    });

    const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = useSubscription(USERS_SUBSCRIPTION, {
        onError: (error) => {
            console.error('Subscription Error:', {
                message: error.message,
                graphQLErrors: error.graphQLErrors,
                networkError: error.networkError,
            });
        }
    });

    const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
        onCompleted: () => {
            refetch();
            setConfirmDelete(null);
        },
        onError: (error) => {
            console.error('Delete User Error:', error);
            setConfirmDelete(null);
        }
    });

    // Combine initial data with subscription updates
    const users = subscriptionData?.users || queryData?.users || [];
    const loading = queryLoading && !users.length;
    const error = queryError || subscriptionError;

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setConfirmDelete(user.id);
    };

    const handleConfirmDelete = () => {
        if (confirmDelete) {
            deleteUser({
                variables: {
                    user_id: confirmDelete
                }
            });
        }
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleUserUpdated = () => {
        refetch();
    };

    const filteredUsers = users.filter((user: User) => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) { return <LoadingComponent />; }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Error loading users
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {error.message}
                </p>
            </div>
        );
    }

    return (
        <RoomProvider id={getRoomId('admin')}
            initialPresence={initialPresence}
            initialStorage={initialStorage}>
            <div className="space-y-6 p-6">
                <UserActivityMonitor />
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage and monitor user accounts
                            {subscriptionData ? " (real-time updates enabled)" : ""}</p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white 
                           rounded-lg hover:bg-purple-700 transition-colors">
                        <FiUserPlus className="w-5 h-5 mr-2" />
                        Add New User
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 
                      rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white 
                   dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'all' | 'user' | 'admin')}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white 
                   dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive' | 'deleted' | 'banned')}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="deleted">Deleted</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>

                {/* Subscription indicator */}
                {subscriptionError && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 
                      dark:border-yellow-800 rounded-lg p-3 text-yellow-700 dark:text-yellow-400">
                        <p>Real-time updates unavailable. Using latest fetched data.</p>
                    </div>
                )}

                {/* Delete confirmation */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                            <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
                                <FiAlertTriangle className="w-6 h-6 mr-2" />
                                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-6">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                           dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                           dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                           dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                           dark:text-gray-400 uppercase tracking-wider">Join Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                           dark:text-gray-400 uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 
                           dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredUsers.map((user: User) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 
                                     dark:bg-purple-900/30 flex items-center justify-center">
                                                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                                        {user.username.slice(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${user.role === 'admin' ?
                                                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(user.last_active).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(user.last_active).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                    onClick={() => handleUserSelect(user)}>
                                                    <FiEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                </button>
                                                <button
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                    onClick={() => handleDeleteClick(user)}>
                                                    <FiTrash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit User Modal */}
                <AdminUserEditModal
                    isOpen={isEditModalOpen}
                    onClose={handleModalClose}
                    user={selectedUser}
                    onUserUpdated={handleUserUpdated}
                />
                <AdminCreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onUserCreated={() => {
                    }}
                />
            </div>
        </RoomProvider>
    );
};

export default AdminUserManagementPage;