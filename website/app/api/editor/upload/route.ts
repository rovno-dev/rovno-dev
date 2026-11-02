import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Editor image upload proxy.
 *
 * Novel's image plugin POSTs the raw file to a route; this handler forwards
 * it to the backend uploads endpoint with the auth cookie turned into a
 * Bearer token (the backend only reads Authorization, not cookies).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://main-service:8000";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const incoming = await req.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ detail: "Missing file" }, { status: 400 });
  }

  const outbound = new FormData();
  outbound.append("file", file, file.name || "image.png");

  const res = await fetch(`${API_BASE}/api/v1/uploads/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: outbound,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { detail: body?.detail || "Upload failed" },
      { status: res.status },
    );
  }

  // Backend returns /uploads/images/<file>; the existing Next proxy serves it.
  return NextResponse.json({ url: body.url });
}
