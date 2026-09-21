import { NextRequest, NextResponse } from "next/server";

// ponytail: proxy /order_files/<name> -> backend /api/v1/orders/files/<name>.
// The backend owns storage; Next.js just relays. No shared mount required,
// no reliance on Next standalone serving runtime-added public files.
const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://main-service:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path || path.length !== 1) {
    return new NextResponse("Not found", { status: 404 });
  }
  const filename = path[0];
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const upstream = await fetch(
    `${API_BASE}/api/v1/orders/files/${encodeURIComponent(filename)}`,
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
