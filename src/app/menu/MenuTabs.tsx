'use client';

import { useState } from 'react';
import WPContent from '@/components/wordpress/WPContent/WPContent';
import WPText from '@/components/wordpress/WPText/WPText';

const TABS = [
    { id: 'lunch', label: 'Lunch', slug: 'lunch-menu' },
    { id: 'dinner', label: 'Dinner', slug: 'dinner-menu' },
    { id: 'kids', label: 'Kids Menu', slug: 'kids-menu' },
    { id: 'dessert', label: 'Dessert', slug: 'dessert-menu' },
];

export default function MenuTabs() {
    console.log('MenuTabs loaded. TABS:', JSON.stringify(TABS));

    const [activeTab, setActiveTab] = useState(TABS[0]);

    // Handle keyboard navigation (Arrow keys)
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        let newIndex = index;

        if (e.key === 'ArrowRight') {
            newIndex = (index + 1) % TABS.length;
        } else if (e.key === 'ArrowLeft') {
            newIndex = (index - 1 + TABS.length) % TABS.length;
        } else if (e.key === 'Home') {
            newIndex = 0;
        } else if (e.key === 'End') {
            newIndex = TABS.length - 1;
        } else {
            return;
        }

        e.preventDefault();
        setActiveTab(TABS[newIndex]);
    };

    return (
        <div>
            {/* Tabs Navigation */}
            <div role="tablist" aria-label="Menu categories" className="flex flex-wrap justify-center gap-4 mb-12">
                {TABS.map((tab, index) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${activeTab.id === tab.id
                            ? 'bg-amber-600 text-white shadow-lg scale-105'
                            : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                            }`}
                        role="tab"
                        aria-selected={activeTab.id === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        tabIndex={activeTab.id === tab.id ? 0 : -1}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] transition-opacity duration-300">
                {TABS.map((tab) => (
                    <div
                        key={tab.slug}
                        role="tabpanel"
                        id={`tabpanel-${tab.id}`}
                        aria-labelledby={`tab-${tab.id}`}
                        hidden={activeTab.id !== tab.id}
                        className={activeTab.id === tab.id ? 'animate-fadeIn' : ''}
                    >
                        <div className="text-center mb-8">
                            <WPText
                                slug={tab.slug}
                                field="title.rendered"
                                tag="h2"
                                staticData={tab.label}
                                className="text-3xl font-serif font-bold text-stone-800"
                            />
                        </div>

                        <WPContent
                            slug={tab.slug}
                            isStatic={false}
                            className="prose lg:prose-xl mx-auto"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
