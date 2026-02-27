import { Metadata } from 'next';
import siteData from '../../config/site.json';

export const SITE_NAME = '4 Seasons Wharton';
export const SITE_DESCRIPTION = 'Fine Mediterranean dining and event venue in Wharton, NJ. Experience seasonal flavors from Italy, Spain, and the South of France with outdoor patio dining.';
export const SITE_URL = siteData.seo.siteUrl;

export const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: siteData.contact.phone,
    email: siteData.contact.email,
    address: {
        '@type': 'PostalAddress',
        streetAddress: '322 S Main St',
        addressLocality: 'Wharton',
        addressRegion: 'NJ',
        postalCode: '07885',
        addressCountry: 'US',
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.888377,
        longitude: -74.582046,
    },
    // ...other schema properties
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '11:30',
            closes: '22:00',
        },
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '11:00',
            closes: '21:00',
        },
    ],
    servesCuisine: ['Mediterranean', 'Italian', 'Spanish', 'French'],
    priceRange: '$$',
    menu: `${SITE_URL}/menu`,
    acceptsReservations: 'True',
};

// Default OG Image
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
