import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    confirmationText?: string;
    isLoading?: boolean;
    deleteButtonText?: string;
    warningMessage?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName = 'this item',
    confirmationText = 'Are you sure you want to delete',
    isLoading = false,
    deleteButtonText = 'Delete',
    warningMessage = 'This action cannot be undone.'
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="inset-0 bg-black/50 flex items-center justify-center 
            z-[50] w-full h-full overflow-hidden 
            fixed top-0 left-0 right-0 bottom-0"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 
                max-w-md w-full mx-4 shadow-2xl"
            >
                <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
                    <FiAlertTriangle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {confirmationText} "{itemName}"?
                    <br /><br />
                    {warningMessage}
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                        rounded-md text-gray-700 dark:text-gray-300 
                        hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 
                        text-white rounded-md disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? 'Deleting...' : deleteButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;