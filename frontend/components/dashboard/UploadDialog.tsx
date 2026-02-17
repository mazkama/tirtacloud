"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/axios';

import { AppIcon } from '@/components/shared/AppIcon';

interface UploadDialogProps {
    open: boolean;
    onClose: () => void;
    currentPath: string;
    onUploadComplete: () => void;
}

export function UploadDialog({ open, onClose, currentPath, onUploadComplete }: UploadDialogProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('path', currentPath);

                const response = await api.post('/vfs/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            ((i + progressEvent.loaded / progressEvent.total!) / files.length) * 100
                        );
                        setProgress(percentCompleted);
                    },
                });

                if (i === files.length - 1) {
                    setSelectedAccount(response.data.account_used);
                }
            }

            // Success
            setTimeout(() => {
                onUploadComplete();
                handleClose();
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFiles([]);
        setProgress(0);
        setSelectedAccount(null);
        setError(null);
        onClose();
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Select one or more files to upload
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {files.length} file(s) selected
                            </p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                    >
                                        <span className="truncate flex-1">{file.name}</span>
                                        {!uploading && (
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="ml-2 text-gray-400 hover:text-red-500"
                                            >
                                                <AppIcon name="Close" className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-xs text-gray-500 text-center">{progress}%</p>
                        </div>
                    )}

                    {selectedAccount && !uploading && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                ✓ Uploaded to: <strong>{selectedAccount.email}</strong>
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                            className="flex-1"
                        >
                            <AppIcon name="Upload" className="h-4 w-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
