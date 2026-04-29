import { ImageResponse } from "next/og";
import { SITE_NAME, BRAND_COLORS } from "@/lib/site";

export const alt = `${SITE_NAME} - Find one more player. Fill games. Play more.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: BRAND_COLORS.deepNavy,
          backgroundImage: `radial-gradient(circle at 85% 15%, rgba(0,230,178,0.22) 0%, transparent 55%), radial-gradient(circle at 15% 95%, rgba(198,255,0,0.12) 0%, transparent 50%)`,
          color: BRAND_COLORS.white,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: BRAND_COLORS.emerald,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: BRAND_COLORS.emerald,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: BRAND_COLORS.deepNavy,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            OM
          </div>
          {SITE_NAME}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: BRAND_COLORS.white,
            }}
          >
            Find one more player.
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: BRAND_COLORS.emerald,
            }}
          >
            Play more.
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              opacity: 0.85,
              maxWidth: 980,
              marginTop: 8,
            }}
          >
            Fill open padel games at courts near you. Connect with players,
            join matches, level up.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            opacity: 0.8,
          }}
        >
          <span>Modern · Strong · Confident</span>
          <span style={{ fontWeight: 700, color: BRAND_COLORS.lime }}>
            omplayer.app
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
