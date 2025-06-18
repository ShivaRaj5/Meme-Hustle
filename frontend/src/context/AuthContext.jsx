import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token and get user profile
            authAPI.getProfile()
                .then(({ user }) => {
                    setUser(user);
                    setIsLoggedIn(true);
                })
                .catch((error) => {
                    console.error('Token verification failed:', error);
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (userData) => {
        try {
            const { user, token } = await authAPI.login(userData);
            localStorage.setItem('token', token);
            setUser(user);
            setIsLoggedIn(true);
            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        }
    };

    const signup = async (userData) => {
        try {
            const { user, token } = await authAPI.signup(userData);
            localStorage.setItem('token', token);
            setUser(user);
            setIsLoggedIn(true);
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Signup failed');
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
        toast.success('Logged out successfully');
    };

    const updateUserCredits = async (newCredits) => {
        try {
            const { user: updatedUser } = await authAPI.updateCredits(newCredits);
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            toast.error('Failed to update credits');
            return { success: false, error: error.message };
        }
    };

    const refreshUser = async () => {
        try {
            const { user: refreshedUser } = await authAPI.getProfile();
            setUser(refreshedUser);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoggedIn, 
            loading,
            login, 
            logout, 
            signup, 
            updateUserCredits,
            refreshUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}; 