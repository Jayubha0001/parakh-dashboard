import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { GUJARAT_DISTRICT_PATHS, GUJARAT_MAP_VIEWBOX } from "../assets/gujaratDistrictPaths";

const normalize = (s = "") => s.toLowerCase().replace(/[^a-z]/g, "");

const ALIASES = {
  kutch: ["kachchh", "kutchh"],
  mehsana: ["mahesana"],
  panchmahal: ["panchmahals"],
  dang: ["thedangs", "dangs"],
  chhotaudaipur: ["chhotaudepur"],
  devbhumidwarka: ["devbhoomidwarka"],
};
const ALIAS_LOOKUP = {};
Object.entries(ALIASES).forEach(([geoKey, alts]) => alts.forEach((a) => (ALIAS_LOOKUP[a] = geoKey)));

const resolveGeoName = (inputName, pathsByNormalized) => {
  const n = normalize(inputName);
  if (pathsByNormalized[n]) return pathsByNormalized[n];
  const aliased = ALIAS_LOOKUP[n];
  if (aliased && pathsByNormalized[aliased]) return pathsByNormalized[aliased];
  return null;
};

// Red -> gold -> teal, matching the grade colours used everywhere else in
// the app. Scaled to the ACTUAL min/max of whatever's passed in (not fixed
// 40/60 breakpoints) — district scores tend to cluster in a narrow band,
// so a fixed scale made every bubble look the same shade of gold; scaling
// to the real spread spreads the colours out so districts are actually
// distinguishable at a glance.
const mix = (from, to, t) => `rgb(${from.map((f, i) => Math.round(f + (to[i] - f) * t)).join(",")})`;
const colorForPct = (pct, min, max) => {
  if (pct == null) return "#5B6B85";
  const RED = [211, 47, 47];
  const GOLD = [240, 180, 41];
  const TEAL = [31, 138, 112];
  if (max <= min) return `rgb(${GOLD.join(",")})`;
  const t = Math.max(0, Math.min(1, (pct - min) / (max - min)));
  if (t >= 0.5) return mix(GOLD, TEAL, (t - 0.5) / 0.5);
  return mix(RED, GOLD, t / 0.5);
};

/**
 * Compact, dark-theme bubble map of Gujarat — a faint district outline as
 * geographic backdrop, with a coloured circle per district (colour = the
 * metric passed in) placed at that district's centroid. Priority districts
 * get a gold ring around their bubble. Clicking a bubble calls setDistrict,
 * same contract as GujaratDistrictMap, so it plugs into the same filter.
 */
const GujaratBubbleMap = ({
  district = "All",
  setDistrict,
  districts = [],
  dataByDistrict = {},
  metricLabel = "Value",
  valueSuffix = "",
  priorityDistricts = [],
}) => {
  const [hovered, setHovered] = useState(null);

  const pathsByNormalized = {};
  GUJARAT_DISTRICT_PATHS.forEach((p) => (pathsByNormalized[normalize(p.name)] = normalize(p.name)));

  const geoNameToYourName = {};
  districts.forEach((yourName) => {
    if (yourName === "All") return;
    const geoKey = resolveGeoName(yourName, pathsByNormalized);
    if (geoKey) geoNameToYourName[geoKey] = yourName;
  });

  const values = Object.values(dataByDistrict).filter((v) => typeof v === "number");
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 100;

  return (
    <Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", mb: 0.5 }}>
        Gujarat — {metricLabel} by District
      </Typography>
      <Box sx={{ position: "relative" }}>
        <svg viewBox={GUJARAT_MAP_VIEWBOX} style={{ width: "100%", height: "auto", maxHeight: 230, display: "block" }}>
          {/* Faint state outline for geographic context */}
          {GUJARAT_DISTRICT_PATHS.map((p) => (
            <path key={`outline-${p.name}`} d={p.d} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)" strokeWidth={0.6} />
          ))}

          {/* Bubbles */}
          {GUJARAT_DISTRICT_PATHS.map((p) => {
            const normName = normalize(p.name);
            const yourName = geoNameToYourName[normName];
            if (!yourName) return null;
            const val = dataByDistrict[yourName];
            const isPriority = priorityDistricts.includes(yourName);
            const isSelected = district !== "All" && normalize(district) === normName;
            const isHovered = hovered === yourName;
            const r = isSelected ? 11 : isHovered ? 10.5 : 8.5;

            return (
              <g key={p.name} style={{ cursor: "pointer" }} onClick={() => setDistrict(yourName)} onMouseEnter={() => setHovered(yourName)} onMouseLeave={() => setHovered(null)}>
                {isPriority && <circle cx={p.cx} cy={p.cy} r={r + 4} fill="none" stroke="#F0B429" strokeWidth={1.8} />}
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={r}
                  fill={colorForPct(val, minVal, maxVal)}
                  stroke={isSelected ? "#fff" : "rgba(255,255,255,0.5)"}
                  strokeWidth={isSelected ? 1.8 : 0.8}
                  opacity={isHovered || isSelected ? 1 : 0.9}
                />
              </g>
            );
          })}
        </svg>

        {hovered && (
          <Box
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: "rgba(0,0,0,0.75)",
              color: "#fff",
              px: 1.2,
              py: 0.6,
              borderRadius: 1.5,
              fontSize: 11.5,
              pointerEvents: "none",
            }}
          >
            <b>{hovered}</b>
            {dataByDistrict[hovered] != null && (
              <>
                {" "}
                — {dataByDistrict[hovered]}
                {valueSuffix}
              </>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mt: 0.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1F8A70" }} />
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>High</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#F0B429" }} />
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Mid</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#D32F2F" }} />
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Low</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", border: "1.8px solid #F0B429" }} />
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Priority</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GujaratBubbleMap;
