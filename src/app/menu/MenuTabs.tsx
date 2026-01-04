'use client';

import { useState } from 'react';
import WPContent from '@/components/wordpress/WPContent/WPContent';
import WPText from '@/components/wordpress/WPText/WPText';

const TABS = [
    { id: 'lunch', label: 'Lunch', slug: 'menu' }, // Assuming 'menu' is the default lunch content
    { id: 'dinner', label: 'Dinner', slug: 'dinner' },
    { id: 'kids', label: 'Kids Menu', slug: 'kids-menu' },
    { id: 'dessert', label: 'Dessert', slug: 'dessert-menu' },
];

export default function MenuTabs() {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    return (
        <div>
            {/* Tabs Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${activeTab.id === tab.id
                            ? 'bg-amber-600 text-white shadow-lg scale-105'
                            : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                            }`}
                        aria-selected={activeTab.id === tab.id}
                        role="tab"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] transition-opacity duration-300">
                {/* 
                    We key by slug to force a remount/re-fetch by the underlying WP components 
                    when the tab changes. 
                */}
                <div key={activeTab.slug} className="animate-fadeIn">
                    <div className="text-center mb-8">
                        <WPText
                            slug={activeTab.slug}
                            field="title.rendered"
                            tag="h2"
                            staticData={`${activeTab.label} Menu`}
                            className="text-3xl font-serif font-bold text-stone-800"
                        />
                    </div>

                    <WPContent
                        slug={activeTab.slug}
                        isStatic={false}
                        className="prose lg:prose-xl mx-auto dark:prose-invert"
                    />
                </div>
            </div>
        </div>
    );
}
