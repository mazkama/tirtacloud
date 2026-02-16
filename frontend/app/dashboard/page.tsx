"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Files,
    HardDrive,
    Cloud,
    Upload,
    FolderOpen,
    FileText,
    ArrowRight,
} from 'lucide-react';

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
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [recentFiles, setRecentFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, filesRes] = await Promise.all([
                api.get('/storage/stats'),
                api.get('/vfs/files?path=/'),
            ]);
            setStats(statsRes.data);
            // Show last 5 files uploaded
            const allFiles = (filesRes.data.files || [])
                .filter((f: any) => !f.is_folder)
                .slice(0, 5);
            setRecentFiles(allFiles);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.name || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your private cloud storage
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Storage
                        </CardTitle>
                        <HardDrive className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.total_storage_formatted || '0 B'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Across {stats?.account_count || 0} Google Drive account(s)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Used Storage
                        </CardTitle>
                        <Cloud className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.used_storage_formatted || '0 B'}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(stats?.usage_percent || 0, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats?.usage_percent || 0}% used
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Files Uploaded
                        </CardTitle>
                        <Files className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.file_count || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            In {stats?.folder_count || 0} folder(s)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Available
                        </CardTitle>
                        <Upload className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.available_storage_formatted || '0 B'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Free space remaining
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/files">
                    <Card className="hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer group">
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <FolderOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Browse Files</h3>
                                <p className="text-sm text-gray-500">
                                    View and manage your uploaded files
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/accounts">
                    <Card className="hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer group">
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Google Drive Accounts</h3>
                                <p className="text-sm text-gray-500">
                                    Connect more accounts for extra storage
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Files */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Files</CardTitle>
                    <Link href="/dashboard/files">
                        <Button variant="ghost" size="sm">
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentFiles.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-sm text-gray-500">
                                No files uploaded yet.
                            </p>
                            <Link href="/dashboard/files">
                                <Button variant="outline" size="sm" className="mt-3">
                                    <Upload className="h-4 w-4 mr-2" /> Upload Your First File
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 shrink-0">
                                        {file.mime_type?.split('/').pop() || 'file'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
