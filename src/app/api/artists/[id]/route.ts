import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [artistRes, songsRes, albumsRes] = await Promise.all([
    db.from("artists").select("*").eq("id", id).single(),
    db.from("songs").select("*, artist:artists(id, name, image), album:albums(id, title, cover, year)").eq("artistId", id),
    db.from("albums").select("*, artist:artists(id, name, image)").eq("artistId", id),
  ]);
  if (artistRes.error) return Response.json({ error: "Artist not found" }, { status: 404 });
  return Response.json({
    ...artistRes.data,
    songs: songsRes.data || [],
    albums: albumsRes.data || [],
  });
}
