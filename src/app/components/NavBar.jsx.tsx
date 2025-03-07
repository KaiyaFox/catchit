// Simple NavBar

import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">😸 Catchit</Link>
                <div className="space-x-4">
                    <a href="/about" className="hover:underline">About</a>
                    <a href="/contact" className="hover:underline">Contact</a>
                </div>
            </div>
        </nav>
    )
}