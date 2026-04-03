import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: playlist, error } = await db.from("playlists")
    .select("*, user:profiles(id, name, image), songs:playlistSongs(id, playlistId, songId, order, addedAt, song:songs(id, title, duration, cover, audioUrl, artistId, artist:artists(id, name, image), album:albums(id, title, cover)))")
    .eq("id", id).single();

  if (error) return Response.json({ error: "Playlist not found" }, { status: 404 });

  return Response.json({
    ...playlist,
    songs: (playlist.songs || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((ps: any) => ps.song),
  });
}
