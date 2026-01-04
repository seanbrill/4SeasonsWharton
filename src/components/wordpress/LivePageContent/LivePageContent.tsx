'use client';

import { useState, useEffect } from 'react';
import { WORDPRESS_API_URL } from '@/lib/constants';

interface LivePageContentProps {
    slug: string;
}

export default function LivePageContent({ slug }: LivePageContentProps) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Define the fetch function inside useEffect to avoid stale closures
        const fetchContent = async () => {
            try {
                setLoading(true);
                // Force a fresh fetch by adding a timestamp
                const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/pages?slug=${slug}&_embed&t=${Date.now()}`);

                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();

                if (data && data[0] && data[0].content) {
                    setContent(data[0].content.rendered);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [slug]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4 p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <p className="text-xs text-gray-500 mt-2">Connecting to WordPress for live updates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
                <p><strong>Connection Failed:</strong> Could not fetch live content from WordPress.</p>
                <p className="mt-1 text-xs">Verify your API URL and CORS settings.</p>
            </div>
        );
    }

    return (
        <div className="live-content-wrapper p-6 border-2 border-dashed border-blue-200 rounded-xl my-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <h3 className="font-bold text-blue-800 uppercase text-xs tracking-wider">Live Dynamic Content</h3>
            </div>

            <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content || '' }}
            />
        </div>
    );
}
