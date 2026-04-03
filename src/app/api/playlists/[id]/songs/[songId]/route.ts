import { db } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; songId: string }> }) {
  const { id, songId } = await params;
  const { error } = await db.from("playlistSongs").delete().eq("playlistId", id).eq("songId", songId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
