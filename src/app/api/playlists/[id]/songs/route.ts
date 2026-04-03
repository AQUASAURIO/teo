import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await db.from("playlistSongs")
    .select("*, song:songs(id, title, duration, cover, audioUrl, artistId, artist:artists(id, name, image), album:albums(id, title, cover))")
    .eq("playlistId", id).order("order", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json((data || []).map((ps: any) => ps.song));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  if (!body.songId) {
    return Response.json({ error: "songId is required" }, { status: 400 });
  }

  // Get max order
  const { data: maxOrder } = await db.from("playlistSongs")
    .select("order").eq("playlistId", id).order("order", { ascending: false }).limit(1);

  const order = (maxOrder && maxOrder.length > 0 ? maxOrder[0].order : -1) + 1;

  const { data, error } = await db.from("playlistSongs").insert({
    playlistId: id,
    songId: body.songId,
    order,
  }).select().single();

  if (error) {
    const message = error.message.includes("unique") || error.code === "23505"
      ? "Song already in playlist"
      : error.message;
    return Response.json({ error: message }, { status: 400 });
  }
  return Response.json(data, { status: 201 });
}
