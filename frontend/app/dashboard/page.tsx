"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { motion } from 'framer-motion';
import {
    Files,
    HardDrive,
    Cloud,
    Upload,
    FolderOpen,
    FileText,
    ArrowRight,
    Loader2,
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
            // Adding a small artificial delay to show off the loading state/skeleton if needed, 
            // but for now just fetching.
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12 h-[50vh] items-center">
                <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user?.name}</span>
                </h1>
                <p className="text-gray-400">
                    Your cloud infrastructure is running smoothly.
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard hoverEffect className="p-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">Total Storage</span>
                        <HardDrive className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {stats?.total_storage_formatted || '0 B'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Across <span className="text-purple-400">{stats?.account_count || 0}</span> nodes
                        </p>
                    </div>
                </GlassCard>

                <GlassCard hoverEffect className="p-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">Used Storage</span>
                        <Cloud className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {stats?.used_storage_formatted || '0 B'}
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(stats?.usage_percent || 0, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats?.usage_percent || 0}% utilized
                        </p>
                    </div>
                </GlassCard>

                <GlassCard hoverEffect className="p-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">Files Uploaded</span>
                        <Files className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {stats?.file_count || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            In {stats?.folder_count || 0} directories
                        </p>
                    </div>
                </GlassCard>

                <GlassCard hoverEffect className="p-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-gray-400">Available</span>
                        <Upload className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {stats?.available_storage_formatted || '0 B'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Capacity remaining
                        </p>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/files">
                    <GlassCard hoverEffect className="group cursor-pointer border-l-4 border-l-purple-500 h-full flex items-center">
                        <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <FolderOpen className="h-7 w-7 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors">Browse Filesystem</h3>
                            <p className="text-sm text-gray-400">
                                View, manage, and share your uploaded content
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </GlassCard>
                </Link>

                <Link href="/dashboard/accounts">
                    <GlassCard hoverEffect className="group cursor-pointer border-l-4 border-l-blue-500 h-full flex items-center">
                        <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <Cloud className="h-7 w-7 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">Manage Accounts</h3>
                            <p className="text-sm text-gray-400">
                                Connect new Google Drive nodes to expand storage
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </GlassCard>
                </Link>
            </motion.div>

            {/* Recent Files */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="font-semibold text-white flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-purple-400" /> Recent Uploads
                        </h3>
                        <Link href="/dashboard/files">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                                View All <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="p-2">
                        {recentFiles.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-gray-600 mb-4 opacity-50" />
                                <p className="text-gray-400 mb-4">
                                    No artifacts found in the system.
                                </p>
                                <Link href="/dashboard/files">
                                    <AnimatedButton size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                                        <Upload className="h-4 w-4 mr-2" /> Upload Artifact
                                    </AnimatedButton>
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentFiles.map((file, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={file.id}
                                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors rounded-lg group"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                            <FileText className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-purple-300 transition-colors">{file.name}</p>
                                            <p className="text-xs text-gray-500">{formatSize(file.size)} • {new Date(file.created_at || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-xs text-gray-500 border border-white/10 px-2 py-1 rounded bg-black/20">
                                            {file.mime_type?.split('/').pop() || 'file'}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}

