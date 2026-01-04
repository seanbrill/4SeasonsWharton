'use client';

import React from 'react';
import Image from 'next/image';
import { useWPData } from '../useWPData';
import type { WP_Page } from '@/types/wordpress';
import type { WPImageProps } from './interfaces/WPImage.types';

interface ImageData {
    url: string;
    alt: string;
    width?: number;
    height?: number;
    srcSet?: string;
    sizes?: string;
}

export default function WPImage({
    slug,
    field,
    isStatic = true,
    staticData,
    className = '',
    priority = false,
    imageIndex = 0
}: WPImageProps) {
    const { data, loading, error } = useWPData<WP_Page>({
        slug,
        field,
        enabled: !isStatic
    });

    // Content Extraction Logic
    let displayContent: ImageData | undefined = isStatic ? staticData as ImageData : staticData as ImageData;

    if (!isStatic && field === 'whole_page_object' && data?.content?.rendered) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content.rendered, 'text/html');
        const images = doc.querySelectorAll('img');
        const img = images[imageIndex];

        if (img) {
            // Clean up src for full resolution on desktop
            let src = img.src;
            src = src.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');

            displayContent = {
                url: src,
                alt: img.alt || '',
                width: parseInt(img.getAttribute('width') || '800'),
                height: parseInt(img.getAttribute('height') || '600'),
                srcSet: img.srcset || undefined,
                sizes: img.sizes || undefined
            };
        } else {
            displayContent = undefined;
        }
    }

    if (!displayContent) return null;

    const imageUrl = displayContent.url || (displayContent as any).source_url;
    const imageAlt = displayContent.alt || (displayContent as any).alt_text || '';
    const width = displayContent.width || 800;
    const height = displayContent.height || 600;
    const srcSet = displayContent.srcSet;
    const sizes = displayContent.sizes;

    // Use standard <img> to leverage WordPress native srcset/sizes for mobile optimization
    // Next/Image with unoptimized=true doesn't easily allow custom srcset
    return (
        <img
            src={imageUrl}
            srcSet={srcSet}
            sizes={sizes || '100vw'}
            alt={imageAlt}
            width={width}
            height={height}
            className={`${className} max-w-full h-auto`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
        />
    );
}
