import { getPageContent } from "@/lib/wordpress/api";
import WPContent from "@/components/wordpress/WPContent/WPContent";
import WPText from "@/components/wordpress/WPText/WPText";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";

const SLUG = 'contact';

export const metadata: Metadata = {
    title: 'Contact Us | 4 Seasons Wharton',
    description: 'Get in touch with 4 Seasons Wharton.',
};

export default async function Page() {
    const page = await getPageContent(SLUG);

    return (
        <div className="container mx-auto px-4 py-16">
            {/* Header / Intro */}
            <div className="text-center mb-16">
                <WPText
                    slug={SLUG}
                    field="title.rendered"
                    tag="h1"
                    staticData={page?.title?.rendered || 'Contact Us'}
                    className="text-5xl font-serif font-bold text-stone-900 mb-6 capitalize"
                />
                <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                    We'd love to hear from you. Reach out for reservations, events, or any questions.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
                {/* Left Column: Contact Info which uses Environment Variables */}
                <div className="space-y-8 h-full">
                    {/* Quick Contact Details */}
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-lg h-full flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-stone-800 mb-6">Get in Touch</h3>
                        <ul className="space-y-4 text-lg text-stone-600">
                            <li className="flex items-start gap-4">
                                <span className="bg-amber-100 p-2 rounded-full text-amber-600">📞</span>
                                <div>
                                    <span className="block font-bold text-stone-900">Phone</span>
                                    <a href={`tel:${siteConfig.contact.phone?.replace(/\D/g, '')}`} className="hover:text-amber-600 transition-colors">{siteConfig.contact.phone}</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="bg-amber-100 p-2 rounded-full text-amber-600">📍</span>
                                <div>
                                    <span className="block font-bold text-stone-900">Location</span>
                                    <span>{siteConfig.contact.address}</span>
                                </div>
                            </li>
                            {siteConfig.contact.email && (
                                <li className="flex items-start gap-4">
                                    <span className="bg-amber-100 p-2 rounded-full text-amber-600">✉️</span>
                                    <div>
                                        <span className="block font-bold text-stone-900">Email</span>
                                        <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-amber-600 transition-colors">{siteConfig.contact.email}</a>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Map Integration */}
                <div className="relative h-full min-h-[400px] w-full bg-stone-200 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                    {siteConfig.contact.mapLink ? (
                        <iframe
                            src={siteConfig.contact.mapLink}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 w-full h-full"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-stone-100/50 backdrop-blur-sm">
                            <span className="text-6xl">🗺️</span>
                            <span className="font-serif text-2xl text-stone-500">Map Configuration Missing</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
