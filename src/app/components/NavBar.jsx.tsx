"use client";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
    const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

    return (
        <>
            <nav className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold">😸 Catchit</Link>
                    <div className="space-x-4">
                        <button className="hover:underline" onClick={() => setModalContent({ title: "Catchit v.1.0",
                            content: "Catchit is a tool for downloading media from websites easily. " +
                                "The app take URLs and finds the media content and allows you to download the .MP3 of the audio." +
                                " Built with ❤️ from Chicago!"
                        })}>
                            About
                        </button>
                    </div>
                </div>
            </nav>

            {/* DaisyUI Modal */}
            {modalContent && (
                <dialog id="modal" className="modal modal-open">
                    <div className="modal-box">
                        <h2 className="font-bold text-lg">{modalContent.title}</h2>
                        <p className="py-4">{modalContent.content}</p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setModalContent(null)}>Close</button>
                        </div>
                    </div>
                </dialog>
            )}
        </>
    );
}