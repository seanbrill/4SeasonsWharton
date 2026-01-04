'use client';

import React from 'react';
import { useWPData } from '../useWPData';

interface WPContentProps {
    content?: string;
    slug?: string;
    className?: string;
    isStatic?: boolean;
    stripImages?: boolean;
}

export default function WPContent({ content, slug, className = '', isStatic = true, stripImages = false }: WPContentProps) {
    const { data, loading } = useWPData({
        slug: slug || '',
        field: 'content.rendered',
        enabled: !isStatic && !!slug,
    });

    const rawHtml = isStatic ? content : (data as string) || content;

    // Loading State
    if (loading && !isStatic) {
        return (
            <div className={`animate-pulse space-y-4 ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        );
    }

    if (!rawHtml) return null;

    let displayHtml = rawHtml;

    // Strip images if requested
    if (stripImages) {
        // Server-side / Simple regex fallback for SSG/SSR
        // We remove img tags and empty paragraphs that might result
        displayHtml = rawHtml.replace(/<img[^>]*>/g, '');
    }

    return (
        <div
            className={`prose max-w-none dark:prose-invert ${className}`}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
    );
}
