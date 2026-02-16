"use client";

import { useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DrivePage() {
    const [loading, setLoading] = useState(false);

    const handleLinkDrive = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/drive/auth-url');
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get auth URL', error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manage Cloud Accounts</h1>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Google Drive</CardTitle>
                    <CardDescription>Link your Google Drive account to access files.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLinkDrive} disabled={loading}>
                        {loading ? 'Redirecting...' : 'Link Google Drive'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
