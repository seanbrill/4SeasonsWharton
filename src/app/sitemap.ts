import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/seo';

export const dynamic = 'force-static';

/**
 * Generate dynamic sitemap for SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/menu',
        '/catering',
        '/contact-us',
    ];

    return routes.map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly' as const,
        priority: route === '' ? 1.0 : route === '/menu' ? 0.9 : 0.8,
    }));
}
