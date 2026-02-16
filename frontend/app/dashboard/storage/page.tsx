"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    HardDrive,
    Cloud,
    RefreshCw,
    TrendingUp
} from 'lucide-react';

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
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500">Failed to load storage stats</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Storage</h1>
                <Button onClick={fetchStats} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_storage_formatted}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {stats.account_count} account(s)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Used Storage</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.used_storage_formatted}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.usage_percent}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.available_storage_formatted}</div>
                        <p className="text-xs text-muted-foreground">
                            Free space remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Files</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.file_count}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.folder_count} folder(s)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Overall Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Overall Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                                {stats.used_storage_formatted} / {stats.total_storage_formatted}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                {stats.usage_percent}%
                            </span>
                        </div>
                        <Progress value={stats.usage_percent} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Per-Account Breakdown */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Accounts</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {stats.accounts.map((account) => (
                        <Card key={account.id}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Cloud className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <CardTitle className="text-lg">{account.name || account.email}</CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {account.email}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">
                                            {account.used_storage_formatted} / {account.total_storage_formatted}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {account.usage_percent}%
                                        </span>
                                    </div>
                                    <Progress value={account.usage_percent} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Used</p>
                                        <p className="font-medium">{account.used_storage_formatted}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Available</p>
                                        <p className="font-medium">{account.available_storage_formatted}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {stats.accounts.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="text-center py-8">
                            <Cloud className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                No Google Drive accounts connected
                            </p>
                            <Button>Link Google Drive</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
