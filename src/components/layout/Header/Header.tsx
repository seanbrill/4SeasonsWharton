'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import logo from '@/assets/logo.png';
import MobileMenu from './MobileMenu';

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/menu', label: 'Menu' },
        { href: '/catering', label: 'Catering' },
        { href: '/events', label: 'Events' },
        { href: '/contact-us', label: 'Contact' },
    ];

    return (
        <header className="border-b bg-white transition-colors duration-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
                    <Image
                        src={logo}
                        alt="4 Seasons Wharton - Fine Mediterranean Dining"
                        width={180}
                        height={60}
                        className="h-12 md:h-16 lg:h-20 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:block" aria-label="Main navigation">
                    <ul className="flex space-x-2 lg:space-x-6 text-sm font-medium uppercase tracking-wide">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg transition-colors duration-200 ${isActive(link.href)
                                        ? 'text-amber-600 bg-amber-50'
                                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                                        }`}
                                    aria-current={isActive(link.href) ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
                    aria-label="Open menu"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    <svg
                        className="w-6 h-6 text-stone-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />
        </header>
    );
}
