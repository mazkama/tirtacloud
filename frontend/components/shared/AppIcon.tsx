import {
    LucideIcon,
    Cloud,
    LayoutGrid,
    FolderOpen,
    Database,
    Server,
    Settings2,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    User,
    Loader2,
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Lock,
    CloudLightning,
    FileText,
    MoreVertical,
    Download,
    Share2,
    Trash2,
    Eye,
    Image as ImageIcon,
    Film,
    Music,
    Upload,
    FolderPlus,
    Home,
    Search,
    Bell,
    LayoutTemplate,
    List,
    CloudUpload,
    Folder,
    HardDrive,
    Clock,
    AlertCircle,
    Plus,
    RefreshCw,
    CheckCircle,
    TrendingUp,
    Mail,
    Circle,
    Check,
    Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName =
    | 'Logo'
    | 'Dashboard'
    | 'Files'
    | 'Storage'
    | 'Accounts'
    | 'Settings'
    | 'Logout'
    | 'Menu'
    | 'Close'
    | 'ChevronLeft'
    | 'ChevronRight'
    | 'User'
    | 'Loader'
    | 'ArrowRight'
    | 'Security'
    | 'Speed'
    | 'Global'
    | 'Lock'
    | 'CloudSync'
    | 'File'
    | 'More'
    | 'Download'
    | 'Share'
    | 'Delete'
    | 'Preview'
    | 'Image'
    | 'Video'
    | 'Audio'
    | 'Upload'
    | 'NewFolder'
    | 'Home'
    | 'Search'
    | 'Notification'
    | 'Check'
    | 'Copy'
    | 'Grid'
    | 'List'
    | 'CloudUpload'
    | 'Folder'
    | 'Clock'
    | 'Alert'
    | 'Plus'
    | 'Refresh'
    | 'CheckCircle'
    | 'Trending'
    | 'Mail'
    | 'Circle';

const icons: Record<IconName, LucideIcon> = {
    Logo: Cloud,
    Dashboard: LayoutGrid,
    Files: FolderOpen,
    Storage: HardDrive,
    Accounts: Server,
    Settings: Settings2,
    Logout: LogOut,
    Menu: Menu,
    Close: X,
    ChevronLeft: ChevronLeft,
    ChevronRight: ChevronRight,
    User: User,
    Loader: Loader2,
    ArrowRight: ArrowRight,
    Security: ShieldCheck,
    Speed: Zap,
    Global: Globe,
    Lock: Lock,
    CloudSync: CloudLightning,
    File: FileText,
    More: MoreVertical,
    Download: Download,
    Share: Share2,
    Delete: Trash2,
    Preview: Eye,
    Image: ImageIcon,
    Video: Film,
    Audio: Music,
    Upload: Upload,
    NewFolder: FolderPlus,
    Home: Home,
    Search: Search,
    Notification: Bell,
    Check: Check,
    Copy: Copy,
    Grid: LayoutTemplate,
    List: List,
    CloudUpload: CloudUpload,
    Folder: Folder,
    Clock: Clock,
    Alert: AlertCircle,
    Plus: Plus,
    Refresh: RefreshCw,
    CheckCircle: CheckCircle,
    Trending: TrendingUp,
    Mail: Mail,
    Circle: Circle
};

interface AppIconProps {
    name: IconName;
    className?: string; // Additional classes
    size?: number; // Pixel size
    strokeWidth?: number;
}

export function AppIcon({ name, className, size = 20, strokeWidth = 1.5 }: AppIconProps) {
    const IconComponent = icons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return <IconComponent size={size} strokeWidth={strokeWidth} className={cn("shrink-0", className)} />;
}
