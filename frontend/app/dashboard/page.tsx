"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
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
import { Button } from '@/components/ui/button';
import {
    FileText,
    Image as ImageIcon,
    Film,
    Music,
    MoreHorizontal,
    Download,
    Trash2,
    Folder
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await api.get('/drive/files');
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Failed to fetch files', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileId: string) => {
        try {
            const response = await api.get(`/api/drive/files/${fileId}/download`);
            window.open(response.data.url, '_blank');
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.delete(`/api/drive/files/${fileId}`);
            fetchFiles(); // Refresh list
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('image')) return <ImageIcon className="h-4 w-4 text-purple-500" />;
        if (mimeType.includes('video')) return <Film className="h-4 w-4 text-red-500" />;
        if (mimeType.includes('audio')) return <Music className="h-4 w-4 text-blue-500" />;
        if (mimeType.includes('folder')) return <Folder className="h-4 w-4 text-yellow-500" />;
        return <FileText className="h-4 w-4 text-gray-500" />;
    };

    const formatSize = (bytes: string) => {
        if (!bytes) return '-';
        const num = parseInt(bytes);
        if (num < 1024) return num + ' B';
        if (num < 1024 * 1024) return (num / 1024).toFixed(1) + ' KB';
        return (num / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
                <Button>Upload File</Button>
            </div>

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
                        <p className="text-sm text-gray-400 mb-4">Link a Google Drive account to see your files.</p>
                        <Link href="/dashboard/drive">
                            <Button variant="outline">Manage Accounts</Button>
                        </Link>
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
                                <TableRow key={file.id}>
                                    <TableCell>{getFileIcon(file.mimeType)}</TableCell>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{formatSize(file.size)}</TableCell>
                                    <TableCell className="text-gray-500 text-xs">{file.mimeType}</TableCell>
                                    <TableCell className="text-right">
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
                                                <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
