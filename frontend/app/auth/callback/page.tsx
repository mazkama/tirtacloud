"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const processed = useRef(false);

    useEffect(() => {
        if (code && !processed.current) {
            processed.current = true;
            const exchangeCode = async () => {
                try {
                    await api.post('/drive/callback', { code });
                    router.push('/dashboard');
                } catch (error) {
                    console.error('Failed to exchange code', error);
                    router.push('/dashboard?error=auth_failed');
                }
            };
            exchangeCode();
        }
    }, [code, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Linking account...</p>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
