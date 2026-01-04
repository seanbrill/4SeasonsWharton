import { getPageContent } from "@/lib/wordpress/api";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | 4 Seasons Wharton",
  description: "Welcome to 4 Seasons Wharton.",
};

import Link from 'next/link';
import WPCarousel from '@/components/wordpress/WPCarousel/WPCarousel';
import WPImage from '@/components/wordpress/WPImage/WPImage';

export default async function Home() {

  //wordpress page cms content
  const main_gallery = await getPageContent('home-gallery');
  const dining_gallery = await getPageContent('dining-ambiance');

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Full Width Dynamic Carousel */}
      <section className="w-full relative">
        <WPCarousel
          slug="home-gallery"
          isStatic={false}
          className="w-full"
          aspectRatio="aspect-[21/9] md:aspect-[2.9/1]" // Cinematic Panoramic Ratio
          pageContent={main_gallery?.content?.rendered}
        />
      </section>

      {/* Engaging Content Section */}
      <section className="container mx-auto px-4 py-16">
        {main_gallery ? (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">4 Seasons Mediterranean</h1>
              <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full"></div>
            </div>

            {/* Grid of Visuals + Content */}
            {/* Grid of Visuals + Content */}
            {/* Featured Section */}
            <section className="py-20 bg-white">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                  <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl">
                    <WPCarousel
                      slug="dining-ambiance"
                      isStatic={false}
                      className="h-full w-full"
                      aspectRatio="h-full"
                      pageContent={dining_gallery?.content?.rendered}
                    />
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-amber-600 leading-tight">
                      Open Indoor & <br /> Outdoor!
                    </h2>

                    {/* Google Reviews UI */}
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex items-center -space-x-1">
                        {[1, 2, 3, 4].map((star) => (
                          <svg key={star} className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        {/* Partial Star for 4.8 */}
                        <div className="relative w-5 h-5">
                          <svg className="w-5 h-5 text-gray-300 fill-current absolute top-0 left-0" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          <div className="absolute top-0 left-0 w-[80%] overflow-hidden">
                            <svg className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center h-full">
                        <span className="font-bold text-stone-800 text-sm leading-none">4.8</span>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wide leading-none mt-0.5">Google Reviews</span>
                      </div>
                      <div className="bg-white border border-stone-200 p-1.5 rounded-full shadow-sm flex items-center justify-center">
                        {/* Using a reliable CDN for the Google G logo */}
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-lg text-stone-600 leading-relaxed">
                      4 Seasons is passionate about the best seasonal flavors from the Riviera and Coastal regions of Italy, Spain, and the South of France.
                    </p>
                    <p className="text-lg text-stone-600 leading-relaxed">
                      Come enjoy outdoor dining on our beautiful patio. Serving refreshing sangrias, cocktails, and craft beers. Find us on South Main Street in Wharton, just off Route 46, Route 80, Route 15.
                    </p>
                  </div>
                </div>

                {/* Intro Text for Features */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h3 className="text-4xl font-serif font-bold text-stone-800 mb-4">Welcome Back Home!</h3>
                  <p className="text-stone-600 text-lg">
                    We believe that great food starts with great ingredients. Our commitment to quality ensures that every dish we serve is a celebration of flavor, freshness, and culinary excellence.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { title: "Signature Refreshments", desc: "Handcrafted cocktails & fine wines" },
                    { title: "Authentic Cuisine", desc: "Culinary mastery in every dish" },
                    { title: "Sweet Indulgence", desc: "Decadent desserts to finish your meal" }
                  ].map((feature, idx) => (
                    <div key={idx} className="text-center p-8 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors duration-300">
                      <div className="h-48 w-full relative mb-6 rounded-lg overflow-hidden shadow-md">
                        <WPImage
                          slug="featured-items" // User creates ONE page with 3 images
                          field="whole_page_object" // Triggers content parsing
                          imageIndex={idx} // 0, 1, 2
                          className="object-cover w-full h-full"
                          isStatic={false}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-stone-800 mb-2">{feature.title}</h3>
                      <p className="text-stone-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-stone-100">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl font-serif font-bold text-stone-800 mb-6">Experience 4 Seasons</h2>
                  <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto">
                    Join us for an unforgettable dining experience. Reservations are highly recommended.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/menu" className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-all hover:scale-105 shadow-lg text-center">
                      View Full Menu
                    </Link>
                    <Link href="/contact-us" className="inline-flex items-center justify-center px-8 py-4 border-2 border-stone-800 text-stone-800 rounded-full font-bold hover:bg-stone-800 hover:text-white transition-all hover:scale-105 text-center">
                      Call for Reservations
                    </Link>
                  </div>
                  <p className="mt-6 text-stone-500 text-sm">or call {siteConfig.contact.phone}</p>
                </div>
              </div>
            </section>

          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Content Unavailable</h1>
            <p>Could not load homepage content.</p>
          </div>
        )}
      </section>
    </main>
  );
}
