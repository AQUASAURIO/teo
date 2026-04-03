import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [albumRes, songsRes] = await Promise.all([
    db.from("albums").select("*, artist:artists(id, name, image, bio)").eq("id", id).single(),
    db.from("songs").select("*, artist:artists(id, name, image), album:albums(id, title, cover, year, artistId)").eq("albumId", id).order("createdAt", { ascending: true }),
  ]);
  if (albumRes.error) return Response.json({ error: "Album not found" }, { status: 404 });
  return Response.json({
    ...albumRes.data,
    songs: songsRes.data || [],
  });
}
