"use client";

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Account information and preferences
                </p>
            </div>

            {/* Profile Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="font-semibold">{user?.name || '-'}</p>
                            <p className="text-sm text-gray-500">{user?.email || '-'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">About TirtaCloud</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Private Virtual Filesystem</p>
                            <p className="text-xs text-gray-500">
                                Files uploaded through TirtaCloud are stored in an isolated
                                &quot;TirtaCloud&quot; folder in your Google Drive. They never mix
                                with your personal files and are only accessible through this app.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Multi-Account Support</p>
                            <p className="text-xs text-gray-500">
                                Connect multiple Google Drive accounts to expand your storage.
                                Uploads are automatically balanced across accounts.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logout */}
            <Card className="border-red-200 dark:border-red-800/50">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Sign out</p>
                            <p className="text-xs text-gray-500">
                                Log out from your TirtaCloud account
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
