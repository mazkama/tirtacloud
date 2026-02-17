"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { FileGridItem } from '@/components/dashboard/files/FileGridItem';
import { FileListItem } from '@/components/dashboard/files/FileListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AppIcon } from '@/components/shared/AppIcon';
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    // Share state
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [sharePreviewUrl, setSharePreviewUrl] = useState('');
    const [shareDownloadUrl, setShareDownloadUrl] = useState('');
    const [sharingFileId, setSharingFileId] = useState<number | null>(null);
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Drag & Drop state
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    useEffect(() => {
        fetchFiles();
        // Storage stats updated via dashboard home or separate component, no need to fetch here often
        // unless we want to show a bar here too.
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
    const handleDownload = async (file: VirtualFile) => {
        try {
            const response = await api.get(`/vfs/download/${file.id}`);
            window.open(response.data.url, '_blank');
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const handleDelete = async (file: VirtualFile) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            await api.delete(`/vfs/files/${file.id}`);
            fetchFiles();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    // ===== Share =====
    const handleShare = async (file: VirtualFile) => {
        setSharing(true);
        setSharingFileId(file.id);
        try {
            const response = await api.post('/vfs/share', { file_id: file.id });
            const link = response.data.share_link;
            setShareUrl(link.url);
            setSharePreviewUrl(link.preview_url);
            setShareDownloadUrl(link.download_url);
            setShareDialogOpen(true);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create share link');
        } finally {
            setSharing(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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

    const formatSize = (bytes: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    // ===== Drag & Drop Handlers =====
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev - 1);
        if (dragCounter - 1 === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setDragCounter(0);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            setUploadFiles(files);
            setUploadDialogOpen(true);
            setUploadError(null);
            setUploadSuccess(null);
        }
    };

    return (
        <div
            className="space-y-6 relative min-h-[500px]"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-purple-600/20 backdrop-blur-sm border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-[#0a0a0a] p-8 rounded-full shadow-2xl border border-purple-500/30 text-center">
                            <AppIcon name="CloudUpload" className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold text-white mb-2">Drop files to upload</h3>
                            <p className="text-gray-400">Release to add files to {currentPath === '/' ? 'home' : 'current folder'}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Filesystem</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage your secure cloud storage
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/5 p-1 rounded-lg flex border border-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                viewMode === 'grid' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <AppIcon name="Grid" className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                viewMode === 'list' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <AppIcon name="List" className="h-4 w-4" />
                        </button>
                    </div>

                    <AnimatedButton
                        variant="outline"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        onClick={() => setCreateFolderOpen(true)}
                    >
                        <AppIcon name="NewFolder" className="h-4 w-4 mr-2" />
                        New Folder
                    </AnimatedButton>
                    <AnimatedButton
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        <AppIcon name="Upload" className="h-4 w-4 mr-2" />
                        Upload
                    </AnimatedButton>
                </div>
            </div>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1 text-sm bg-white/5 border border-white/5 rounded-xl px-4 py-3 overflow-x-auto custom-scrollbar">
                {currentPath !== '/' && (
                    <button
                        onClick={navigateUp}
                        className="p-1.5 hover:bg-white/10 rounded-lg mr-2 text-gray-400 hover:text-white transition-colors"
                        title="Go back"
                    >
                        <AppIcon name="ArrowRight" className="h-4 w-4 rotate-180" />
                    </button>
                )}
                <div className="flex items-center">
                    {breadcrumbs.map((crumb, i) => (
                        <div key={crumb.path} className="flex items-center gap-1 shrink-0">
                            {i > 0 && <AppIcon name="ChevronRight" className="h-4 w-4 text-gray-600 mx-1" />}
                            <button
                                onClick={() => navigateToBreadcrumb(crumb)}
                                className={cn(
                                    "px-2 py-1 rounded-lg transition-colors flex items-center gap-2",
                                    i === breadcrumbs.length - 1
                                        ? "font-semibold text-purple-400 bg-purple-500/10"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {i === 0 && <AppIcon name="Home" className="h-4 w-4" />}
                                <span>{crumb.name}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center p-20 h-[50vh] items-center">
                    <div className="flex flex-col items-center">
                        <AppIcon name="Loader" className="h-10 w-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-500 text-sm">Loading contents...</p>
                    </div>
                </div>
            ) : files.length === 0 ? (
                <GlassCard className="border-dashed border-2 bg-transparent">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <AppIcon name="Files" className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {currentPath === '/' ? 'Your cloud is empty' : 'Empty directory'}
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-sm">
                            {currentPath === '/'
                                ? 'Get started by creating a folder or dragging files here to upload.'
                                : 'This folder is empty. Upload files to get started.'}
                        </p>
                        <div className="flex gap-4">
                            <AnimatedButton variant="outline" onClick={() => setCreateFolderOpen(true)} className="border-white/10">
                                <AppIcon name="NewFolder" className="h-4 w-4 mr-2" /> New Folder
                            </AnimatedButton>
                            <AnimatedButton onClick={() => setUploadDialogOpen(true)} className="bg-purple-600">
                                <AppIcon name="Upload" className="h-4 w-4 mr-2" /> Upload Files
                            </AnimatedButton>
                        </div>
                    </div>
                </GlassCard>
            ) : (
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {files.map((file) => (
                                <FileGridItem
                                    key={file.id}
                                    file={file}
                                    onNavigate={navigateToFolder}
                                    onPreview={setPreviewFile}
                                    onDownload={handleDownload}
                                    onShare={handleShare}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2 bg-white/5 rounded-xl border border-white/5 p-2"
                        >
                            {files.map((file) => (
                                <FileListItem
                                    key={file.id}
                                    file={file}
                                    onNavigate={navigateToFolder}
                                    onPreview={setPreviewFile}
                                    onDownload={handleDownload}
                                    onShare={handleShare}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* ===== CREATE FOLDER DIALOG ===== */}
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
                <DialogContent className="sm:max-w-sm bg-[#0a0a0a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <Input
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                autoFocus
                                className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Creating in: <span className="text-purple-400 font-mono">{currentPath}</span>
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setCreateFolderOpen(false)} className="hover:bg-white/5 hover:text-white">
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim() || creatingFolder}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {creatingFolder ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== UPLOAD DIALOG ===== */}
            <Dialog open={uploadDialogOpen} onOpenChange={closeUploadDialog}>
                <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Upload Files</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center transition-colors hover:border-purple-500/50 hover:bg-purple-500/5 relative">
                            <input
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
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <AppIcon name="Upload" className="h-10 w-10 text-purple-500 mb-3" />
                                <p className="font-medium">Click to browse or drag files here</p>
                                <p className="text-xs text-gray-500 mt-1">Uploading to {currentPath}</p>
                            </div>
                        </div>

                        {uploadFiles.length > 0 && (
                            <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                {uploadFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                                        <span className="truncate flex-1">{file.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">{formatSize(file.size)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {uploading && (
                            <div className="space-y-2">
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                            </div>
                        )}

                        {uploadSuccess && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm flex items-center">
                                <AppIcon name="Check" className="h-4 w-4 mr-2" /> {uploadSuccess}
                            </div>
                        )}

                        {uploadError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                                {uploadError}
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={closeUploadDialog} disabled={uploading} className="hover:bg-white/5 hover:text-white">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploadFiles.length === 0 || uploading}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                size="sm"
                            >
                                {uploading ? 'Uploading...' : 'Start Upload'}
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
                onDownload={async () => { if (previewFile) await handleDownload(previewFile); }}
            />

            {/* ===== SHARE LINK DIALOG ===== */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AppIcon name="Share" className="h-5 w-5 text-purple-500" />
                            Share Link
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        {/* Main share URL */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Public Share Page</label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={shareUrl}
                                    className="text-sm font-mono bg-white/5 border-white/10 text-gray-300"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(shareUrl)}
                                    className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                                >
                                    {copied ? <AppIcon name="Check" className="h-4 w-4 text-green-500" /> : <AppIcon name="Copy" className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Direct URLs */}
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#0a0a0a] px-2 text-xs text-gray-500">Direct Access (Hotlink)</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Preview URL</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value={sharePreviewUrl}
                                            className="text-xs font-mono bg-white/5 border-white/10 text-gray-400 h-8"
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(sharePreviewUrl)}
                                            className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                                            title="Copy preview URL"
                                        >
                                            <AppIcon name="Copy" className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Download URL</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value={shareDownloadUrl}
                                            className="text-xs font-mono bg-white/5 border-white/10 text-gray-400 h-8"
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(shareDownloadUrl)}
                                            className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                                            title="Copy download URL"
                                        >
                                            <AppIcon name="Copy" className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-xs text-blue-400">
                                Anyone with these links can view and download the file. No login required.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
