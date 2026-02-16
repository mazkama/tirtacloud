"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface VirtualFile {
    id: number;
    name: string;
    mime_type: string;
    size: number;
}

interface FilePreviewProps {
    file: VirtualFile | null;
    open: boolean;
    onClose: () => void;
    onDownload?: () => void;
}

export function FilePreview({ file, open, onClose, onDownload }: FilePreviewProps) {
    if (!file) return null;

    const previewUrl = `${process.env.NEXT_PUBLIC_API_URL}/vfs/preview/${file.id}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const authPreviewUrl = token ? `${previewUrl}?token=${token}` : previewUrl;

    const renderPreview = () => {
        const mimeType = file.mime_type?.toLowerCase() || '';

        // Images
        if (mimeType.includes('image')) {
            return (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                    <img
                        src={authPreviewUrl}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            );
        }

        // PDFs
        if (mimeType.includes('pdf')) {
            return (
                <iframe
                    src={authPreviewUrl}
                    className="w-full h-full border-0"
                    title={file.name}
                />
            );
        }

        // Videos
        if (mimeType.includes('video')) {
            return (
                <div className="flex items-center justify-center h-full bg-black">
                    <video
                        src={authPreviewUrl}
                        controls
                        className="max-w-full max-h-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        // Audio
        if (mimeType.includes('audio')) {
            return (
                <div className="flex items-center justify-center h-full">
                    <audio src={authPreviewUrl} controls className="w-full max-w-md">
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        }

        // Unsupported
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <X className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Preview not available</p>
                <p className="text-sm mt-2">This file type cannot be previewed</p>
                {onDownload && (
                    <Button onClick={onDownload} className="mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                    </Button>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[85vh] p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="truncate pr-4">{file.name}</DialogTitle>
                        <div className="flex gap-2">
                            {onDownload && (
                                <Button variant="outline" size="sm" onClick={onDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <div className="h-[calc(85vh-80px)] overflow-auto">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
