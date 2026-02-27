/**
 * SEO Constants and Metadata Helpers
 */

export const SITE_NAME = '4 Seasons Wharton';
export const SITE_DESCRIPTION = 'Fine Mediterranean dining and event venue in Wharton, NJ. Experience seasonal flavors from Italy, Spain, and the South of France with outdoor patio dining.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://4seasonswharton.com';
export const SITE_LOCALE = 'en_US';

// Social Media
export const TWITTER_HANDLE = '@4SeasonsWharton';

// Business Information for Structured Data
export const BUSINESS_INFO = {
    name: SITE_NAME,
    alternateName: '4Seasons Mediterranean',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
    address: {
        streetAddress: '111 South Main Street',
        addressLocality: 'Wharton',
        addressRegion: 'NJ',
        postalCode: '07885',
        addressCountry: 'US',
    },
    geo: {
        latitude: 40.8934,
        longitude: -74.5815,
    },
    priceRange: '$$',
    servesCuisine: ['Mediterranean', 'Italian', 'Spanish', 'French'],
    acceptsReservations: true,
} as const;

// Default OG Image
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
