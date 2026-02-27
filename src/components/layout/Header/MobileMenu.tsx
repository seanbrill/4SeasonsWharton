'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ANIMATION } from '@/lib/constants/design-tokens';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/catering', label: 'Catering' },
    { href: '/contact-us', label: 'Contact' },
];

/**
 * Mobile navigation menu with hamburger toggle
 * Implements proper ARIA attributes and keyboard navigation
 */
export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const firstLinkRef = useRef<HTMLAnchorElement>(null);

    const isActive = (path: string) => pathname === path;

    // Handle Escape key to close menu
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Focus first link when menu opens
    useEffect(() => {
        if (isOpen && firstLinkRef.current) {
            firstLinkRef.current.focus();
        }
    }, [isOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-${ANIMATION.MENU_TRANSITION_DURATION} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Menu Panel */}
            <nav
                ref={menuRef}
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-${ANIMATION.MENU_TRANSITION_DURATION} ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                aria-label="Mobile navigation"
                aria-hidden={!isOpen}
            >
                <div className="flex flex-col h-full">
                    {/* Close Button */}
                    <div className="flex justify-end p-4 border-b border-stone-200">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                            aria-label="Close menu"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <ul className="flex-1 px-4 py-6 space-y-2">
                        {navLinks.map((link, index) => (
                            <li key={link.href}>
                                <Link
                                    ref={index === 0 ? firstLinkRef : undefined}
                                    href={link.href}
                                    onClick={onClose}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.href)
                                        ? 'text-amber-600 bg-amber-50'
                                        : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Footer Info */}
                    <div className="p-4 border-t border-stone-200 text-center">
                        <p className="text-sm text-stone-500">4 Seasons Wharton</p>
                        <p className="text-xs text-stone-400 mt-1">Fine Mediterranean Dining</p>
                    </div>
                </div>
            </nav>
        </>
    );
}
