import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Authentication Context
 * Manages user authentication state across the application
 * 
 * TODO: Phase 4 - Add token refresh logic
 * TODO: Phase 4 - Add remember me functionality
 * TODO: Phase 4 - Add session timeout handling
 */

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load token and user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // Fetch current user with the token
            fetchCurrentUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch current user from API
    const fetchCurrentUser = async (authToken) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
            } else {
                // Token is invalid, clear it
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Register new user
    const register = async (email, password, fullName) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, fullName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store token and user
            localStorage.setItem('token', data.data.token);
            setToken(data.data.token);
            setUser(data.data.user);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user
            localStorage.setItem('token', data.data.token);
            setToken(data.data.token);
            setUser(data.data.user);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
