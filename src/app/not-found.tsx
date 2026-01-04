import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">Could not find requested resource</p>
            <Link href="/" className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
                Return Home
            </Link>
        </div>
    );
}
