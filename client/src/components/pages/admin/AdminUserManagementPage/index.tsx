import { FiEdit, FiSearch, FiTrash2, FiUserPlus } from 'react-icons/fi';
import UserActivityMonitor from '@components/AdminUserManagement/UserActivityMonitor';
import AdminUserEditModal from '@components/AdminUserManagement/AdminUserEditModal';
import AdminCreateUserModal from '@components/AdminUserManagement/AdminCreateUserModal';
import LoadingComponent from '@utils/LoadingSpinner';
import DeleteConfirmationModal from '@components/DeleteConfirmationModal';
import { AdminUserManagementPageProps, User } from '@pages/admin/AdminUserManagementPage/types';

const AdminUserManagementPage: React.FC<AdminUserManagementPageProps> = ({
    loading,
    error,
    users,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedUser,
    setSelectedUser,
    confirmDelete,
    setConfirmDelete,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleUserSelect,
    handleDeleteClick,
    handleConfirmDelete,
    handleModalClose,
    handleUserUpdated,
    deleteLoading,
    subscriptionData,
    subscriptionError
}) => {
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
        <div className="space-y-6 p-6">
            <UserActivityMonitor />
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and monitor user accounts
                        {subscriptionData ? " (real-time updates enabled)" : ""}</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white 
                       rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                    title='create a new user'
                >
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
                        title='search users by name'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white 
                       dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 cursor-pointer"
                    title='filter on role'
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'all' | 'user' | 'admin')}
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white 
                       dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 cursor-pointer"
                    title='filter on status'
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
            <DeleteConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName="this user"
                confirmationText="Are you sure you want to delete"
                isLoading={deleteLoading}
                warningMessage="This action cannot be undone."
            />

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
                            {users.map((user: User) => (
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
                                        {new Date(user.created_at).toLocaleDateString("en-IN")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.last_active).toLocaleDateString("en-IN")}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {new Date(user.last_active).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                                title='edit user'
                                                onClick={() => handleUserSelect(user)}>
                                                <FiEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                                title='delete user'
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
                onUserCreated={() => { }}
            />
        </div>
    );
};

export default AdminUserManagementPage;