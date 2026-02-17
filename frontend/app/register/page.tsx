"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { AppIcon } from '@/components/shared/AppIcon';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6">
                <Link href="/" className="mb-8 flex items-center gap-2 group">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                        <AppIcon name="Logo" className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-white">
                        Tirta<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Cloud</span>
                    </span>
                </Link>

                <GlassCard className="w-full max-w-md p-8 sm:p-10 border-white/10 backdrop-blur-2xl">
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-white">Get Started</h1>
                            <p className="text-gray-400 text-sm">
                                Create an account to virtualize your cloud storage.
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <AppIcon name="User" className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <AppIcon name="Mail" className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                            <AppIcon name="Lock" className="h-4 w-4" />
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all h-11"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-300">Confirm</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                            <AppIcon name="CheckCircle" className="h-4 w-4" />
                                        </div>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            required
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2"
                                    >
                                        <AppIcon name="Alert" className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatedButton
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold h-11 rounded-lg shadow-lg shadow-purple-900/20 mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <AppIcon name="Loader" className="h-4 w-4 animate-spin" />
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </AnimatedButton>
                        </form>
                    </div>
                </GlassCard>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
