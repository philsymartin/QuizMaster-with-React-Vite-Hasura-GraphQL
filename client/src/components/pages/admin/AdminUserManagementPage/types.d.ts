export interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'deleted' | 'banned';
    created_at: string;
    last_active: string;
}
export interface AdminUserManagementPageProps {
    loading: boolean;
    error: any;
    users: User[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedRole: 'all' | 'user' | 'admin';
    setSelectedRole: (role: 'all' | 'user' | 'admin') => void;
    selectedStatus: 'all' | 'active' | 'inactive' | 'deleted' | 'banned';
    setSelectedStatus: (status: 'all' | 'active' | 'inactive' | 'deleted' | 'banned') => void;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (open: boolean) => void;
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    confirmDelete: number | null;
    setConfirmDelete: (id: number | null) => void;
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (open: boolean) => void;
    handleUserSelect: (user: User) => void;
    handleDeleteClick: (user: User) => void;
    handleConfirmDelete: () => void;
    handleModalClose: () => void;
    handleUserUpdated: () => void;
    deleteLoading: boolean;
    subscriptionData: any;
    subscriptionError: any;
}