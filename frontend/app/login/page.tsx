"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie', {
                baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')
            });
            const response = await api.post('/api/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-black">
            {/* Left Side - Hero/Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="z-10 text-center space-y-4 p-12">
                    <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Access your unified cloud storage dashboard and manage your files efficiently.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-md border-0 shadow-lg dark:bg-[#111] dark:border dark:border-gray-800">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Enter your email below to login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="dark:bg-[#0a0a0a]"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                    <Link href="#" className="text-sm text-purple-600 hover:text-purple-500">Forgot password?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="dark:bg-[#0a0a0a]"
                                />
                            </div>
                            {error && (
                                <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account? <Link href="/register" className="text-purple-600 hover:underline">Register</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
