/**
 * Structured Data (JSON-LD) Generators for SEO
 */

import { restaurantSchema, SITE_NAME, SITE_URL } from '../constants/seo';

export interface StructuredDataProps {
    type: 'Restaurant' | 'Event' | 'Menu' | 'WebPage';
    data?: Record<string, unknown>;
}

/**
 * Generate Restaurant structured data (JSON-LD)
 */
export function generateRestaurantSchema() {
    return restaurantSchema;
}

/**
 * Generate Event structured data (JSON-LD)
 */
export function generateEventSchema(event: {
    name: string;
    description: string;
    startDate: string;
    url: string;
    image?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        url: event.url,
        image: event.image,
        location: {
            '@type': 'Place',
            name: restaurantSchema.name,
            address: restaurantSchema.address,
        },
        organizer: {
            '@type': 'Restaurant',
            name: restaurantSchema.name,
            url: restaurantSchema.url,
        },
    };
}

/**
 * Generate WebPage structured data (JSON-LD)
 */
export function generateWebPageSchema(page: {
    title: string;
    description: string;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description: page.description,
        url: page.url,
        publisher: {
            '@type': 'Restaurant',
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}
