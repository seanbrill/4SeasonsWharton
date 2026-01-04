'use client';

import React from 'react';
import { useWPData } from '../useWPData';
import type { WPVideoProps } from './interfaces/WPVideo.types';

export default function WPVideo({
    slug,
    field,
    isStatic = true,
    staticData,
    className = '',
    controls = true,
    autoplay = false,
    loop = false,
    muted = false
}: WPVideoProps) {
    const { data, loading, error } = useWPData({
        slug,
        field,
        enabled: !isStatic
    });

    let displayContent = isStatic ? staticData : (data || staticData);

    if (!isStatic && field === 'whole_page_object' && data?.content?.rendered) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content.rendered, 'text/html');

        // 1. Try <video> src
        const videoTag = doc.querySelector('video');
        if (videoTag && videoTag.src) {
            displayContent = { url: videoTag.src };
        } else {
            // 2. Try iframe (YouTube/Vimeo)
            const iframe = doc.querySelector('iframe');
            if (iframe && iframe.src) {
                displayContent = { url: iframe.src };
            }
        }
    }

    if (!isStatic && loading) {
        return (
            <div className={`animate-pulse bg-gray-900 rounded ${className} min-h-[200px] flex items-center justify-center`}>
                <span className="text-gray-500 text-xs">Loading video...</span>
            </div>
        );
    }

    if (!displayContent || !displayContent.url) return null;

    // Detect valid video types for HTML5 video
    const isMp4 = displayContent.url.endsWith('.mp4') || displayContent.mime_type === 'video/mp4';

    if (isMp4) {
        return (
            <video
                src={displayContent.url}
                className={className}
                controls={controls}
                autoPlay={autoplay}
                loop={loop}
                muted={muted} // Browsers require muted for autoplay
                playsInline
                preload="metadata" // Performance optimization
            />
        );
    }

    // Fallback for OEmbed / YouTube links if just a string URL is passed as content
    // Note: Creating a robust OEmbed component is complex, but this handles basic cases
    // if content is just a string URL.
    if (typeof displayContent === 'string' || displayContent.url?.includes('youtube.com') || displayContent.url?.includes('vimeo.com')) {
        const videoUrl = typeof displayContent === 'string' ? displayContent : displayContent.url;
        // Very basic iframe logic - would recommend a library like 'react-player' for production robustness
        return (
            <div className={`aspect-video w-full ${className}`}>
                <iframe
                    src={videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy" // Performance optimization
                />
            </div>
        );
    }

    return null;
}
