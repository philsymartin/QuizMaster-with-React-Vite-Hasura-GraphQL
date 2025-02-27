const API_URL = import.meta.env.VITE_API_URL as string;

export interface LoginResponse {
    user: {
        user_id: number;
        username: string;
        email: string;
        role: string;
    };
    expiresIn: number;
    message: string;
    accessToken: string;
}

export interface RefreshTokenResponse {
    expiresIn: number;
    message: string;
    accessToken: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
};
export const registerUser = async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }
    return response.json();
};

export const logoutUser = async (): Promise<void> => {
    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
    const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }
    return response.json();
};
