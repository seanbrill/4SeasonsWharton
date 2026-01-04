/**
 * Structured Data (JSON-LD) Generators for SEO
 */

import { BUSINESS_INFO, SITE_NAME, SITE_URL } from '../constants/seo';

export interface StructuredDataProps {
    type: 'Restaurant' | 'Event' | 'Menu' | 'WebPage';
    data?: Record<string, unknown>;
}

/**
 * Generate Restaurant structured data (JSON-LD)
 */
export function generateRestaurantSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: BUSINESS_INFO.name,
        alternateName: BUSINESS_INFO.alternateName,
        description: BUSINESS_INFO.description,
        url: BUSINESS_INFO.url,
        telephone: BUSINESS_INFO.telephone,
        email: BUSINESS_INFO.email,
        priceRange: BUSINESS_INFO.priceRange,
        servesCuisine: BUSINESS_INFO.servesCuisine,
        acceptsReservations: BUSINESS_INFO.acceptsReservations,
        address: {
            '@type': 'PostalAddress',
            ...BUSINESS_INFO.address,
        },
        geo: {
            '@type': 'GeoCoordinates',
            ...BUSINESS_INFO.geo,
        },
    };
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
            name: BUSINESS_INFO.name,
            address: {
                '@type': 'PostalAddress',
                ...BUSINESS_INFO.address,
            },
        },
        organizer: {
            '@type': 'Restaurant',
            name: BUSINESS_INFO.name,
            url: BUSINESS_INFO.url,
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
