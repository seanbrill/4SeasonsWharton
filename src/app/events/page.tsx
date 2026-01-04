import { getPageContent } from "@/lib/wordpress/api";
import WPContent from "@/components/wordpress/WPContent/WPContent";
import WPText from "@/components/wordpress/WPText/WPText";
import WPEvents from "@/components/wordpress/WPEvents/WPEvents";
import { Metadata } from "next";

// Slug must be lowercase to match WordPress exactly.
const SLUG = 'events';

export const metadata: Metadata = {
    title: 'Events | 4 Seasons Wharton',
    description: 'Upcoming events at 4 Seasons Wharton.',
};

export default async function Page() {
    // 1. Server-Side Fetch for Header Content
    const page = await getPageContent(SLUG);
    const hasPageContent = page?.content?.rendered && page.content.rendered.trim().length > 0;

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <div className="pt-24 pb-12 text-center">
                <WPText
                    slug={SLUG}
                    field="title.rendered"
                    tag="h1"
                    staticData={page?.title?.rendered || 'Events'}
                    className="text-5xl font-serif font-bold text-stone-900 capitalize mb-4"
                />

                {hasPageContent && (
                    <div className="max-w-2xl mx-auto px-4 prose prose-stone">
                        <WPContent content={page.content.rendered} slug={SLUG} />
                    </div>
                )}
                <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mt-8"></div>
            </div>

            <div className="container mx-auto px-4 py-8 pb-24">
                {/* 
                   Events are now fetched Client-Side to ensure live updates 
                   without requiring a static rebuild.
                */}
                <WPEvents />
            </div>
        </div>
    );
}

