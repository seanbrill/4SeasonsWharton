'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWPData } from '../useWPData';
import type { WPCarouselProps, GalleryImage } from './interfaces/WPCarousel.types';
import { ANIMATION, LOADING, Z_INDEX } from '@/lib/constants/design-tokens';

export default function WPCarousel({
    slug,
    field,
    pageContent,
    isStatic = true,
    staticData,
    className = '',
    aspectRatio = 'aspect-video'
}: WPCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const { data: wpPageData, loading } = useWPData({
        slug,
        field: 'whole_page_object',
        enabled: !isStatic
    });

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);

    // Minimum images required before showing the carousel content
    const isReady = images.length > 0 && loadedCount >= Math.min(images.length, LOADING.CAROUSEL_MIN_IMAGES);

    useEffect(() => {
        let extractedImages: GalleryImage[] = [];

        if (isStatic && staticData) {
            extractedImages = staticData;
        } else {
            // mode 1: ACF field (original logic)
            if (field && wpPageData) {
                const fieldData = field.split('.').reduce((obj: unknown, key: string) => {
                    if (obj && typeof obj === 'object' && key in obj) {
                        return (obj as Record<string, unknown>)[key];
                    }
                    return undefined;
                }, wpPageData);
                if (Array.isArray(fieldData)) {
                    extractedImages = fieldData;
                }
            } else {
                // mode 2: Content Extraction (New)
                const parsedContent = pageContent || (wpPageData as { content?: { rendered?: any } })?.content?.rendered;

                if (parsedContent && typeof parsedContent === 'object' && parsedContent.type === 'gallery') {
                    extractedImages = parsedContent.images.map((img: any, idx: number) => ({
                        id: idx,
                        ...img
                    }));
                } else if (typeof parsedContent === 'string') {
                    // Fallback to legacy string HTML parsing if still somehow using old structure
                    if (typeof window !== 'undefined') {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(parsedContent, 'text/html');
                        const imgTags = Array.from(doc.querySelectorAll('img'));

                        extractedImages = imgTags.map((img, idx) => {
                            const parentLink = img.closest('a');
                            let src = parentLink ? parentLink.href : img.src;

                            if (!parentLink) {
                                src = src.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
                            }

                            return {
                                id: idx,
                                url: src,
                                alt: img.alt,
                                caption: img.getAttribute('data-caption') || '',
                                srcSet: undefined,
                                sizes: undefined
                            };
                        }).filter(img => img.url);
                    } else {
                        const imgMatches = parsedContent.match(/<img[^>]+>/g) || [];
                        let idx = 0;
                        for (const imgStr of imgMatches) {
                            const srcMatch = imgStr.match(/src="([^"]+)"/i);
                            const altMatch = imgStr.match(/alt="([^"]*)"/i);
                            const captionMatch = imgStr.match(/data-caption="([^"]*)"/i);

                            if (srcMatch) {
                                let src = srcMatch[1];
                                src = src.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
                                extractedImages.push({
                                    id: idx++,
                                    url: src,
                                    alt: altMatch ? altMatch[1] : '',
                                    caption: captionMatch ? captionMatch[1] : '',
                                    srcSet: undefined,
                                    sizes: undefined
                                });
                            }
                        }
                    }
                }
            }
        }

        requestAnimationFrame(() => setImages(extractedImages));
    }, [isStatic, staticData, wpPageData, field, pageContent]);


    const nextSlide = useCallback(() => {
        if (images.length > 0) {
            setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }
    }, [images.length]);

    const prevSlide = useCallback(() => {
        if (images.length > 0) {
            setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
    }, [images.length]);

    // Auto-advance
    useEffect(() => {
        if (images.length <= 1 || isPaused || !isReady) return;

        const timer = setInterval(() => {
            nextSlide();
        }, ANIMATION.CAROUSEL_SLIDE_DURATION);
        return () => clearInterval(timer);
    }, [activeIndex, images.length, isPaused, isReady, nextSlide]);

    // Handle Image Load
    const handleImageLoad = () => {
        setLoadedCount(prev => prev + 1);
    };

    return (
        <div className={`relative w-full ${className} group overflow-hidden`}>
            {/* Loader Overlay */}
            {(!isReady || (loading && !isStatic)) && (
                <div
                    className={`absolute inset-0 bg-stone-100 flex items-center justify-center transition-opacity duration-500 ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    style={{ zIndex: Z_INDEX.LOADER_OVERLAY }}
                >
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Main Image Display */}
            <div className={`relative w-full ${aspectRatio} bg-stone-100 shadow-md`}>
                {images.map((img, index) => (
                    <div
                        key={img.id || index}
                        className={`absolute inset-0 w-full h-full transition-opacity will-change-opacity ${index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        style={{
                            transitionDuration: `${ANIMATION.CAROUSEL_TRANSITION_DURATION}ms`,
                            zIndex: index === activeIndex ? Z_INDEX.CONTENT : Z_INDEX.BACKDROP
                        }}
                    >
                        {/* Main Image - Optimized */}
                        <img
                            src={img.url}
                            srcSet={img.srcSet}
                            sizes={img.sizes || "100vw"}
                            alt={img.alt || img.caption || 'Gallery Image'}
                            className="absolute inset-0 w-full h-full object-cover drop-shadow-lg"
                            style={{ objectFit: 'cover' }}
                            loading={index < 2 ? "eager" : "lazy"}
                            onLoad={handleImageLoad}
                        />

                        {/* Caption overlay */}
                        {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center backdrop-blur-sm transition-transform duration-300 translate-y-full group-hover:translate-y-0" style={{ zIndex: Z_INDEX.CAROUSEL_CONTROLS }}>
                                {img.caption}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons (Redesigned) - Only visible on hover */}
            {images.length > 1 && isReady && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); prevSlide(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-black/60 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 border border-white/20 shadow-sm"
                        aria-label="Previous image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>

                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); nextSlide(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-black/60 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 border border-white/20 shadow-sm"
                        aria-label="Next image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>

                    {/* Dots Indicators & Pause Button */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-colors hover:bg-black/50">
                        {/* Pause/Play Toggle */}
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="w-5 h-5 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                            aria-label={isPaused ? "Play slide show" : "Pause slide show"}
                            title={isPaused ? "Play" : "Pause"}
                        >
                            {isPaused ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            )}
                        </button>

                        <div className="h-3 w-px bg-white/20"></div>

                        <div className="flex space-x-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
