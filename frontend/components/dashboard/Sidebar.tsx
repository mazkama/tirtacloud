"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppIcon, IconName } from '@/components/shared/AppIcon';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems: { name: string; href: string; icon: IconName }[] = [
        { name: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
        { name: 'Files', href: '/dashboard/files', icon: 'Files' },
        { name: 'Storage', href: '/dashboard/storage', icon: 'Storage' },
        { name: 'Accounts', href: '/dashboard/accounts', icon: 'Accounts' },
        { name: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
    ];

    const sidebarWidth = isCollapsed ? "w-[70px]" : "w-64";

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 70 : 256 }}
                className={cn(
                    "fixed md:static inset-y-0 left-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    !isOpen && "md:w-auto" // Let framer motion handle width on desktop
                )}
            >
                {/* Header */}
                <div className={cn("h-16 flex items-center px-4 border-b border-white/5", isCollapsed ? "justify-center" : "justify-between")}>
                    {!isCollapsed && (
                        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                <AppIcon name="Logo" className="h-5 w-5 text-white" />
                            </div>
                            <span>Tirta<span className="text-purple-400">Cloud</span></span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <AppIcon name="Logo" className="h-5 w-5 text-white" />
                        </div>
                    )}

                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
                        <AppIcon name="Close" className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors absolute -right-3 top-20 border border-white/10 z-50"
                    >
                        <AppIcon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} className="h-3 w-3" />
                    </button>
                </div>

                {/* Nav */}
                <div className="flex-1 flex flex-col justify-between py-6 px-3 custom-scrollbar overflow-y-auto">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-purple-500/10 text-purple-400"
                                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
                                        isCollapsed && "justify-center px-2"
                                    )}>
                                        <AppIcon name={item.icon} className={cn("h-5 w-5", isActive && "text-purple-400")} />
                                        {!isCollapsed && <span>{item.name}</span>}

                                        {/* Active Indicator Strip */}
                                        {isActive && !isCollapsed && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute left-0 top-2 bottom-2 w-1 bg-purple-500 rounded-r-full"
                                            />
                                        )}

                                        {/* Tooltip for Collapsed */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {item.name}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/5", isCollapsed && "justify-center bg-transparent border-0")}>
                            <div className="h-9 w-9 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-500/20">
                                <AppIcon name="User" className="h-4 w-4 text-purple-300" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 justify-start",
                                isCollapsed && "justify-center px-0"
                            )}
                            onClick={() => logout()}
                        >
                            <AppIcon name="Logout" className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                            {!isCollapsed && "Logout"}
                        </Button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
