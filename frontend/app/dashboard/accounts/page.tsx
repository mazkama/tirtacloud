"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Cloud,
    Plus,
    Trash2,
    RefreshCw,
    CheckCircle,
    HardDrive,
    ExternalLink
} from 'lucide-react';

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Google Drive Accounts</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Connect multiple accounts to expand your storage
                    </p>
                </div>
                <Button onClick={handleLinkDrive} disabled={linking}>
                    {linking ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4 mr-2" />
                    )}
                    {linking ? 'Redirecting...' : 'Link Google Drive'}
                </Button>
            </div>

            {/* Aggregate Stats */}
            {accounts.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Total Storage</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatBytes(getTotalStorage())}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Used</p>
                                <p className="text-2xl font-bold">
                                    {formatBytes(getTotalUsed())}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatBytes(getTotalStorage() - getTotalUsed())}
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${getUsagePercent(getTotalUsed(), getTotalStorage())}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            {getUsagePercent(getTotalUsed(), getTotalStorage())}% used across {accounts.length} account(s)
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Account List */}
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : accounts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="text-center py-12">
                        <Cloud className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-2">
                            No Google Drive Accounts Linked
                        </h3>
                        <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                            Connect your Google Drive to start uploading and managing files.
                            You can link multiple accounts to increase your total storage.
                        </p>
                        <Button onClick={handleLinkDrive} disabled={linking}>
                            <Cloud className="h-4 w-4 mr-2" />
                            Link Your First Google Drive
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accounts.map((account) => {
                        const usagePercent = getUsagePercent(account.used_storage, account.total_storage);
                        return (
                            <Card key={account.id} className="relative overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-medium">
                                                    {account.account_name || 'Google Drive'}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {account.account_email}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-xs text-green-600">Connected</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Storage bar */}
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>{formatBytes(account.used_storage)} used</span>
                                                <span>{formatBytes(account.total_storage)} total</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${usagePercent > 90
                                                            ? 'bg-red-500'
                                                            : usagePercent > 70
                                                                ? 'bg-yellow-500'
                                                                : 'bg-purple-600'
                                                        }`}
                                                    style={{ width: `${usagePercent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 text-right">
                                                {usagePercent}% used — {formatBytes(account.total_storage - account.used_storage)} free
                                            </p>
                                        </div>

                                        {/* Info */}
                                        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <HardDrive className="h-3 w-3" />
                                            <span>Provider: Google Drive</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Info Note */}
            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>💡 How it works:</strong> When you upload a file, TirtaCloud automatically
                        selects the Google Drive account with the most free space. Your files are stored
                        securely and only accessible through TirtaCloud — they won't appear in your
                        regular Google Drive folders.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
