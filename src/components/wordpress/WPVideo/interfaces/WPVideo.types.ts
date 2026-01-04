export interface WPVideoProps {
    // Dynamic Props
    slug: string;
    field: string;

    // Static Props
    isStatic?: boolean;
    staticData?: {
        url: string;
        mime_type?: string;
    };

    // UI Props
    className?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
}
