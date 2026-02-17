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

interface FileListItemProps {
    file: VirtualFile;
    onNavigate: (file: VirtualFile) => void;
    onPreview: (file: VirtualFile) => void;
    onDownload: (file: VirtualFile) => void;
    onShare: (file: VirtualFile) => void;
    onDelete: (file: VirtualFile) => void;
}

export function FileListItem({
    file,
    onNavigate,
    onPreview,
    onDownload,
    onShare,
    onDelete
}: FileListItemProps) {

    const getFileIcon = (file: VirtualFile) => {
        if (file.is_folder) return <AppIcon name="Folder" className="h-5 w-5 text-yellow-500" />;
        const mime = file.mime_type || '';
        if (mime.includes('image')) return <AppIcon name="Image" className="h-5 w-5 text-purple-500" />;
        if (mime.includes('video')) return <AppIcon name="Video" className="h-5 w-5 text-red-500" />;
        if (mime.includes('audio')) return <AppIcon name="Audio" className="h-5 w-5 text-blue-500" />;
        if (mime.includes('pdf')) return <AppIcon name="File" className="h-5 w-5 text-red-600" />;
        return <AppIcon name="File" className="h-5 w-5 text-gray-400" />;
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={cn(
                "group flex items-center justify-between p-3 rounded-lg border border-transparent transition-all hover:bg-white/5 hover:border-white/5 cursor-pointer",
                file.is_folder && "hover:bg-yellow-500/5 hover:border-yellow-500/10"
            )}
            onClick={() => file.is_folder ? onNavigate(file) : onPreview(file)}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                    {getFileIcon(file)}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-gray-200 truncate group-hover:text-white transition-colors">{file.name}</h3>
                </div>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500 ml-4">
                <span className="w-24 text-right hidden sm:block">{file.is_folder ? '-' : formatSize(file.size)}</span>
                <span className="w-32 text-right hidden md:block">{format(new Date(file.created_at), 'MMM d, yyyy')}</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AppIcon name="More" className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-[#1a1a1a] border-white/10 text-white">
                        {!file.is_folder && (
                            <>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(file) }}>
                                    <AppIcon name="Preview" className="mr-2 h-4 w-4" /> Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(file) }}>
                                    <AppIcon name="Download" className="mr-2 h-4 w-4" /> Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(file) }}>
                                    <AppIcon name="Share" className="mr-2 h-4 w-4" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                            </>
                        )}
                        {file.is_folder && (
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(file);
                            }}>
                                <AppIcon name="Folder" className="mr-2 h-4 w-4" /> Open
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(file) }} className="text-red-400 focus:text-red-400">
                            <AppIcon name="Delete" className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
