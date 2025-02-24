import { useState } from 'react';
import { Search, Edit, Trash2, UserPlus, Mail } from 'lucide-react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_USERS } from '../../../api/queries/users';
import { USERS_SUBSCRIPTION } from '../../../api/subscriptions/userSubscription';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
    created_at: string;
    last_active: string;
}

const AdminUserManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'admin'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const { loading: queryLoading, error: queryError, data: queryData } = useQuery(GET_USERS, {
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
    // Subscribe to real-time updates
    const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = useSubscription(USERS_SUBSCRIPTION, {
        onError: (error) => {
            console.error('Subscription Error:', {
                message: error.message,
                graphQLErrors: error.graphQLErrors,
                networkError: error.networkError,
            });
        }
    });
    // Combine initial data with subscription updates
    const users = subscriptionData?.users || queryData?.users || [];
    const loading = queryLoading && !users.length;
    const error = queryError || subscriptionError;

    const filteredUsers = users.filter((user: User) => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and monitor user accounts
                        {subscriptionData ? " (real-time updates enabled)" : ""}</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white 
                           rounded-lg hover:bg-purple-700 transition-colors">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add New User
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            {/* Subscription indicator */}
            {subscriptionError && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 
                      dark:border-yellow-800 rounded-lg p-3 text-yellow-700 dark:text-yellow-400">
                    <p>Real-time updates unavailable. Using latest fetched data.</p>
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
                                  ${user.status === 'active' ?
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.created_at}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.last_active}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagementPage;
