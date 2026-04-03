import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db.from("albums").select("*, artist:artists(id, name, image), songs(count)").limit(50);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}
