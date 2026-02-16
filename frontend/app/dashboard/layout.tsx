"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Cloud,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    Files,
    HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Files', href: '/dashboard/files', icon: Files },
        { name: 'Storage', href: '/dashboard/storage', icon: HardDrive },
        { name: 'Accounts', href: '/dashboard/accounts', icon: Cloud },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="font-bold text-xl tracking-tight">
                        <span className="text-purple-600">Tirta</span>Cloud
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-4rem)] justify-between p-4">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                    )}>
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-3 py-3 border-t border-gray-200 dark:border-gray-800">
                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate dark:text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-semibold ml-2">TirtaCloud</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
