/**
 * Design System Tokens
 * Centralized constants for consistent styling across the application
 */

// Animation & Timing
export const ANIMATION = {
    CAROUSEL_SLIDE_DURATION: 5000, // 5 seconds
    CAROUSEL_TRANSITION_DURATION: 700, // 0.7 seconds
    MENU_TRANSITION_DURATION: 300, // 0.3 seconds
    HOVER_TRANSITION_DURATION: 200, // 0.2 seconds
} as const;

// Loading Thresholds
export const LOADING = {
    CAROUSEL_MIN_IMAGES: 2, // Minimum images to load before showing carousel
    API_TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
} as const;

// Z-Index Layers
export const Z_INDEX = {
    BACKDROP: 0,
    CONTENT: 10,
    CAROUSEL_CONTROLS: 30,
    LOADER_OVERLAY: 40,
    HEADER: 50,
    MOBILE_MENU: 60,
    MODAL: 70,
    TOAST: 80,
} as const;

// Color Palette (semantic naming)
export const COLORS = {
    PRIMARY: 'amber-600',
    PRIMARY_HOVER: 'amber-700',
    PRIMARY_LIGHT: 'amber-50',
    PRIMARY_DARK: 'amber-800',

    NEUTRAL: 'stone-600',
    NEUTRAL_HOVER: 'stone-900',
    NEUTRAL_LIGHT: 'stone-50',
    NEUTRAL_DARK: 'stone-900',

    BACKGROUND: 'stone-50',
    SURFACE: 'white',
    BORDER: 'stone-200',

    SUCCESS: 'green-600',
    SUCCESS_LIGHT: 'green-100',
    WARNING: 'amber-600',
    WARNING_LIGHT: 'amber-100',
    ERROR: 'red-600',
    ERROR_LIGHT: 'red-100',
} as const;

// Border Radius Scale
export const RADIUS = {
    SM: 'rounded-lg',
    MD: 'rounded-xl',
    LG: 'rounded-2xl',
    XL: 'rounded-3xl',
    FULL: 'rounded-full',
} as const;

// Shadow Scale
export const SHADOW = {
    SM: 'shadow-sm',
    DEFAULT: 'shadow-md',
    LG: 'shadow-lg',
    XL: 'shadow-xl',
    '2XL': 'shadow-2xl',
} as const;

// Typography Scale
export const TYPOGRAPHY = {
    HEADING_1: 'text-5xl md:text-6xl font-serif font-bold',
    HEADING_2: 'text-4xl md:text-5xl font-serif font-bold',
    HEADING_3: 'text-3xl font-serif font-bold',
    HEADING_4: 'text-2xl font-serif',
    BODY_LG: 'text-lg',
    BODY: 'text-base',
    BODY_SM: 'text-sm',
    CAPTION: 'text-xs',
} as const;

// Spacing Scale (for consistent padding/margin)
export const SPACING = {
    SECTION_Y: 'py-16 md:py-20',
    SECTION_X: 'px-4',
    CONTAINER: 'container mx-auto',
    CARD_PADDING: 'p-8',
} as const;
