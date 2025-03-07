import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Image src="/stewlyblume-notfound.gif" alt="Notfound" width="200" height="50"></Image>
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-2xl mb-8">Page Not Found</p>
            <Link href="/" className="text-blue-500 hover:underline">
                Go back to Home
            </Link>
        </div>
    );
}