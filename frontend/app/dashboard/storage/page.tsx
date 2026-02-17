"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { AppIcon } from '@/components/shared/AppIcon';
import { motion } from 'framer-motion';

interface StorageAccount {
    id: number;
    email: string;
    name: string;
    total_storage: number;
    used_storage: number;
    available_storage: number;
    usage_percent: number;
    total_storage_formatted: string;
    used_storage_formatted: string;
    available_storage_formatted: string;
}

interface StorageStats {
    total_storage: number;
    used_storage: number;
    available_storage: number;
    usage_percent: number;
    total_storage_formatted: string;
    used_storage_formatted: string;
    available_storage_formatted: string;
    account_count: number;
    file_count: number;
    folder_count: number;
    accounts: StorageAccount[];
}

export default function StoragePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/storage/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch storage stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <AppIcon name="Loader" className="h-10 w-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center p-20">
                <p className="text-gray-500">Failed to load storage stats</p>
                <AnimatedButton onClick={fetchStats} className="mt-4 bg-purple-600 text-white">
                    Retry
                </AnimatedButton>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Storage Overview</h1>
                <AnimatedButton onClick={fetchStats} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <AppIcon name="Refresh" className="h-4 w-4 mr-2" />
                    Refresh
                </AnimatedButton>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <GlassCard>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Storage</h3>
                        <AppIcon name="Storage" className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.total_storage_formatted}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Across {stats.account_count} account(s)
                        </p>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-gray-400">Used Storage</h3>
                        <AppIcon name="Trending" className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.used_storage_formatted}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.usage_percent}% of total
                        </p>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-gray-400">Available</h3>
                        <AppIcon name="CloudSync" className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.available_storage_formatted}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Free space remaining
                        </p>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-gray-400">Items</h3>
                        <AppIcon name="File" className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.file_count}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.folder_count} folder(s)
                        </p>
                    </div>
                </GlassCard>
            </div>

            {/* Overall Progress */}
            <GlassCard className="from-purple-900/10 to-blue-900/10">
                <h3 className="font-semibold text-white mb-4">Overall Storage Usage</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-300">
                            {stats.used_storage_formatted} / {stats.total_storage_formatted}
                        </span>
                        <span className="text-gray-400">
                            {stats.usage_percent}%
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.usage_percent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full shadow-lg shadow-purple-900/50"
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Per-Account Breakdown */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-white">Drive Breakdown</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {stats.accounts.map((account) => (
                        <GlassCard key={account.id} hoverEffect>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <AppIcon name="CloudSync" className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-white truncate">{account.name || 'Google Drive'}</h3>
                                    <p className="text-sm text-gray-400 truncate">
                                        {account.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-300">
                                            {account.used_storage_formatted} / {account.total_storage_formatted}
                                        </span>
                                        <span className="text-gray-500">
                                            {account.usage_percent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${account.usage_percent}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="bg-blue-500 h-full rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-white/5">
                                    <div>
                                        <p className="text-gray-500 text-xs">Used</p>
                                        <p className="font-medium text-gray-300">{account.used_storage_formatted}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs">Available</p>
                                        <p className="font-medium text-gray-300">{account.available_storage_formatted}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {stats.accounts.length === 0 && (
                    <GlassCard className="border-dashed border-2 bg-transparent text-center py-10">
                        <AppIcon name="CloudSync" className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-6">
                            No Google Drive accounts connected
                        </p>
                        <AnimatedButton className="bg-purple-600 text-white">Link Google Drive</AnimatedButton>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
