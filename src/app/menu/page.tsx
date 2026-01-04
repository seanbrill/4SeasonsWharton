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
        <div className="container mx-auto px-4 py-12">
            <article className="prose lg:prose-xl mx-auto dark:prose-invert">
                <div className="text-center mb-10">
                    <WPText
                        slug={SLUG}
                        field="title.rendered"
                        tag="h1"
                        staticData={page?.title?.rendered || 'Our Menus'}
                        className="text-5xl font-serif font-bold mb-4 capitalize"
                    />
                    <p className="text-xl text-stone-600">Discover our culinary offerings</p>
                </div>

                {/* Client Side Tabs for Sub-Menus */}
                <MenuTabs />
            </article>
        </div>
    );
}
