import { getPageContent } from "@/lib/wordpress/api";
import WPContent from "@/components/wordpress/WPContent/WPContent";
import WPText from "@/components/wordpress/WPText/WPText";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";

const SLUG = 'catering';

export const metadata: Metadata = {
    title: 'Catering Services | 4 Seasons Wharton',
    description: 'Premier catering for your special events.',
};

export default async function Page() {
    const page = await getPageContent(SLUG);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Hero Section */}
            <div className="pt-24 pb-12 text-center relative z-10">
                <div className="container mx-auto px-4">
                    <WPText
                        slug={SLUG}
                        field="title.rendered"
                        tag="h1"
                        staticData={page?.title?.rendered || 'Catering Services'}
                        className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6 capitalize"
                    />
                    <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto">
                        Exceptional cuisine for your most memorable occasions.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-stone-100">

                    {/* Main Dynamic Content */}
                    <div className="prose prose-lg prose-stone max-w-none mb-12">
                        <WPContent
                            content={page?.content?.rendered}
                            slug={SLUG}
                            isStatic={!page}
                        />
                    </div>

                    {/* Enhancements / Call to Action */}
                    <div className="bg-stone-50 rounded-xl p-8 text-center border border-stone-200">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            📞
                        </div>
                        <h3 className="text-2xl font-bold text-stone-800 mb-2">Plan Your Perfect Event</h3>
                        <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                            For personalized catering inquiries and to create a menu that perfectly fits your occasion, please contact the restaurant directly. Our owner will verify availability and discuss custom options with you.
                        </p>
                        <a
                            href={`tel:${siteConfig.contact.phone?.replace(/\D/g, '')}`}
                            className="inline-block bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-stone-800 transition-transform hover:scale-105 shadow-lg"
                        >
                            Call {siteConfig.contact.phone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
