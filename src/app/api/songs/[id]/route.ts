import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await db.from("songs").select("*, artist:artists(id, name, image, bio), album:albums(id, title, cover, year, artistId)").eq("id", id).single();
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}
