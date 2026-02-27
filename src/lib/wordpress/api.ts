import { WP_Page, WP_Post } from './types';
import pagesData from '@/data/pages.json';
import eventsData from '@/data/events.json';
import postsData from '@/data/posts.json';

export interface WP_Event {
    id: string;
    title: string;
    link: string;
    date: string;
    content: string;
    excerpt: string;
}

export async function getAllPagesWithSlugs() {
    return Object.values(pagesData).map((page: unknown) => ({ slug: (page as Record<string, string>).slug }));
}

export async function getPageBySlug(slug: string): Promise<WP_Page | null> {
    return (pagesData as unknown as Record<string, WP_Page>)[slug] || null;
}

export async function getPosts(): Promise<WP_Post[]> {
    return postsData as unknown as WP_Post[];
}

export async function getPageContent(slug: string): Promise<WP_Page | null> {
    return (pagesData as unknown as Record<string, WP_Page>)[slug] || null;
}

export async function getEvents(): Promise<WP_Event[]> {
    return eventsData as unknown as WP_Event[];
}
