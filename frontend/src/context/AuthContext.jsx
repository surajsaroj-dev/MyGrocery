import { createContext, useState, useEffect } from 'react';
import api from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔐 Attempting login to:', api.defaults.baseURL + '/api/auth/login');
            console.log('📧 Email:', email);
            const { data } = await api.post('/api/auth/login', {
                email,
                password,
            });
            console.log('✅ Login successful:', data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Attempting registration to:', api.defaults.baseURL + '/api/auth/register');
            console.log('👤 User data:', { ...userData, password: '***' });
            const { data } = await api.post('/api/auth/register', userData);
            console.log('✅ Registration successful:', data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            console.error('❌ Registration error:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
