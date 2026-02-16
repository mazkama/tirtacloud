"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DrivePage() {
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState<any>(null);

    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            // Fetch user profile which now includes cloudAccounts
            const response = await api.get('/user');
            const user = response.data;

            // Check if there is a google provider linked
            const googleAccount = user.cloud_accounts?.find((acc: any) => acc.provider === 'google');

            if (googleAccount) {
                setAccount(googleAccount);
            } else {
                setAccount(null);
            }
        } catch (error) {
            console.log('Not linked or error', error);
            setAccount(null);
        }
    };

    const handleLinkDrive = async () => {
        setLoading(true);
        try {
            const response = await api.get('/drive/auth-url');
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get auth URL', error);
            setLoading(false);
        }
    };

    // Attempt to unlink (placeholder for now)
    const handleUnlink = async () => {
        // TODO: Implement unlink
        alert('Unlink feature coming soon');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manage Cloud Accounts</h1>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Google Drive</CardTitle>
                    <CardDescription>
                        {account ? 'Your Google Drive is connected.' : 'Link your Google Drive account to access files.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {account ? (
                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800">
                                <p className="font-medium">✓ Account Linked</p>
                                <p className="text-sm opacity-80">You can now access your files in the Dashboard.</p>
                            </div>
                            <Button variant="outline" onClick={handleUnlink} className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20">
                                Unlink Account
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleLinkDrive} disabled={loading} className="w-full">
                            {loading ? 'Redirecting...' : 'Link Google Drive'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
