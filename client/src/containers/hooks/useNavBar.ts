import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../../redux/auth/authSlice';
import { RootState } from '../../redux/store';

const useNavBar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            dispatch(logoutRequest());
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return {
        user,
        isDropdownOpen,
        setIsDropdownOpen,
        dropdownRef,
        handleLogout,
    };
};

export default useNavBar;
