import { db } from "@/lib/db";

export async function GET() {
  try {
    const [playlistsRes, songsRes, albumsRes, artistsRes] = await Promise.all([
      db.from("playlists").select("id, title, description, coverImage, songs:playlistSongs(playlistId, songId, order, addedAt)").limit(6),
      db.from("songs").select("*, artist:artists(id, name, image), album:albums(id, title, cover)").limit(10),
      db.from("albums").select("*, artist:artists(id, name, image)").order("createdAt", { ascending: false }).limit(10),
      db.from("artists").select("*, songs(count)").order("createdAt", { ascending: false }).limit(8),
    ]);

    return Response.json({
      playlists: playlistsRes.data || [],
      trendingSongs: songsRes.data || [],
      newReleases: albumsRes.data || [],
      popularArtists: artistsRes.data || [],
    });
  } catch (error) {
    return Response.json({ error: "Failed to load home data" }, { status: 500 });
  }
}
