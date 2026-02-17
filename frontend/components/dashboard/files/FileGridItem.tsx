"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/shared/AppIcon";

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

interface FileGridItemProps {
    file: VirtualFile;
    onNavigate: (file: VirtualFile) => void;
    onPreview: (file: VirtualFile) => void;
    onDownload: (file: VirtualFile) => void;
    onShare: (file: VirtualFile) => void;
    onDelete: (file: VirtualFile) => void;
}

export function FileGridItem({
    file,
    onNavigate,
    onPreview,
    onDownload,
    onShare,
    onDelete
}: FileGridItemProps) {

    const getFileIcon = (file: VirtualFile) => {
        if (file.is_folder) return <AppIcon name="Folder" className="h-10 w-10 text-yellow-500 drop-shadow-lg" />;
        const mime = file.mime_type || '';
        if (mime.includes('image')) return <AppIcon name="Image" className="h-10 w-10 text-purple-500" />;
        if (mime.includes('video')) return <AppIcon name="Video" className="h-10 w-10 text-red-500" />;
        if (mime.includes('audio')) return <AppIcon name="Audio" className="h-10 w-10 text-blue-500" />;
        if (mime.includes('pdf')) return <AppIcon name="File" className="h-10 w-10 text-red-600" />;
        return <AppIcon name="File" className="h-10 w-10 text-gray-400" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <GlassCard
                className={cn(
                    "p-4 cursor-pointer group relative flex flex-col h-full",
                    file.is_folder ? "hover:bg-yellow-500/5 hover:border-yellow-500/30" : "hover:bg-purple-500/5 hover:border-purple-500/30"
                )}
            >
                {/* Click Handler */}
                <div
                    className="absolute inset-0 z-0"
                    onClick={() => file.is_folder ? onNavigate(file) : onPreview(file)}
                />

                <div className="flex justify-between items-start relative z-10 mb-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                        {getFileIcon(file)}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <AppIcon name="More" className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-[#1a1a1a] border-white/10 text-white">
                            {!file.is_folder && (
                                <>
                                    <DropdownMenuItem onClick={() => onPreview(file)}>
                                        <AppIcon name="Preview" className="mr-2 h-4 w-4" /> Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDownload(file)}>
                                        <AppIcon name="Download" className="mr-2 h-4 w-4" /> Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onShare(file)}>
                                        <AppIcon name="Share" className="mr-2 h-4 w-4" /> Share
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                </>
                            )}
                            {file.is_folder && (
                                <DropdownMenuItem onClick={() => onNavigate(file)}>
                                    <AppIcon name="Folder" className="mr-2 h-4 w-4" /> Open
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onDelete(file)} className="text-red-400 focus:text-red-400">
                                <AppIcon name="Delete" className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-auto relative z-10">
                    <h3 className="font-medium text-sm text-gray-200 truncate mb-1" title={file.name}>
                        {file.name}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{file.is_folder ? 'Folder' : formatSize(file.size)}</span>
                        <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
