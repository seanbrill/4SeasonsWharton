export interface WPImageProps {
    // Dynamic Props
    slug: string;
    field: string;

    // Static Props
    isStatic?: boolean;
    staticData?: {
        url: string;
        alt: string;
        width?: number;
        height?: number;
    };

    // UI Props
    className?: string;
    priority?: boolean;
    imageIndex?: number; // For selecting Nth image from content
}
