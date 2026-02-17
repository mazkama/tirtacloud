"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { GlassCard } from '@/components/shared/GlassCard';
import {
    Cloud,
    Plus,
    RefreshCw,
    CheckCircle,
    HardDrive,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CloudAccount {
    id: number;
    provider: string;
    account_email: string;
    account_name: string;
    total_storage: number;
    used_storage: number;
    is_active: boolean;
    expires_at: string;
    created_at: string;
}

export default function AccountsPage() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<CloudAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/storage/accounts');
            setAccounts(response.data.accounts || []);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkDrive = async () => {
        setLinking(true);
        try {
            const response = await api.get('/drive/auth-url');
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get auth URL', error);
            setLinking(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const getUsagePercent = (used: number, total: number) => {
        if (!total) return 0;
        return Math.round((used / total) * 100);
    };

    const getTotalStorage = () => {
        return accounts.reduce((sum, acc) => sum + (acc.total_storage || 0), 0);
    };

    const getTotalUsed = () => {
        return accounts.reduce((sum, acc) => sum + (acc.used_storage || 0), 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Google Drive Accounts</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Connect multiple accounts to expand your storage
                    </p>
                </div>
                <AnimatedButton
                    onClick={handleLinkDrive}
                    disabled={linking}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {linking ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4 mr-2" />
                    )}
                    {linking ? 'Redirecting...' : 'Link Google Drive'}
                </AnimatedButton>
            </div>

            {/* Aggregate Stats */}
            {accounts.length > 0 && (
                <GlassCard className="from-purple-900/20 to-blue-900/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Total Storage</p>
                            <p className="text-3xl font-bold text-white">
                                {formatBytes(getTotalStorage())}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Used</p>
                            <p className="text-3xl font-bold text-purple-400">
                                {formatBytes(getTotalUsed())}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Available</p>
                            <p className="text-3xl font-bold text-green-400">
                                {formatBytes(getTotalStorage() - getTotalUsed())}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Usage</span>
                            <span>{getUsagePercent(getTotalUsed(), getTotalStorage())}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getUsagePercent(getTotalUsed(), getTotalStorage())}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full"
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
                        </p>
                    </div>
                </GlassCard>
            )}

            {/* Account List */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                </div>
            ) : accounts.length === 0 ? (
                <GlassCard className="border-dashed border-2 bg-transparent">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Cloud className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No Google Drive Accounts Linked
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Connect your Google Drive to start uploading and managing files.
                            You can link multiple accounts to increase your total storage.
                        </p>
                        <AnimatedButton onClick={handleLinkDrive} disabled={linking} className="bg-white/10 hover:bg-white/20 text-white">
                            <Cloud className="h-4 w-4 mr-2" />
                            Link Your First Google Drive
                        </AnimatedButton>
                    </div>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((account) => {
                        const usagePercent = getUsagePercent(account.used_storage, account.total_storage);
                        return (
                            <GlassCard key={account.id} hoverEffect className="flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                                            <Cloud className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">
                                                {account.account_name || 'Google Drive'}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {account.account_email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                        <span className="text-xs font-medium text-green-400">Connected</span>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    {/* Storage bar */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                                            <span>{formatBytes(account.used_storage)} used</span>
                                            <span>{formatBytes(account.total_storage)} total</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${usagePercent}%` }}
                                                transition={{ duration: 1 }}
                                                className={`h-full rounded-full ${usagePercent > 90
                                                    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                                    : usagePercent > 70
                                                        ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                                        : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                    }`}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-right">
                                            {usagePercent}% used — {formatBytes(account.total_storage - account.used_storage)} free
                                        </p>
                                    </div>

                                    {/* Info */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-white/5 mt-auto">
                                        <HardDrive className="h-3 w-3" />
                                        <span>Provider: Google Drive</span>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}

            {/* Info Note */}
            <GlassCard className="bg-blue-500/5 from-blue-500/5 to-transparent border-blue-500/20">
                <p className="text-sm text-blue-300">
                    <strong className="text-blue-200">💡 How it works:</strong> When you upload a file, TirtaCloud automatically
                    selects the Google Drive account with the most free space. Your files are stored
                    securely and only accessible through TirtaCloud — they won't appear in your
                    regular Google Drive folders.
                </p>
            </GlassCard>
        </div>
    );
}
