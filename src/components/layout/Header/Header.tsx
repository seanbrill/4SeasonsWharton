'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logo from '@/assets/logo.png';

export default function Header() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/menu', label: 'Menu' },
        { href: '/catering-menu', label: 'Catering' },
        { href: '/events', label: 'Events' },
        { href: '/contact-us', label: 'Contact' },
    ];

    return (
        <header className="border-b bg-white transition-colors duration-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
                <Link href="/" className="mb-4 md:mb-0 hover:opacity-90 transition-opacity">
                    <Image
                        src={logo}
                        alt="4 Seasons Wharton"
                        width={240}
                        height={80}
                        className="h-20 w-auto object-contain"
                        priority
                    />
                </Link>

                <nav>
                    <ul className="flex flex-wrap justify-center space-x-2 md:space-x-6 text-sm font-medium uppercase tracking-wide gap-y-2">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg transition-colors duration-200 ${isActive(link.href)
                                        ? 'text-amber-600 bg-amber-50'
                                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
