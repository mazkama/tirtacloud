"use client";

import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedButton } from '@/components/shared/AnimatedButton';

import { AppIcon } from '@/components/shared/AppIcon';

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Account information and preferences
                </p>
            </div>

            {/* Profile Info */}
            <GlassCard>
                <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <AppIcon name="User" className="h-8 w-8 text-purple-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-xl text-white">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-400">{user?.email || 'No email'}</p>
                    </div>
                </div>
            </GlassCard>

            {/* About */}
            <GlassCard>
                <h2 className="text-lg font-semibold text-white mb-4">About TirtaCloud</h2>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <AppIcon name="Security" className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Private Virtual Filesystem</p>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                Files uploaded through TirtaCloud are stored in an isolated
                                &quot;TirtaCloud&quot; folder in your Google Drive. They never mix
                                with your personal files and are only accessible through this app.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <AppIcon name="Mail" className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Multi-Account Support</p>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                Connect multiple Google Drive accounts to expand your storage.
                                Uploads are automatically balanced across accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Logout */}
            <GlassCard className="border-red-500/30 bg-red-950/10 hover:bg-red-950/20 transition-colors">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-red-200">Sign out</p>
                        <p className="text-xs text-red-300/70 mt-1">
                            Log out from your TirtaCloud session
                        </p>
                    </div>
                    <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                    >
                        <AppIcon name="Logout" className="h-4 w-4 mr-2" />
                        Logout
                    </AnimatedButton>
                </div>
            </GlassCard>
        </div>
    );
}
