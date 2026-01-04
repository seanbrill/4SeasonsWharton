'use client';

import React, { useEffect, useState } from 'react';
import WPComments from '@/components/wordpress/WPComments/WPComments';
import type { WP_Event } from '@/types/wordpress';

const WPEvents: React.FC = () => {
    const [events, setEvents] = useState<WP_Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Track which event has comments expanded
    const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

    const toggleComments = (id: string) => {
        setExpandedCommentsId(prev => prev === id ? null : id);
    };

    // Helper to auto-linkify text
    const linkify = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-amber-600 hover:text-amber-700 underline">${url}</a>`;
        });
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Switch to direct REST API to avoid RSS caching issues
                // Includes _embed to get featured media (images)
                const res = await fetch('https://4seasonswharton.com/wp-json/wp/v2/themo_event?_embed', {
                    cache: 'no-store' // Ensure fresh data on client
                });
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();

                if (Array.isArray(data)) {
                    interface WPEventResponse {
                        id: number;
                        link: string;
                        date: string;
                        title: { rendered: string };
                        content?: { rendered?: string };
                        excerpt?: { rendered?: string };
                        _embedded?: {
                            'wp:featuredmedia'?: Array<{
                                source_url: string;
                            }>;
                        };
                    }

                    const mappedEvents: WP_Event[] = data.map((item: WPEventResponse) => {
                        const content = item.content?.rendered || '';

                        // Clean description from excerpt or content
                        const rawExcerpt = item.excerpt?.rendered || item.content?.rendered || '';
                        // Remove HTML tags for clean description text (but we will linkify it later)
                        const cleanDescription = rawExcerpt.replace(/<[^>]+>/g, ' ');

                        // 1. Image Extraction
                        // Priority 1: Featured Media (API standard)
                        let image = null;
                        if (item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0]) {
                            image = item._embedded['wp:featuredmedia'][0].source_url;
                        }

                        // Priority 2: Extract from content if no featured image
                        const imgRegex = /<img[^>]+src="([^">]+)"/g;
                        const images: string[] = [];

                        if (image) images.push(image);

                        // Scan content for more images for carousel
                        let match;
                        while ((match = imgRegex.exec(content)) !== null) {
                            if (match[1] && match[1] !== image) images.push(match[1]);
                        }

                        // 3. Date Parsing
                        const dateObj = new Date(item.date);

                        return {
                            id: item.link, // Use permalink as reliable ID string
                            postId: item.id, // Numeric ID from API
                            title: item.title.rendered,
                            link: item.link,
                            date: dateObj,
                            dateStr: dateObj.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            content: content,
                            excerpt: linkify(cleanDescription),
                            image: image, // Legacy field
                            images: images
                        };
                    });
                    setEvents(mappedEvents);
                } else {
                    setEvents([]);
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const getStatusLabel = (date: Date) => {
        const now = new Date();
        // Reset times for simpler comparison
        const d = new Date(date); d.setHours(0, 0, 0, 0);
        const n = new Date(now); n.setHours(0, 0, 0, 0);

        if (d.getTime() === n.getTime()) {
            return { text: 'Happening Today', color: 'bg-green-100 text-green-800' };
        } else if (d > n) {
            return { text: 'Upcoming Event', color: 'bg-amber-100 text-amber-800' };
        } else {
            return { text: 'Past Event', color: 'bg-stone-200 text-stone-600' };
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col animate-pulse h-96">
                        <div className="h-48 bg-stone-200 rounded w-full mb-6"></div>
                        <div className="h-6 bg-stone-200 rounded w-1/3 mb-4"></div>
                        <div className="h-8 bg-stone-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-stone-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error || events.length === 0) {
        return (
            <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200">
                <p className="text-stone-500">No events found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {events.map((event) => {
                const status = getStatusLabel(event.date);

                return (
                    <div
                        key={event.id}
                        className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-300"
                    >
                        {/* Image Carousel / Single / Default */}
                        <div className="relative w-full h-64 bg-stone-100 border-b border-stone-100 group">
                            {event.images && event.images.length > 0 ? (
                                <ImageSlider images={event.images} title={event.title} />
                            ) : (
                                // Default Photo
                                <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                                    {/* Simple Placeholder Icon */}
                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className="p-8 flex flex-col flex-grow">
                            <div className="mb-4">
                                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${status.color}`}>
                                    {status.text}
                                </span>
                            </div>

                            <h3 className="text-2xl font-serif text-stone-900 mb-2">
                                {event.title}
                            </h3>

                            <div className="flex items-center text-stone-500 text-sm mb-6 font-medium">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {event.dateStr}
                            </div>

                            {/* Full Content - Linkified */}
                            <div
                                className="prose prose-stone prose-sm text-stone-600 mb-6 prose-a:text-amber-600 prose-a:font-medium hover:prose-a:text-amber-700 prose-img:hidden max-w-none break-words"
                                dangerouslySetInnerHTML={{ __html: event.excerpt }}
                            />

                            <div className="mt-auto pt-6 border-t border-stone-100">
                                {/* Only show comments toggle if we have a valid numeric post ID */}
                                {event.postId > 0 ? (
                                    <button
                                        onClick={() => toggleComments(event.id)}
                                        className="w-full py-2 flex items-center justify-center text-sm font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        {expandedCommentsId === event.id ? 'Hide Discussion' : 'Join Discussion'}
                                    </button>
                                ) : null}
                            </div>

                            {/* Embed Comments Section */}
                            {expandedCommentsId === event.id && event.postId > 0 && (
                                <WPComments postId={event.postId} />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Mini-Carousel Component for the Card
const ImageSlider: React.FC<{ images: string[], title: string }> = ({ images, title }) => {
    const [current, setCurrent] = useState(0);

    if (images.length === 0) return null;
    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={title}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
        );
    }

    const next = () => setCurrent(curr => (curr + 1) % images.length);
    const prev = () => setCurrent(curr => (curr - 1 + images.length) % images.length);

    return (
        <div className="w-full h-full relative group/slider">
            <img
                src={images[current]}
                alt={`${title} - Image ${current + 1}`}
                className="w-full h-full object-cover object-center transition-opacity duration-300"
            />

            {/* Controls (only show on hover) */}
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="p-1 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="p-1 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === current ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};


export default WPEvents;
