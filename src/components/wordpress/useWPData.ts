'use client';

import { useState, useEffect } from 'react';
import { WORDPRESS_API_URL } from '@/lib/constants';

interface UseWPDataProps {
    slug: string;
    field: string; // Dot notation supported e.g. 'acf.hero_text'
    enabled: boolean;
}

export function useWPData(props: UseWPDataProps) {
    const { slug, field, enabled } = props;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch the page by slug
                const res = await fetch(`${WORDPRESS_API_URL}/wp/v2/pages?slug=${slug}&_embed&t=${Date.now()}`);
                if (!res.ok) throw new Error('Failed to fetch from WordPress');

                const json = await res.json();

                // If no page found, we don't throw, we just return null data so components can decide to render nothing or fallback
                if (!json || json.length === 0) {
                    console.warn(`Page/Post not found for slug: ${slug}`);
                    setData(null);
                    setLoading(false);
                    return;
                }

                const pageData = json[0];

                // Special case: return whole object
                if (field === 'whole_page_object') {
                    setData(pageData);
                    setLoading(false);
                    return;
                }

                // Resolve dot notation for field (e.g. 'acf.header.title')
                const fieldPath = field.split('.');
                let result = pageData;

                for (const key of fieldPath) {
                    if (result && typeof result === 'object' && key in result) {
                        result = result[key];
                    } else {
                        // Try typical locations if direct path fails
                        if (result.acf && result.acf[key]) {
                            result = result.acf[key];
                        } else {
                            result = null;
                            break;
                        }
                    }
                }

                setData(result);
            } catch (err: any) {
                console.error('WP Fetch Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, field, enabled]);

    return { data, loading, error };
}
