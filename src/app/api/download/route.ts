import { NextResponse } from 'next/server';
import { spawn } from "child_process"


async function downloadAudio(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn("yt-dlp", [
            "-x",
            "--audio-format", "mp3",
            "-o", "~/Downloads/%(title)s.%(ext)s",
            url
        ]);

        let output = ""
        let error = ""

        process.stdout.on("data", (data) => {
            output += data.toString();
        });

        process.stderr.on("data", (data) => {
            error += data.toString();
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve(output)
            } else {
                reject(new Error(`yt-dlp failed: ${error}`));
            }
        });
    });
}

// Handles POST requests
export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({error: "In order to Catchit, URL is required"}, {status: 400});

        const result = await downloadAudio(url)
        console.log("😼 Catchit is running...")
        return NextResponse.json({ message: "Catchit successful", result }); // Return the string data

    } catch (error) {
        return NextResponse.json({ error: `Catchit failed ${error}`}, {status: 500})
    }
}
