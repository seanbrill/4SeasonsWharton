export interface WP_Embedded {
    author?: {
        id: number;
        name: string;
        avatar_urls?: Record<string, string>;
    }[];
    'wp:featuredmedia'?: {
        id: number;
        source_url: string;
        alt_text: string;
        media_details?: {
            sizes?: Record<string, { source_url: string; width: number; height: number }>;
        };
    }[];
}

export interface WP_Post {
    id: number;
    date: string;
    slug: string;
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    _embedded?: WP_Embedded;
    acf?: Record<string, unknown>; // Flexible for now, can be typed strictly if schema is known
}

export interface WP_Page extends WP_Post {
    parent: number;
}
