"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    FileText,
    Image as ImageIcon,
    Film,
    Music,
    MoreHorizontal,
    Download,
    Trash2,
    Folder,
    Upload,
    Plus,
    ChevronRight,
    Home
} from 'lucide-react';

interface VirtualFile {
    id: number;
    name: string;
    mime_type: string;
    size: number;
    is_folder: boolean;
    virtual_path: string;
    cloud_account_id: number;
    created_at: string;
}

export default function FilesPage() {
    const { user } = useAuth();
    const [files, setFiles] = useState<VirtualFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('/');
    const [storageStats, setStorageStats] = useState<any>(null);

    useEffect(() => {
        fetchFiles();
        fetchStorageStats();
    }, [currentPath]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/vfs/files?path=${encodeURIComponent(currentPath)}`);
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Failed to fetch files', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStorageStats = async () => {
        try {
            const response = await api.get('/storage/stats');
            setStorageStats(response.data);
        } catch (error) {
            console.error('Failed to fetch storage stats', error);
        }
    };

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
    };

    const handleFileClick = (file: VirtualFile) => {
        if (file.is_folder) {
            handleNavigate(file.virtual_path);
        }
    };

    const handleDownload = async (fileId: number) => {
        try {
            const response = await api.get(`/vfs/download/${fileId}`);
            window.open(response.data.url, '_blank');
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const handleDelete = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.delete(`/vfs/files/${fileId}`);
            fetchFiles();
            fetchStorageStats();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const getFileIcon = (file: VirtualFile) => {
        if (file.is_folder) return <Folder className="h-4 w-4 text-yellow-500" />;
        if (file.mime_type?.includes('image')) return <ImageIcon className="h-4 w-4 text-purple-500" />;
        if (file.mime_type?.includes('video')) return <Film className="h-4 w-4 text-red-500" />;
        if (file.mime_type?.includes('audio')) return <Music className="h-4 w-4 text-blue-500" />;
        return <FileText className="h-4 w-4 text-gray-500" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const getBreadcrumbs = () => {
        if (currentPath === '/') return [{ name: 'Home', path: '/' }];
        const parts = currentPath.split('/').filter(Boolean);
        const breadcrumbs = [{ name: 'Home', path: '/' }];
        let accumulatedPath = '';
        parts.forEach(part => {
            accumulatedPath += '/' + part;
            breadcrumbs.push({ name: part, path: accumulatedPath });
        });
        return breadcrumbs;
    };

    return (
        <div className="space-y-6">
            {/* Header with Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Files</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {getBreadcrumbs().map((crumb, index) => (
                            <div key={crumb.path} className="flex items-center gap-2">
                                {index > 0 && <ChevronRight className="h-4 w-4" />}
                                <button
                                    onClick={() => handleNavigate(crumb.path)}
                                    className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                    {index === 0 ? <Home className="h-4 w-4" /> : crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        New Folder
                    </Button>
                    <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </Button>
                </div>
            </div>

            {/* Storage Indicator */}
            {storageStats && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Storage Usage</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {storageStats.used_storage_formatted} / {storageStats.total_storage_formatted}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${storageStats.usage_percent}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                                {storageStats.account_count} account(s) connected
                            </span>
                            <span className="text-xs text-gray-500">
                                {storageStats.usage_percent}% used
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Files Table */}
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : files.length === 0 ? (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-center text-gray-500">No files found</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                        <p className="text-sm text-gray-400 mb-4">
                            {currentPath === '/'
                                ? 'Upload files or link a Google Drive account to get started.'
                                : 'This folder is empty.'}
                        </p>
                        <Button>Upload File</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-md border bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow
                                    key={file.id}
                                    className={file.is_folder ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                                    onClick={() => file.is_folder && handleFileClick(file)}
                                >
                                    <TableCell>{getFileIcon(file)}</TableCell>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{file.is_folder ? '-' : formatSize(file.size)}</TableCell>
                                    <TableCell className="text-gray-500 text-xs">
                                        {file.is_folder ? 'Folder' : file.mime_type}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!file.is_folder && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                                                        <Download className="mr-2 h-4 w-4" /> Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(file.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
