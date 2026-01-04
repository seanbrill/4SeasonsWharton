'use client';

import React from 'react';
import { useWPData } from '../useWPData';

type AllowedTags = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'a';

interface WPTextProps {
    // Dynamic Props
    slug: string;
    field: string;

    // Static Props
    isStatic?: boolean;
    staticData?: string;

    // UI Props
    tag?: AllowedTags;
    className?: string;
    href?: string; // Only used if tag is 'a'
}

export default function WPText({
    slug,
    field,
    isStatic = true,
    staticData,
    tag = 'p',
    className = '',
    href
}: WPTextProps) {
    const { data, loading, error } = useWPData({
        slug,
        field,
        enabled: !isStatic
    });

    const Tag = tag as any;

    // Logic: content extraction
    let displayContent = isStatic ? staticData : (data || staticData);

    // If fetching 'whole_page_object' (which returns an object) but we want text
    // we need to parse it. This happens if the user genericized the component.
    if (!isStatic && field === 'whole_page_object' && data?.content?.rendered) {
        // Example: If I want just the H1 from the page content
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content.rendered, 'text/html');
        // Simple extraction heuristic based on 'tag' prop
        const foundElement = doc.querySelector(tag);
        if (foundElement) {
            displayContent = foundElement.innerHTML;
        } else {
            // Fallback: render nothing if specific tag not found in content
            // OR render whole content? Let's render nothing for precision filtering
            displayContent = null;
        }
    }

    // Fallback loading state for dynamic mode
    if (!isStatic && loading) {
        return <span className={`animate-pulse bg-gray-200 rounded text-transparent ${className}`}>Loading...</span>;
    }

    if (!displayContent) return null;

    if (tag === 'a' && href) {
        return (
            <a href={href} className={className} dangerouslySetInnerHTML={{ __html: displayContent }} />
        );
    }

    return (
        <Tag className={className} dangerouslySetInnerHTML={{ __html: displayContent }} />
    );
}
