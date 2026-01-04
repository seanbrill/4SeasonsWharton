import { getPageContent } from "@/lib/wordpress/api";
import WPContent from "@/components/wordpress/WPContent/WPContent";
import WPText from "@/components/wordpress/WPText/WPText";
import { Metadata } from "next";

const SLUG = 'events';

export const metadata: Metadata = {
    title: 'Events | 4 Seasons Wharton',
    description: 'Upcoming events at 4 Seasons Wharton.',
};

export default async function Page() {
    const page = await getPageContent(SLUG);

    const hasContent = page?.content?.rendered && page.content.rendered.trim().length > 0;

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
                <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {hasContent ? (
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-stone-100 prose prose-lg prose-stone">
                        <WPContent
                            content={page?.content?.rendered}
                            slug={SLUG}
                            isStatic={!page}
                        />
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto text-center py-20 px-6 rounded-3xl bg-white shadow-sm border border-stone-200/60">
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-stone-400">
                            📅
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-3">No Upcoming Events</h2>
                        <p className="text-stone-500">
                            We don't have any public events scheduled at the moment. Please check back soon or follow us on social media for updates!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
