import { NextRequest, NextResponse } from "next/server";

// Proxy /uploads/<kind>/<file> -> backend /api/v1/uploads/<kind>/<file>.
// Two kinds are supported: `images` (legacy, editor inline images) and
// `media` (project covers + gallery, images AND videos up to 10 MB).
const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://main-service:8000";

const ALLOWED_KINDS = new Set(["images", "media"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path || path.length !== 2 || !ALLOWED_KINDS.has(path[0])) {
    return new NextResponse("Not found", { status: 404 });
  }
  const [kind, filename] = path;
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new NextResponse("Bad request", { status: 400 });
  }
  const upstream = await fetch(
    `${API_BASE}/api/v1/uploads/${kind}/${encodeURIComponent(filename)}`,
    { cache: "no-store" },
  );
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
