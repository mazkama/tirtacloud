"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    cloud_accounts?: any[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.post('/login', { email, password });
        const { access_token, user } = response.data;

        localStorage.setItem('token', access_token);
        setUser(user);
        router.push('/dashboard');
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: password
        });
        const { access_token, user } = response.data;

        localStorage.setItem('token', access_token);
        setUser(user);
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            // Call backend logout to revoke token
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear frontend state regardless of backend response
            localStorage.removeItem('token');
            setUser(null);
            router.push('/');
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
