'use client';

import { useState, useEffect } from 'react';
import { WORDPRESS_API_URL } from '@/lib/constants';
import type { UseWPDataResult } from '@/types/wordpress';

interface UseWPDataProps {
    slug: string;
    field: string; // Dot notation supported e.g. 'acf.hero_text'
    enabled: boolean;
}

/**
 * Custom hook for fetching WordPress page/post data
 * 
 * @param props - Configuration object
 * @param props.slug - WordPress page/post slug
 * @param props.field - Field path to extract (supports dot notation like 'acf.hero_text')
 * @param props.enabled - Whether to fetch data (useful for conditional fetching)
 * 
 * @returns Object containing data, loading state, and error message
 * 
 * @example
 * ```tsx
 * const { data, loading, error } = useWPData({
 *   slug: 'home',
 *   field: 'content.rendered',
 *   enabled: true
 * });
 * ```
 */
export function useWPData<T = unknown>(props: UseWPDataProps): UseWPDataResult<T> {
    const { slug, field, enabled } = props;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch the page by slug with cache-busting timestamp
                const res = await fetch(
                    `${WORDPRESS_API_URL}/wp/v2/pages?slug=${slug}&_embed&t=${Date.now()}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`Failed to fetch from WordPress: ${res.status} ${res.statusText}`);
                }

                const json = await res.json();

                // If no page found, return null data
                if (!json || json.length === 0) {
                    console.warn(`Page/Post not found for slug: ${slug}`);
                    setData(null);
                    setLoading(false);
                    return;
                }

                const pageData = json[0];

                // Special case: return whole object
                if (field === 'whole_page_object') {
                    setData(pageData as T);
                    setLoading(false);
                    return;
                }

                // Resolve dot notation for field (e.g. 'acf.header.title')
                const fieldPath = field.split('.');
                let result: unknown = pageData;

                for (const key of fieldPath) {
                    if (result && typeof result === 'object' && key in result) {
                        result = (result as Record<string, unknown>)[key];
                    } else {
                        // Try typical locations if direct path fails
                        const resultObj = result as Record<string, unknown>;
                        if (resultObj.acf && typeof resultObj.acf === 'object' && key in resultObj.acf) {
                            result = (resultObj.acf as Record<string, unknown>)[key];
                        } else {
                            result = null;
                            break;
                        }
                    }
                }

                setData(result as T);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error('WP Fetch Error:', errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, field, enabled]);

    return { data, loading, error };
}
