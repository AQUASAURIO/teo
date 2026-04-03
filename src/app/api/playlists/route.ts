import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "demo-user";

  const { data, error } = await db.from("playlists")
    .select("*, songs:playlistSongs(id, playlistId, songId, order, addedAt, song:songs(id, title, duration, cover, audioUrl, artistId, artist:artists(id, name, image), album:albums(id, title, cover)))")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const playlists = (data || []).map((pl: any) => ({
    ...pl,
    songs: (pl.songs || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((ps: any) => ps.song),
  }));

  return Response.json(playlists);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "demo-user";

  const body = await request.json();
  const { data, error } = await db.from("playlists").insert({
    title: body.title,
    description: body.description || null,
    coverImage: body.coverImage || null,
    userId: userId,
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
