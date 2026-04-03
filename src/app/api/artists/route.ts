import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db.from("artists").select("*").limit(50);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}
