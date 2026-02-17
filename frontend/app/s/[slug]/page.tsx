"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { AppIcon } from '@/components/shared/AppIcon';

interface SharedFile {
    name: string;
    mime_type: string;
    size: number;
    has_password: boolean;
}

export default function SharePage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [file, setFile] = useState<SharedFile | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    useEffect(() => {
        if (slug) fetchShareInfo();
    }, [slug]);

    const fetchShareInfo = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/share/${slug}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Share link not found or expired');
                return;
            }

            setFile(data.file);
            setPreviewUrl(data.preview_url);
            setDownloadUrl(data.download_url);
            setExpiresAt(data.expires_at);
        } catch (err) {
            setError('Failed to load shared file');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = () => {
        if (!file) return <AppIcon name="File" className="h-16 w-16 text-gray-400" />;
        const mime = file.mime_type?.toLowerCase() || '';
        if (mime.includes('image')) return <AppIcon name="Image" className="h-16 w-16 text-purple-500" />;
        if (mime.includes('video')) return <AppIcon name="Video" className="h-16 w-16 text-red-500" />;
        if (mime.includes('audio')) return <AppIcon name="Audio" className="h-16 w-16 text-blue-500" />;
        if (mime.includes('pdf')) return <AppIcon name="File" className="h-16 w-16 text-red-600" />;
        return <AppIcon name="File" className="h-16 w-16 text-gray-400" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const canPreview = () => {
        if (!file) return false;
        const mime = file.mime_type?.toLowerCase() || '';
        return mime.includes('image') || mime.includes('video') || mime.includes('audio') || mime.includes('pdf');
    };

    const renderPreview = () => {
        if (!file) return null;
        const mime = file.mime_type?.toLowerCase() || '';

        if (mime.includes('image')) {
            return (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ maxHeight: '70vh' }}>
                    <img src={previewUrl} alt={file.name} className="max-w-full max-h-[70vh] object-contain" />
                </div>
            );
        }
        if (mime.includes('pdf')) {
            return (
                <iframe src={previewUrl} className="w-full border-0 rounded-lg" style={{ height: '70vh' }} title={file.name} />
            );
        }
        if (mime.includes('video')) {
            return (
                <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
                    <video src={previewUrl} controls className="max-w-full" style={{ maxHeight: '70vh' }}>
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }
        if (mime.includes('audio')) {
            return (
                <div className="flex items-center justify-center p-8">
                    <audio src={previewUrl} controls className="w-full max-w-md" />
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="text-center py-12">
                        <AppIcon name="Alert" className="h-12 w-12 mx-auto text-red-400 mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Link Not Available</h2>
                        <p className="text-sm text-gray-500">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100">
            {/* Top bar */}
            <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AppIcon name="Logo" className="h-5 w-5 text-purple-600" />
                        <span className="font-bold text-lg">
                            <span className="text-purple-600">Tirta</span>Cloud
                        </span>
                    </div>
                    {expiresAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <AppIcon name="Clock" className="h-3 w-3" />
                            Expires {new Date(expiresAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
                {/* File info card */}
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {getFileIcon()}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-xl font-bold break-all">{file?.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {file?.mime_type} · {formatSize(file?.size || 0)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {canPreview() && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        <AppIcon name="Preview" className="h-4 w-4 mr-2" />
                                        {showPreview ? 'Hide Preview' : 'Preview'}
                                    </Button>
                                )}
                                <Button
                                    onClick={() => window.open(downloadUrl, '_blank')}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <AppIcon name="Download" className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview area */}
                {showPreview && (
                    <Card>
                        <CardContent className="p-2">
                            {renderPreview()}
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-400">
                    Shared via <span className="text-purple-500 font-medium">TirtaCloud</span> — Private cloud storage
                </p>
            </div>
        </div>
    );
}
