import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { spawn } from "child_process";


// Redis client setup
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const MAX_REQUESTS = 3;  // Maximum requests allowed per window
const TIME_WINDOW = 60;  // Time window in seconds (1 minute)

// Handle GET requests to stream the audio
export async function GET(req: Request) {

    // Redis caching logic
    try {
        const ip = req.headers.get("x-forward-for") || req.headers.get("cf-connecting-ip") || "unknown";

        if (!ip) {
            return NextResponse.json({error: "Cannot determin IP address"}, {status: 400});
        }

        const key = `rate-limit:${ip}`;
        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.expire(key, TIME_WINDOW); // Set expiration to 60 seconds
        }

        if (requests > MAX_REQUESTS) {
            return NextResponse.json({error: "Too many requests. Try again later."}, {status: 429});
        }
        return handleStreamLogic(req);
    } catch (error) {
        console.error("Redis error:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}

// Handle the streaming logic
async function handleStreamLogic(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const url = searchParams.get("url");

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Get title and thumbnail
        const getTitle = spawn ("yt-dlp", ["--get-title", url]);

        let videoTitle = "";
        getTitle.stdout.on("data", (data) => {
            videoTitle += data.toString().trim();
        });

        getTitle.stderr.on("data", (err) => {
            console.error("yt-dlp stderr:", err.toString()); // Log stderr properly
        });

        // Wait for the title to be fetched
        await new Promise((resolve, reject) => {
            getTitle.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`yt-dlp process exited with code ${code}`));
                } else {
                    resolve(null);
                }
            });
        });

        if (!videoTitle) {
            return NextResponse.json({ error: "Failed to get video title" }, { status: 500 });
        }

        // Spawn yt-dlp to extract and stream audio
        const process = spawn("yt-dlp", [
            "-f", "bestaudio[ext=m4a]/bestaudio",  // Prioritize M4A or best audio
            "--extract-audio",
            "--audio-format", "mp3",
            "--audio-quality", "0",  // Best quality
            "-o", "-",               // Output to stdout
            url
        ]);
        let output = "";
        process.stdout.on("data", (data) => {
            output += data.toString();
        });

        console.log(output);

        process.stdout.on("data", (chunk) => {
            console.log("Receiving data chunk:", chunk.length, "bytes");
        });

        process.stderr.on("data", (err) => {
            console.error("yt-dlp stderr:", err.toString()); // Log stderr properly
        });

        process.on("close", (code) => {
            if (code !== 0) {
                console.error(`yt-dlp process exited with code ${code}`);
            }
        });



        process.stdout.once("data", (chunk) => {
            console.log("First chunk received:", chunk.slice(0, 10).toString("hex")); // Log first few bytes as hex
        });


        const stream = new ReadableStream({
            start(controller) {
                process.stdout.on("data", (chunk) => controller.enqueue(chunk)); // Queue next chunk
                process.stdout.on("end", () => controller.close());
                process.stderr.on("data", (err) => {
                    const errorMessage = err.toString();
                    if (!errorMessage.includes("[download]")) {
                        console.error("yt-dlp error:", errorMessage);
                    }
                });
                process.on("close", (code) => {
                    if (code !== 0) {
                        controller.error(new Error(`yt-dlp process exited with code ${code}`));
                    }
                });
            },
            cancel() {
                process.kill();
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": `attachment; filename="${videoTitle}.mp3"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}