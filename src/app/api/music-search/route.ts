import { searchAllSources } from "@/lib/music-search";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip, 60, 60000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) return Response.json({ results: [], sources: [] });

  try {
    const { results, sources } = await searchAllSources(q, 10);
    return Response.json({ results, sources });
  } catch {
    return Response.json({ results: [], sources: [] }, { status: 500 });
  }
}
