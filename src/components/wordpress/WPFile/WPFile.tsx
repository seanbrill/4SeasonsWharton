'use client';

import React from 'react';
import { useWPData } from '../useWPData';

interface WPFileProps {
    // Dynamic Props
    slug: string;
    field: string;

    // Static Props
    isStatic?: boolean;
    staticData?: {
        url: string;
        title?: string;
        mime_type?: string;
    };

    // UI Props
    label?: string; // custom label ("Download Menu")
    className?: string;
    showIcon?: boolean;
}

export default function WPFile({
    slug,
    field,
    isStatic = true,
    staticData,
    label,
    className = '',
    showIcon = true
}: WPFileProps) {
    const { data, loading, error } = useWPData({
        slug,
        field,
        enabled: !isStatic
    });

    let displayContent = isStatic ? staticData : (data || staticData);

    if (!isStatic && field === 'whole_page_object' && data?.content?.rendered) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content.rendered, 'text/html');
        // Find first link that looks like a file
        const links = Array.from(doc.querySelectorAll('a'));
        const fileLink = links.find(a => /\.(pdf|docx|doc|zip)$/i.test(a.href));

        if (fileLink) {
            displayContent = {
                url: fileLink.href,
                title: fileLink.textContent || 'Download File'
            };
        }
    }

    if (!isStatic && loading) {
        return (
            <span className={`inline-flex items-center gap-2 text-gray-400 animate-pulse ${className}`}>
                <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                Loading file...
            </span>
        );
    }

    if (!displayContent || !displayContent.url) return null;

    const fileUrl = displayContent.url;
    const fileName = label || displayContent.title || 'Download File';
    // const mimeType = content.mime_type; // Could be used to pick specific icons

    return (
        <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
        >
            {showIcon && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            )}
            <span className="font-medium hover:underline">{fileName}</span>
        </a>
    );
}
