'use client';

import React from 'react';
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
    const { data } = useWPData<WP_Page>({
        slug,
        field,
        enabled: !isStatic
    });

    // Content Extraction Logic
    let displayContent: ImageData | undefined = isStatic ? staticData as ImageData : staticData as ImageData;

    if (!isStatic && field === 'whole_page_object' && (data as WP_Page & { content?: { rendered?: any } })?.content?.rendered) {
        const parsedContent = (data as WP_Page & { content: { rendered: any } }).content.rendered;

        if (parsedContent && typeof parsedContent === 'object' && parsedContent.type === 'gallery') {
            const img = parsedContent.images[imageIndex];
            if (img) {
                displayContent = img;
            } else {
                displayContent = undefined;
            }
        } else if (typeof parsedContent === 'string') {
            // SSR Regex Fallback for legacy raw string HTML
            const imgMatches = parsedContent.match(/<img[^>]+>/g);

            if (imgMatches && imgMatches[imageIndex]) {
                const imgStr = imgMatches[imageIndex];
                const srcMatch = imgStr.match(/src="([^"]+)"/);
                const altMatch = imgStr.match(/alt="([^"]*)"/);
                const srcsetMatch = imgStr.match(/srcset="([^"]+)"/);
                const sizesMatch = imgStr.match(/sizes="([^"]+)"/);
                const widthMatch = imgStr.match(/width="([^"]+)"/);
                const heightMatch = imgStr.match(/height="([^"]+)"/);

                let src = srcMatch ? srcMatch[1] : '';
                src = src.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');

                displayContent = {
                    url: src,
                    alt: altMatch ? altMatch[1] : '',
                    width: widthMatch ? parseInt(widthMatch[1], 10) : 800,
                    height: heightMatch ? parseInt(heightMatch[1], 10) : 600,
                    srcSet: srcsetMatch ? srcsetMatch[1] : undefined,
                    sizes: sizesMatch ? sizesMatch[1] : undefined
                };
            } else {
                displayContent = undefined;
            }
        } else {
            displayContent = undefined;
        }
    }

    if (!displayContent) return null;

    const imageUrl = displayContent.url || (displayContent as ImageData & { source_url?: string }).source_url;
    const imageAlt = displayContent.alt || (displayContent as ImageData & { alt_text?: string }).alt_text || '';
    const width = displayContent.width || 800;
    const height = displayContent.height || 600;
    const srcSet = displayContent.srcSet;
    const sizes = displayContent.sizes;

    // Use standard <img> to leverage WordPress native srcset/sizes for mobile optimization
    // Next/Image with unoptimized=true doesn't easily allow custom srcset
    return (
        /* eslint-disable-next-line @next/next/no-img-element */
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
