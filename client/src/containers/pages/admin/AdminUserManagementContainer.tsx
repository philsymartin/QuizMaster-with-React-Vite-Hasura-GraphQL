import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { LiveObject } from '@liveblocks/client';
import { GET_USERS } from '@queries/users';
import { DELETE_USER } from '@mutations/usersMutate'
import { USERS_SUBSCRIPTION } from '@subscriptions/userSubscription';
import { RoomProvider, getRoomId } from '@services/liveblocks';
import { RootState } from '@redux/store';
import AdminUserManagementPage from '@pages/admin/AdminUserManagementPage';
import { User } from '@pages/admin/AdminUserManagementPage/types';

const AdminUserManagementContainer = () => {
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

    return (
        <RoomProvider 
            id={getRoomId('admin')}
            initialPresence={initialPresence}
            initialStorage={initialStorage}
        >
            <AdminUserManagementPage
                loading={loading}
                error={error}
                users={filteredUsers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                handleUserSelect={handleUserSelect}
                handleDeleteClick={handleDeleteClick}
                handleConfirmDelete={handleConfirmDelete}
                handleModalClose={handleModalClose}
                handleUserUpdated={handleUserUpdated}
                deleteLoading={deleteLoading}
                subscriptionData={subscriptionData}
                subscriptionError={subscriptionError}
            />
        </RoomProvider>
    );
};

export default AdminUserManagementContainer;