import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    try {
        // Run yt-dlp to extract metadata
        const { stdout } = await execPromise(`yt-dlp --dump-json ${url}`);
        const metadata = JSON.parse(stdout);

        return NextResponse.json({
            title: metadata.title,
            thumbnail: metadata.thumbnail || metadata.thumbnails?.[0]?.url,
        });
    } catch (error) {
        console.error("yt-dlp error:", error);
        return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
    }
}
