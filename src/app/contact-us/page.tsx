import { getPageContent } from "@/lib/wordpress/api";
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
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <div className="pt-24 pb-6 text-center">
                <div className="container mx-auto px-4">
                    <WPText
                        slug={SLUG}
                        field="title.rendered"
                        tag="h1"
                        staticData={page?.title?.rendered || 'Contact Us'}
                        className="text-5xl font-serif font-bold text-stone-900 mb-6 capitalize"
                    />
                    <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                        We&apos;d love to hear from you. Reach out for reservations, events, or any questions.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 pb-24">

                <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
                    {/* Left Column: Contact Info which uses Environment Variables */}
                    <div className="space-y-8 h-full">
                        {/* Quick Contact Details */}
                        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-lg h-full flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-stone-800 mb-6">Get in Touch</h3>
                            <ul className="space-y-4 text-lg text-stone-600">
                                <li className="flex items-start gap-4">
                                    <span className="bg-amber-100 p-2 rounded-full text-amber-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.96 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5Z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <div>
                                        <span className="block font-bold text-stone-900">Phone</span>
                                        <a href={`tel:${siteConfig.contact.phone?.replace(/\D/g, '')}`} className="hover:text-amber-600 transition-colors">{siteConfig.contact.phone}</a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="bg-amber-100 p-2 rounded-full text-amber-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <div>
                                        <span className="block font-bold text-stone-900">Location</span>
                                        <span>{siteConfig.contact.address}</span>
                                    </div>
                                </li>
                                {siteConfig.contact.email && (
                                    <li className="flex items-start gap-4">
                                        <span className="bg-amber-100 p-2 rounded-full text-amber-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                                            </svg>
                                        </span>
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
        </div>
    );
}
