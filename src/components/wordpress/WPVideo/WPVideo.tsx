'use client';

import React from 'react';
import { useWPData } from '../useWPData';
import type { WP_Page } from '@/types/wordpress';
import type { WPVideoProps } from './interfaces/WPVideo.types';

interface VideoData {
    url: string;
    mime_type?: string;
}

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
    const { data, loading, error } = useWPData<WP_Page>({
        slug,
        field,
        enabled: !isStatic
    });

    let displayContent: VideoData | string | undefined = isStatic ? staticData : staticData;

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

    if (!displayContent) return null;

    // Handle string URLs
    const videoUrl = typeof displayContent === 'string' ? displayContent : displayContent.url;
    const mimeType = typeof displayContent === 'object' ? displayContent.mime_type : undefined;

    if (!videoUrl) return null;

    // Detect valid video types for HTML5 video
    const isMp4 = videoUrl.endsWith('.mp4') || mimeType === 'video/mp4';

    if (isMp4) {
        return (
            <video
                src={videoUrl}
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

    // Fallback for OEmbed / YouTube links
    if (videoUrl.includes('youtube.com') || videoUrl.includes('vimeo.com')) {
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
