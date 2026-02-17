"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { PageTransition } from '@/components/shared/PageTransition';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#030014]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
                    <p className="text-sm text-gray-400 animate-pulse">Loading TirtaCloud...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0a0a]">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
                    {/* Background Ambient Glow */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-900/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-blue-900/5 rounded-full blur-[100px]" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10 pb-20">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                </main>
            </div>
        </div>
    );
}
