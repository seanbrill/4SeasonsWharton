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
            <div className="pt-24 pb-6 text-center relative z-10">
                <div className="container mx-auto px-4">
                    <WPText
                        slug={SLUG}
                        field="title.rendered"
                        tag="h1"
                        staticData={page?.title?.rendered || 'Catering Services'}
                        className="text-5xl font-serif font-bold text-stone-900 mb-6 capitalize"
                    />
                    <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto">
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
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.96 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5Z" clipRule="evenodd" />
                            </svg>
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
