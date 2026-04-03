import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: "Too many requests", items: [], nextPageToken: "" }, { status: 429 });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: "YouTube API key not configured", items: [], nextPageToken: "" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const pageToken = searchParams.get("pageToken") || "";
    const maxResults = parseInt(searchParams.get("max") || "12");

    if (!query.trim()) {
      return NextResponse.json({ items: [], nextPageToken: "" });
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: `${query} music audio`,
      type: "video",
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
      videoCategoryId: "10",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("YouTube API error:", errorData);
      return NextResponse.json(
        { error: "YouTube API error", items: [], nextPageToken: "" },
        { status: 500 }
      );
    }

    const data = await res.json();

    const items = (data.items || []).map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          thumbnails: { medium?: { url: string }; high?: { url: string }; default?: { url: string } };
          publishedAt: string;
        };
      }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title
          .replace(/\([^)]*(official|lyric|audio|video|music)[^)]*\)/gi, "")
          .replace(/\[[^\]]*(official|lyric|audio|video|music)[^\]]*\]/gi, "")
          .replace(/ HD$/, "")
          .replace(/  +/g, " ")
          .trim(),
        channel: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          "",
        publishedAt: item.snippet.publishedAt,
      })
    );

    return NextResponse.json({
      items,
      nextPageToken: data.nextPageToken || "",
      totalResults: data.pageInfo?.totalResults || 0,
    });
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", items: [], nextPageToken: "" },
      { status: 500 }
    );
  }
}
