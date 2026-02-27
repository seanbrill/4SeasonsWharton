'use client';

import { useState } from 'react';
import type { UseWPDataResult } from '@/types/wordpress';
import pagesData from '@/data/pages.json';

interface UseWPDataProps {
    slug: string;
    field: string; // Dot notation supported e.g. 'acf.hero_text'
    enabled: boolean;
}

/**
 * Custom hook for fetching WordPress page/post data (Now completely Static)
 */
export function useWPData<T = unknown>(props: UseWPDataProps): UseWPDataResult<T> {
    const { slug, field, enabled } = props;

    // Calculate synchronously on first render so there's never a layout shift!
    const computeData = (): T | null => {
        if (!enabled) return null;

        try {
            const pageData = (pagesData as Record<string, unknown>)[slug];

            if (!pageData) {
                console.warn(`Page not found in local JSON for slug: ${slug}`);
                return null;
            }

            // Special case: return whole object
            if (field === 'whole_page_object') {
                return pageData as T;
            }

            // Resolve dot notation for field
            const fieldPath = field.split('.');
            let result: unknown = pageData;

            for (const key of fieldPath) {
                if (result && typeof result === 'object' && key in result) {
                    result = (result as Record<string, unknown>)[key];
                } else {
                    result = null;
                    break;
                }
            }

            return result as T;
        } catch (err) {
            console.error('Error parsing static WP Data:', err);
            return null;
        }
    };

    // We can rely entirely on synchronous state initialization 
    // Since Next.js RSC and SSR will execute this, `data` is immediately available.
    const [data] = useState<T | null>(computeData);

    // There is never a loading or error state in a fully static JSON app
    return { data, loading: false, error: null };
}
