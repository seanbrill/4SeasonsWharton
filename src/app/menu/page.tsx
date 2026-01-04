import { getPageContent } from "@/lib/wordpress/api";
import MenuTabs from "./MenuTabs";
import WPText from "@/components/wordpress/WPText/WPText";
import { Metadata } from "next";

const SLUG = 'menu';

export const metadata: Metadata = {
    title: 'Menu | 4 Seasons Wharton',
    description: 'Explore our delicious lunch, kids, and dessert menus.',
};

export default async function Page() {
    // We can still fetch the main 'menu' page content if there is intro text
    const page = await getPageContent(SLUG);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <div className="pt-24 pb-6 text-center">
                <div className="container mx-auto px-4">
                    <WPText
                        slug={SLUG}
                        field="title.rendered"
                        tag="h1"
                        staticData={page?.title?.rendered || 'Our Menus'}
                        className="text-5xl font-serif font-bold text-stone-900 mb-6 capitalize"
                    />
                    <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto">4 Seasons is passionate about the best seasonal flavors from the Riviera and Coastal regions of Italy, Spain, and the South of France.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 pb-24">
                <article className="prose lg:prose-xl mx-auto">
                    {/* Client Side Tabs for Sub-Menus */}
                    <MenuTabs />
                </article>
            </div>
        </div>
    );
}
