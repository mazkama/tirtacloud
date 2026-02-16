"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    FolderPlus,
    ChevronRight,
    Home,
    Eye,
    ArrowLeft
} from 'lucide-react';
import { FilePreview } from '@/components/dashboard/FilePreview';

interface VirtualFile {
    id: number;
    name: string;
    mime_type: string;
    size: number;
    is_folder: boolean;
    virtual_path: string;
    parent_virtual_id: number | null;
    cloud_account_id: number;
    created_at: string;
}

interface BreadcrumbItem {
    name: string;
    path: string;
    folderId: number | null;
}

export default function FilesPage() {
    const { user } = useAuth();
    const [files, setFiles] = useState<VirtualFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('/');
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ name: 'Home', path: '/', folderId: null }]);
    const [storageStats, setStorageStats] = useState<any>(null);

    // Upload state
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    // Create folder state
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);

    // Preview state
    const [previewFile, setPreviewFile] = useState<VirtualFile | null>(null);

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

    // ===== Navigation =====
    const navigateToFolder = (folder: VirtualFile) => {
        setCurrentPath(folder.virtual_path);
        setCurrentFolderId(folder.id);
        setBreadcrumbs(prev => [
            ...prev,
            { name: folder.name, path: folder.virtual_path, folderId: folder.id }
        ]);
    };

    const navigateToBreadcrumb = (crumb: BreadcrumbItem) => {
        setCurrentPath(crumb.path);
        setCurrentFolderId(crumb.folderId);
        // Trim breadcrumbs to this point
        const idx = breadcrumbs.findIndex(b => b.path === crumb.path);
        if (idx >= 0) {
            setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
        }
    };

    const navigateUp = () => {
        if (breadcrumbs.length > 1) {
            const parentCrumb = breadcrumbs[breadcrumbs.length - 2];
            navigateToBreadcrumb(parentCrumb);
        }
    };

    // ===== File Actions =====
    const handleFileClick = (file: VirtualFile) => {
        if (file.is_folder) {
            navigateToFolder(file);
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
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            await api.delete(`/vfs/files/${fileId}`);
            fetchFiles();
            fetchStorageStats();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    // ===== Create Folder =====
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        setCreatingFolder(true);
        try {
            await api.post('/vfs/create-folder', {
                name: newFolderName.trim(),
                parent_id: currentFolderId,
            });
            setNewFolderName('');
            setCreateFolderOpen(false);
            fetchFiles();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create folder');
        } finally {
            setCreatingFolder(false);
        }
    };

    // ===== Upload =====
    const handleUpload = async () => {
        if (uploadFiles.length === 0) return;

        setUploading(true);
        setUploadError(null);
        setUploadSuccess(null);
        setUploadProgress(0);

        try {
            for (let i = 0; i < uploadFiles.length; i++) {
                const file = uploadFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('path', currentPath);
                if (currentFolderId !== null) {
                    formData.append('parent_id', String(currentFolderId));
                }

                await api.post('/vfs/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const pct = Math.round(
                            ((i + (progressEvent.loaded / (progressEvent.total || 1))) / uploadFiles.length) * 100
                        );
                        setUploadProgress(pct);
                    },
                });
            }

            setUploadSuccess(`${uploadFiles.length} file(s) uploaded successfully!`);
            setTimeout(() => {
                setUploadDialogOpen(false);
                setUploadFiles([]);
                setUploadProgress(0);
                setUploadSuccess(null);
                fetchFiles();
                fetchStorageStats();
            }, 1000);
        } catch (err: any) {
            setUploadError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const closeUploadDialog = () => {
        if (!uploading) {
            setUploadDialogOpen(false);
            setUploadFiles([]);
            setUploadProgress(0);
            setUploadError(null);
            setUploadSuccess(null);
        }
    };

    // ===== Helpers =====
    const getFileIcon = (file: VirtualFile) => {
        if (file.is_folder) return <Folder className="h-5 w-5 text-yellow-500" />;
        const mime = file.mime_type || '';
        if (mime.includes('image')) return <ImageIcon className="h-5 w-5 text-purple-500" />;
        if (mime.includes('video')) return <Film className="h-5 w-5 text-red-500" />;
        if (mime.includes('audio')) return <Music className="h-5 w-5 text-blue-500" />;
        if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
        return <FileText className="h-5 w-5 text-gray-400" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">My Files</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Private files uploaded through TirtaCloud
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateFolderOpen(true)}
                    >
                        <FolderPlus className="h-4 w-4 mr-1" />
                        New Folder
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 overflow-x-auto">
                {currentPath !== '/' && (
                    <button
                        onClick={navigateUp}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1"
                        title="Go back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                )}
                {breadcrumbs.map((crumb, i) => (
                    <div key={crumb.path} className="flex items-center gap-1 shrink-0">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                        <button
                            onClick={() => navigateToBreadcrumb(crumb)}
                            className={`px-1.5 py-0.5 rounded text-sm transition-colors ${i === breadcrumbs.length - 1
                                    ? 'font-semibold text-purple-600 dark:text-purple-400'
                                    : 'text-gray-500 hover:text-purple-600 dark:hover:text-purple-400'
                                }`}
                        >
                            {i === 0 ? (
                                <Home className="h-4 w-4 inline" />
                            ) : crumb.name}
                        </button>
                    </div>
                ))}
            </div>

            {/* Storage Bar (compact) */}
            {storageStats && (
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(storageStats.usage_percent || 0, 100)}%` }}
                        />
                    </div>
                    <span className="shrink-0">
                        {storageStats.used_storage_formatted} / {storageStats.total_storage_formatted}
                    </span>
                </div>
            )}

            {/* Files Table */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : files.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="text-center py-12">
                        <Folder className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 font-medium mb-1">
                            {currentPath === '/' ? 'No files yet' : 'Empty folder'}
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                            {currentPath === '/'
                                ? 'Create a folder or upload files to get started'
                                : 'Upload files to this folder'}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)}>
                                <FolderPlus className="h-4 w-4 mr-1" /> New Folder
                            </Button>
                            <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                                <Upload className="h-4 w-4 mr-1" /> Upload
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-lg border bg-white dark:bg-gray-900 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden sm:table-cell w-[100px]">Size</TableHead>
                                <TableHead className="hidden md:table-cell w-[120px]">Date</TableHead>
                                <TableHead className="w-[50px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow
                                    key={file.id}
                                    className={file.is_folder ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                    onClick={() => handleFileClick(file)}
                                >
                                    <TableCell className="pr-0">{getFileIcon(file)}</TableCell>
                                    <TableCell className="font-medium">
                                        <span className="truncate block max-w-[300px]">{file.name}</span>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-gray-500 text-sm">
                                        {file.is_folder ? '-' : formatSize(file.size)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                                        {formatDate(file.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {!file.is_folder && (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPreviewFile(file);
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" /> Preview
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(file.id);
                                                        }}>
                                                            <Download className="mr-2 h-4 w-4" /> Download
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {file.is_folder && (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigateToFolder(file);
                                                    }}>
                                                        <Folder className="mr-2 h-4 w-4" /> Open
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(file.id);
                                                    }}
                                                    className="text-red-600"
                                                >
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

            {/* ===== CREATE FOLDER DIALOG ===== */}
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Input
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Creating in: {currentPath === '/' ? 'Root' : breadcrumbs[breadcrumbs.length - 1]?.name}
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim() || creatingFolder}
                            >
                                {creatingFolder ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== UPLOAD DIALOG ===== */}
            <Dialog open={uploadDialogOpen} onOpenChange={closeUploadDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Files</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-2">
                                Uploading to: <strong>{currentPath === '/' ? 'Root' : breadcrumbs[breadcrumbs.length - 1]?.name}</strong>
                            </p>
                            <Input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setUploadFiles(Array.from(e.target.files));
                                        setUploadError(null);
                                        setUploadSuccess(null);
                                    }
                                }}
                                disabled={uploading}
                                className="cursor-pointer"
                            />
                        </div>

                        {uploadFiles.length > 0 && (
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {uploadFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        <span className="truncate flex-1">{file.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">{formatSize(file.size)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {uploading && (
                            <div className="space-y-1">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">{uploadProgress}%</p>
                            </div>
                        )}

                        {uploadSuccess && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                                <p className="text-sm text-green-700 dark:text-green-300">✓ {uploadSuccess}</p>
                            </div>
                        )}

                        {uploadError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleUpload}
                                disabled={uploadFiles.length === 0 || uploading}
                                className="flex-1"
                                size="sm"
                            >
                                <Upload className="h-4 w-4 mr-1" />
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={closeUploadDialog} disabled={uploading}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== FILE PREVIEW ===== */}
            <FilePreview
                file={previewFile}
                open={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onDownload={async () => { if (previewFile) await handleDownload(previewFile.id); }}
            />
        </div>
    );
}
