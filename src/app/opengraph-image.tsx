import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} - Padel courts and players in Ireland`;
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
          background:
            "linear-gradient(135deg, #0b6f57 0%, #14a37b 55%, #f4d35e 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🎾
          </div>
          {SITE_NAME}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Padel courts &amp; players in Ireland
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              opacity: 0.92,
              maxWidth: 980,
            }}
          >
            Compare prices, view amenities and join open games near you.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            opacity: 0.85,
          }}
        >
          <span>Dublin · Cork · Galway · Belfast · Limerick</span>
          <span style={{ fontWeight: 700 }}>padelconnect.ie</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
