import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Rovno.dev";
  const subtitle = searchParams.get("subtitle") || "Цифровое агентство полного цикла";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "white",
          padding: "80px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
            display: "flex",
          }}
        />
        
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#336DFF", fontSize: 24, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            <span>{"$"} cat readme.md</span>
          </div>

          <div style={{ display: "flex", fontSize: 72, fontWeight: "bold", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: "900px" }}>
            {title}
          </div>

          <div style={{ display: "flex", fontSize: 32, color: "#888" }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
