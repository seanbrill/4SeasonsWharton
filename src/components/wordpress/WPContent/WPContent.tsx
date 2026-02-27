'use client';

import React from 'react';
import { useWPData } from '../useWPData';

interface WPContentProps {
    content?: string | any;
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

    const rawHtml = isStatic ? content : data || content;

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

    if (typeof displayHtml === 'object' && displayHtml !== null) {
        if (displayHtml.type === 'menu') {
            return (
                <div className={`menu-container ${className}`}>
                    {displayHtml.sections.map((section: any, idx: number) => (
                        <div key={idx} className="mb-12">
                            <h3 className="text-3xl font-serif font-bold text-amber-600 mb-6 border-b border-stone-200 pb-2">{section.heading}</h3>
                            <ul className="space-y-4 m-0 p-0 list-none">
                                {section.items.map((item: any, itemIdx: number) => (
                                    <li key={itemIdx} className="flex flex-col mb-4">
                                        <div className="flex items-baseline w-full">
                                            <div className="font-bold text-stone-800 text-[17px] mr-2">
                                                {item.name || item.text.replace(/\s[–-].*$/, '')}
                                            </div>
                                            {item.price && (
                                                <>
                                                    {/* Dotted Leader */}
                                                    <div className="flex-grow border-b-2 border-dotted border-stone-300 mx-2 relative top-[-6px]"></div>
                                                    <div className="text-amber-600 font-bold text-[17px] ml-2 whitespace-nowrap">
                                                        {item.price}
                                                    </div>
                                                </>
                                            )}
                                            {!item.name && !item.price && (
                                                <div className="text-stone-700">{item.text}</div>
                                            )}
                                        </div>
                                        {item.description && (
                                            <div className="text-stone-600 italic text-[15px] mt-1">
                                                ({item.description})
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            );
        } else if (displayHtml.type === 'text') {
            return (
                <div className={`prose max-w-none ${className}`}>
                    {displayHtml.text}
                </div>
            );
        } else if (displayHtml.type === 'gallery') {
            return null; // Handled by Carousel in most cases
        }
    }

    // Strip images if requested (for backwards compatibility if raw string is provided)
    if (stripImages && typeof displayHtml === 'string') {
        // Server-side / Simple regex fallback for SSG/SSR
        // We remove img tags and empty paragraphs that might result
        displayHtml = displayHtml.replace(/<img[^>]*>/g, '');
    }

    return (
        <div
            className={`prose max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: typeof displayHtml === 'string' ? displayHtml : '' }}
        />
    );
}
