"use client";

import { AppIcon } from '@/components/shared/AppIcon';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="h-16 flex items-center px-4 md:px-8 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-40">
            <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-400 hover:text-white md:hidden">
                <AppIcon name="Menu" className="h-6 w-6" />
            </button>
            <div className="ml-2 md:ml-0 flex-1 flex items-center justify-between">
                <div>
                    {/* Breadcrumbs or Page Title placeholder - can be dynamic later */}
                    <span className="text-sm text-gray-500">Dashboard</span>
                </div>
                {/* Right side actions (Notifications, Search) can go here */}
            </div>
        </header>
    );
}
