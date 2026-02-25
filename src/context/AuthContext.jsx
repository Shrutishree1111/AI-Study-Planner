import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        const storedUser = localStorage.getItem('study_user');
        const token = localStorage.getItem('study_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('study_token', data.token);
            localStorage.setItem('study_user', JSON.stringify(data.user));
            setUser(data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            return true;
        } catch (err) {
            toast.error(err.message);
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            toast.success('Registration successful! Please login.');
            return true;
        } catch (err) {
            toast.error(err.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('study_token');
        localStorage.removeItem('study_user');
        setUser(null);
        toast('Logged out', { icon: '👋' });
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
