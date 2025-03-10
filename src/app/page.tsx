"use client";
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";



export default function Home() {
    const [backgroundImage, setBackgroundImage] = useState<string>("");
    const [debouncerUrl, setDebouncerUrl] = useState<string>("");
    const [skeleton, setSkeleton] = useState<boolean>(false);
    const [url, setUrl] = useState<string>("");
    const [thumbnail, setThumbnail] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    // Fetch a random cat image
    const fetchRandomCatImage = async () => {
        try {
            const response = await fetch("https://api.thecatapi.com/v1/images/search");
            const data = await response.json();
            setBackgroundImage(data[0]?.url);
        } catch (error) {
            console.error("Error fetching cat image:", error);
        }
    };
    // Fetch a random cat image on component mount
    useEffect(() => {
        fetchRandomCatImage();
    }, []);


    // Handle paste
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
        } catch {
            console.error("Failed to read clipboard");
        }
    };

    // Debounce URL updates to prevent excessive re-fetching
    useEffect(() => {
        const handler = debounce(() => {
            setDebouncerUrl(url);
        }, 1500); // Adjust debounce time as needed

        handler();
        return () => handler.cancel();
    }, [url]);


    // Fetch metadata only when URL stops changing
    useEffect(() => {
        if (!debouncerUrl) {
            setTitle("");
            setThumbnail("");
            return;
        }

        fetchMetadata(debouncerUrl).then((data) => {
            if (data?.title) {
                setTitle(data.title);
                setThumbnail(data.thumbnail || null);
            } else {
                // Clear metadata if invalid URL or no metadata found
                setTitle("");
                setThumbnail("");
            }
        });

    }, [debouncerUrl]); // Now runs only when user stops typing



    // Get video/media metadata
    const fetchMetadata = async (videoUrl: string) => {
        try {
            setSkeleton(true);
            const response = await fetch(`/api/metadata?url=${videoUrl}`);
            const data = await response.json();
            console.log(data);
            setSkeleton(false);
            return {
                title: data.title,
                thumbnail: data.thumbnail,
            };
        } catch (error) {
            setSkeleton(false);
            console.error("Failed to fetch metadata:", error);
        }
    };

    // Handle download
    const handleDownload = async () => {
        if (!url) return;
        try {
            setError(null);
            setLoading(true);

            // Metadata
            const metadata = await fetchMetadata(url);
            const title = metadata?.title;

            const response = await fetch(`/api/catchIt?url=${url}`, {
                method: "GET",
            });

            if (!response.ok) {
                console.error("Failed to download:", response.statusText);
                setLoading(false);
                if (response.status === 429) {
                    setError("💩 WTF...!? Chill. Too many requests. Try again later.");
                } else {
                    setError("Uh-oh... Possible unsupported or invalid URL.");
                }
            } else {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${title}.mp3`;
                a.click();
            }
        } catch (error) {
            console.error("Failed to download:", error);
            setError("Something happened... download failed. Check the URL maybe?");
        } finally {
            setLoading(false);
        }
    };





    return (
        <div
            className="min-h-screen accent-transparent flex justify-center items-center text-white relative"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Gradient Overlay */}
            <div
                className="absolute inset-0 bg-black from-black via-black to-transparent"
                style={{
                    opacity: 0.8, // Adjust opacity to control how prominent the gradient is
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-5xl font-bold text-indigo-500 dark:text-yellow-400 mb-4">
                        Catchit - URL to MP3.. Like rn
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                        The app that gets your hands deep into the cat litter. No fluff, No scam bullshit.
                        <br />
                        Just URLs and downloads.
                    </p>
                    {/* Fun Instructions */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        <p>Just paste a link and hit download. That&#39;s it. No magic, no gimmicks.
                            <br></br>Unlike them other guys our Download button works.</p>
                        <p className="mt-2 text-red-500 font-semibold">Don&#39;t worry, we won&#39;t judge your URL. 🐱</p>
                    </div>
                </header>

                <main className="flex flex-col items-center gap-6">
                    {/* Error */}
                    {error && (
                        <div role="alert" className="alert alert-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div role="alert" className="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a10 10 0 00-10 10h2zm2 0a6 6 0 016-6V4a8 8 0 00-8 8h2zm2 0a4 4 0 014-4V4a6 6 0 00-6 6h2zm2 0a2 2 0 012-2V4a4 4 0 00-4 4h2z"></path>
                            </svg>
                            <span>Downloading...</span>
                        </div>
                    )}
                    {/* URL Input and Buttons */}
                    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setError(null);
                            }}
                            placeholder="Paste the URL to get the audio!"
                            className="input input-bordered input-lg w-full max-w-3xl text-2xl p-4 h-16 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-300"
                        />

                        {/* Title */}

                        {skeleton && (
                            <div className="flex w-52 flex-col gap-4">
                                Reading URL... 😼
                                <div className="skeleton h-32 w-full"></div>
                                <div className="skeleton h-4 w-28"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-full"></div>
                            </div>
                        )}
                        {title && (
                            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                                {title}
                            </h2>
                        )}

                        {/* Thumbnail */}
                        {thumbnail &&  (
                            <img src={thumbnail} alt="Video/Media Thumbnail" className="mt-4 w-48 h-48 rounded-lg shadow-lg"/>
                        )}

                        <div className="flex gap-4">
                            {/* Paste Button */}
                            <button
                                className="btn btn-accent btn-lg text-white hover:bg-green-600 focus:outline-none"
                                onClick={handlePaste}
                            >
                                Paste
                            </button>
                            {/* Download Button */}
                            <button
                                className="btn btn-primary btn-lg text-white hover:bg-blue-600 focus:outline-none"
                                onClick={handleDownload}
                            >
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Supported URLs (links) */}
                    <div className="flex flex-col items-center gap-2 mt-8">
                        <div className="max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                Works with:
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-center">
                                <i className="fa fa-soundcloud" aria-hidden="true"></i> YouTube, SoundCloud, and many more.
                            </p>
                            <hr className="my-4 border-gray-300 dark:border-gray-700" />
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                🐾 <strong>Disclaimer:</strong> Listen up—<strong>Catchit</strong> don’t do no sneaky business of jorking it behind closed doors. If a video’s got that **DRM** (Darn Restrictive Meow-chanics), we ain’t scratching at that door. 🚫🔒
                                We only scoop up the litter that’s free to grab. No claws, no hacks, just clean paws and legit downloads. 😼 Stick to the stuff that’s out in the open, and we’ll keep purring along. 🎶🐈💨
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}