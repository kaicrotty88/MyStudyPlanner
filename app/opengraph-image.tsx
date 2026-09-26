import { ImageResponse } from "next/og";

export const alt = "MyStudyPlanner - study planner for students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAFAF9",
          color: "#2D2D2D",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#7A9B7F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 25,
            }}
          >
            M
          </div>
          MyStudyPlanner
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <div style={{ fontSize: 66, lineHeight: 1.05, fontWeight: 700, letterSpacing: "-2px" }}>
            Plan schoolwork. Study with purpose.
          </div>
          <div style={{ fontSize: 29, lineHeight: 1.35, color: "#626762" }}>
            Calendar, tasks, study sessions and results in one calm student planner.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#6B726C" }}>
          mystudyplanner.co
        </div>
      </div>
    ),
    size,
  );
}
