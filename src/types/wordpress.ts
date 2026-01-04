/**
 * Centralized TypeScript definitions for WordPress API responses
 */

export interface WP_RenderedContent {
  rendered: string;
  protected?: boolean;
}

export interface WP_Title {
  rendered: string;
}

export interface WP_Excerpt {
  rendered: string;
  protected?: boolean;
}

export interface WP_FeaturedMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    width: number;
    height: number;
    sizes?: Record<string, {
      source_url: string;
      width: number;
      height: number;
    }>;
  };
}

export interface WP_Embedded {
  'wp:featuredmedia'?: WP_FeaturedMedia[];
  'wp:term'?: Array<Array<{
    id: number;
    name: string;
    slug: string;
  }>>;
}

export interface WP_Page {
  id: number;
  date: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  slug: string;
  status?: string;
  type?: string;
  link: string;
  title: WP_Title;
  content: WP_RenderedContent;
  excerpt: WP_Excerpt;
  author?: number;
  featured_media?: number;
  parent: number;
  menu_order?: number;
  template?: string;
  _embedded?: WP_Embedded;
  acf?: Record<string, unknown>;
}

export interface WP_Post {
  id: number;
  date: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  slug: string;
  status?: string;
  type?: string;
  link: string;
  title: WP_Title;
  content: WP_RenderedContent;
  excerpt: WP_Excerpt;
  author?: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  _embedded?: WP_Embedded;
  acf?: Record<string, unknown>;
}

export interface WP_Event {
  id: string;
  postId: number;
  title: string;
  link: string;
  date: Date;
  dateStr: string;
  content: string;
  excerpt: string;
  image: string | null;
  images?: string[];
}

export interface WP_APIError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

export interface UseWPDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface GalleryImage {
  id: number | string;
  url: string;
  alt?: string;
  caption?: string;
  srcSet?: string;
  sizes?: string;
  source_url?: string;
}
