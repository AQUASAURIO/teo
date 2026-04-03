import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db.from("songs").select("*, artist:artists(id, name, image), album:albums(id, title, cover)").limit(50);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}
