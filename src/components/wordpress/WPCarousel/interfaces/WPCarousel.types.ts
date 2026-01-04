export interface GalleryImage {
    id: number;
    url: string; // Full resolution URL (cleaned)
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
    srcSet?: string; // Original WP srcset
    sizes?: string; // Original WP sizes
}

export interface WPCarouselProps {
    // Dynamic Props
    slug: string;
    field?: string; // Optional: if omitted, extracts images from content
    pageContent?: string; // Optional: raw HTML content to parse directly

    // Static Props
    isStatic?: boolean;
    staticData?: GalleryImage[]; // Array of ACF Image Objects

    // UI Props
    className?: string;
    aspectRatio?: string; // 'aspect-video' or 'aspect-square' etc.
}
