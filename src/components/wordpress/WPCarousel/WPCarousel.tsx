'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useWPData } from '../useWPData';
import type { WPCarouselProps, GalleryImage } from './interfaces/WPCarousel.types';

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
        field: 'whole_page_object', // Fetch whole page to parse content if needed
        enabled: !isStatic
    });

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);

    // Minimum images required before showing the carousel content
    const LOAD_THRESHOLD = 2;
    const isReady = images.length > 0 && loadedCount >= Math.min(images.length, LOAD_THRESHOLD);

    useEffect(() => {
        let extractedImages: GalleryImage[] = [];

        if (isStatic && staticData) {
            extractedImages = staticData;
        } else if (!isStatic && wpPageData) {
            // mode 1: ACF field (original logic)
            if (field) {
                const fieldData = field.split('.').reduce((obj: any, key: string) => obj?.[key], wpPageData);
                if (Array.isArray(fieldData)) {
                    extractedImages = fieldData;
                }
            } else {
                // mode 2: Content Extraction (New)
                const contentToParse = pageContent || wpPageData?.content?.rendered || '';
                if (contentToParse) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(contentToParse, 'text/html');
                    const imgTags = Array.from(doc.querySelectorAll('img'));

                    extractedImages = imgTags.map((img, idx) => {
                        // Attempt to clean up WP resized URLs to get full quality
                        // e.g. image-300x200.jpg -> image.jpg
                        let src = img.src;
                        // Regex looks for -[digits]x[digits] before the extension
                        src = src.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');

                        return {
                            id: idx,
                            url: src,
                            alt: img.alt,
                            caption: img.getAttribute('data-caption') || '',
                            srcSet: img.srcset || undefined,
                            sizes: img.sizes || undefined
                        };
                    }).filter(img => img.url);
                }
            }
        }

        setImages(extractedImages);
    }, [isStatic, staticData, wpPageData, field, pageContent]);


    // Auto-advance
    useEffect(() => {
        // Only auto-advance if enough images are loaded
        if (images.length <= 1 || isPaused || !isReady) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [activeIndex, images.length, isPaused, isReady]);

    // Handle Image Load
    const handleImageLoad = () => {
        setLoadedCount(prev => prev + 1);
    };

    // Always render the main container to reserve space and prevent layout shifts
    // If no images (loading or empty), the loader overlay will show.
    // If truly empty after load, we might want to handle that, but for now reserving space is key.

    const nextSlide = () => {
        if (images.length > 0) {
            setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }
    };

    const prevSlide = () => {
        if (images.length > 0) {
            setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    return (
        <div className={`relative w-full ${className} group overflow-hidden`}>
            {/* Loader Overlay (Wait for first 2 images or if strictly loading) */}
            {(!isReady || (loading && !isStatic)) && (
                <div className={`absolute inset-0 z-40 bg-stone-100 flex items-center justify-center transition-opacity duration-500 ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Main Image Display */}
            {/* Using layout='fill' equivalent logic. We ensure the container has aspect ratio. */}
            <div className={`relative w-full ${aspectRatio} bg-stone-100 shadow-md`}>
                {images.map((img, index) => (
                    <div
                        key={img.id || index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out will-change-opacity ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                            }`}
                    >
                        {/* 1. Backdrop Blur Layer - Abstract Background */}
                        {/* Only render backdrop if image is active or next/prev to save resources? 
                            For now, keep simple but optimize standard Image usage.
                        */}
                        <div className="absolute inset-0 z-0 overflow-hidden transform-gpu">
                            <Image
                                src={img.url || (img as any).source_url}
                                alt=""
                                fill
                                className="object-cover scale-150 opacity-50"
                                style={{ filter: 'blur(80px)' }} // Increased blur for abstract feel
                                unoptimized
                                priority={index < 2} // Prioritize first 2 images
                            />
                            {/* Overlay to wash out details/enhance blend */}
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                        </div>

                        {/* 2. Main Foreground Image - Optimized for Mobile */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            {/* Note: We use standard img props passed to Next Image or override srcSet behavior if unoptimized is on. 
                                Since unoptimized=true globally, next/image won't generate srcset. 
                                We should rely on standard browser behavior for the passed srcSet.
                            */}
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
                        </div>

                        {/* Caption overlay (optional) */}
                        {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-center backdrop-blur-sm z-20 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
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
