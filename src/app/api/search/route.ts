import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip, 60, 60000)) {
    return Response.json({ error: "Too many requests", songs: [], artists: [], albums: [] }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) return Response.json({ songs: [], artists: [], albums: [] });

  try {
    const [songsRes, artistsRes, albumsRes] = await Promise.all([
      db.from("songs").select("*, artist:artists(id, name, image), album:albums(id, title, cover)").ilike("title", `%${q}%`).limit(10),
      db.from("artists").select("id, name, image, songs(count), albums(count)").ilike("name", `%${q}%`).limit(5),
      db.from("albums").select("*, artist:artists(id, name, image), songs(count)").ilike("title", `%${q}%`).limit(5),
    ]);

    return Response.json({
      songs: songsRes.data || [],
      artists: artistsRes.data || [],
      albums: albumsRes.data || [],
    });
  } catch (error) {
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
