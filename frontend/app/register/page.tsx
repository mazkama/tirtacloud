"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie', {
                baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')
            });
            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            localStorage.setItem('token', response.data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-black">
            {/* Left Side - Hero/Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-600/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="z-10 text-center space-y-4 p-12">
                    <h1 className="text-4xl font-bold tracking-tight">Join TirtaCloud</h1>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Create an account to start unifying your cloud storage experience today.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-md border-0 shadow-lg dark:bg-[#111] dark:border dark:border-gray-800">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>Enter your email below to create your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none">Name</label>
                                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="dark:bg-[#0a0a0a]" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="dark:bg-[#0a0a0a]" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="dark:bg-[#0a0a0a]" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password_confirmation" className="text-sm font-medium leading-none">Confirm Password</label>
                                <Input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required className="dark:bg-[#0a0a0a]" />
                            </div>
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-3 rounded-md bg-red-50 text-red-500 text-sm dark:bg-red-900/20 dark:text-red-400"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Already have an account? <Link href="/login" className="text-purple-600 hover:underline">Login</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
