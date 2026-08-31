import { useMemo, useState, useRef } from "react";
import { Paper, Box, Typography, Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  GUJARAT_DISTRICT_PATHS,
  GUJARAT_MAP_VIEWBOX,
} from "../assets/gujaratDistrictPaths";

// ---------------------------------------------------------------------------
// Name matching between the map's boundary file and whatever spelling your
// data uses (PARAKH / PGI exports are inconsistent: "Kachchh" vs "Kutch",
// "Sabar Kantha" vs "Sabarkantha", "The Dangs" vs "Dang", etc).
//
// normalize() strips spaces/hyphens/case so "Chhota Udaipur", "chhotaudepur"
// and "CHHOTAUDEPUR" all become the same key. ALIASES then bridges the
// handful of districts where the *words* differ, not just the spacing.
// If a district in your `districts` list still doesn't highlight correctly,
// add a line here — normalized-boundary-name: ["normalized-your-name"].
// ---------------------------------------------------------------------------
const normalize = (s = "") => s.toLowerCase().replace(/[^a-z]/g, "");

const ALIASES = {
  kutch: ["kachchh", "kutchh"],
  mehsana: ["mahesana"],
  panchmahal: ["panchmahals", "panchmahal"],
  dang: ["thedangs", "dangs"],
  chhotaudaipur: ["chhotaudepur", "chhotaudaipur"],
  devbhumidwarka: ["devbhoomidwarka"],
  banaskantha: ["banaskantha"],
  vavtharad: ["banaskantha", "vavtharad"], // newer split; falls back to Banaskantha if not in your list
};

const ALIAS_LOOKUP = (() => {
  const map = {};
  Object.entries(ALIASES).forEach(([geoKey, alts]) => {
    alts.forEach((a) => {
      if (!map[a]) map[a] = geoKey;
    });
  });
  return map;
})();

// Given a name from *your* data/dropdown, find the matching boundary-path name.
const resolveGeoName = (inputName, pathsByNormalized) => {
  const n = normalize(inputName);
  if (pathsByNormalized[n]) return pathsByNormalized[n];
  const aliased = ALIAS_LOOKUP[n];
  if (aliased && pathsByNormalized[aliased]) return pathsByNormalized[aliased];
  return null;
};

// Simple light -> dark interpolation for the choropleth fill.
const interpolateColor = (t, from = [255, 224, 178], to = [230, 81, 0]) => {
  const clamp = Math.max(0, Math.min(1, t));
  const rgb = from.map((f, i) => Math.round(f + (to[i] - f) * clamp));
  return `rgb(${rgb.join(",")})`;
};

// Distinct, pleasant palette used when there's no metric to shade by, so
// the map reads as a full-colour district map (like the reference image)
// instead of one flat beige shape. Assigned deterministically per district
// name (same district always gets the same colour between renders/pages).
const PALETTE = [
  "#8BC97C", // green
  "#F2A65A", // orange
  "#7FB6E0", // blue
  "#E6C15C", // yellow
  "#C98BC9", // purple
  "#7ECFC0", // teal
  "#E88A8A", // red/pink
  "#B0A8E0", // lavender
];

const hashString = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const paletteColorFor = (name) => PALETTE[hashString(name) % PALETTE.length];

/**
 * Interactive Gujarat district map. Clicking a district calls setDistrict
 * with the exact value from your `districts` list (same value the
 * dropdown filter already uses), so it plugs into the same state as
 * FilterBar / DistrictFilterBar — the rest of the page filters exactly
 * as it does today, the map is just another way to set it.
 *
 * Props:
 *  - district        currently selected value ("All" or a district name)
 *  - setDistrict     setter, same one passed to FilterBar/DistrictFilterBar
 *  - districts       full list of selectable district names (for matching)
 *  - dataByDistrict   optional: { [districtName]: number } to colour districts
 *                     by a metric (e.g. average score). Keys can use any
 *                     spelling — they're matched the same way as clicks.
 *  - metricLabel      optional label shown in the legend/tooltip, e.g. "Avg %"
 *  - valueSuffix      optional suffix appended to the value, e.g. "%"
 */
const GujaratDistrictMap = ({
  district = "All",
  setDistrict,
  districts = [],
  dataByDistrict = null,
  metricLabel = "Value",
  valueSuffix = "",
}) => {
  const [hovered, setHovered] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Index of boundary-path entries by their own normalized name.
  const pathsByNormalized = useMemo(() => {
    const idx = {};
    GUJARAT_DISTRICT_PATHS.forEach((p) => {
      idx[normalize(p.name)] = normalize(p.name);
    });
    return idx;
  }, []);

  // For every entry in `districts` (your real data list), figure out which
  // boundary shape it belongs to, so clicks can send back *your* spelling.
  const geoNameToYourName = useMemo(() => {
    const map = {};
    districts.forEach((yourName) => {
      if (yourName === "All") return;
      const geoKey = resolveGeoName(yourName, pathsByNormalized);
      if (geoKey) map[geoKey] = yourName;
    });
    return map;
  }, [districts, pathsByNormalized]);

  // For the choropleth: normalized geo-name -> numeric value.
  const valueByGeoName = useMemo(() => {
    if (!dataByDistrict) return {};
    const map = {};
    Object.entries(dataByDistrict).forEach(([name, value]) => {
      const geoKey = resolveGeoName(name, pathsByNormalized);
      if (geoKey) map[geoKey] = value;
    });
    return map;
  }, [dataByDistrict, pathsByNormalized]);

  const values = Object.values(valueByGeoName).filter(
    (v) => typeof v === "number" && !Number.isNaN(v)
  );
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 1;

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width !== containerWidth) setContainerWidth(rect.width);
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hoveredValue =
    hovered && valueByGeoName[normalize(hovered)] !== undefined
      ? valueByGeoName[normalize(hovered)]
      : null;

  const hoveredYourName = hovered ? geoNameToYourName[normalize(hovered)] : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #E4E7F0",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          Select District
        </Typography>

        {district !== "All" && (
          <Button
            size="small"
            variant="text"
            startIcon={<RestartAltIcon />}
            onClick={() => setDistrict("All")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Clear
          </Button>
        )}
      </Box>

      <Box
        ref={containerRef}
        onMouseMove={handleMove}
        sx={{ position: "relative", width: "100%", maxWidth: 640, mx: "auto" }}
      >
        <svg
          viewBox={GUJARAT_MAP_VIEWBOX}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {GUJARAT_DISTRICT_PATHS.map((p) => {
            const normName = normalize(p.name);
            const yourName = geoNameToYourName[normName];
            const isSelected =
              district !== "All" &&
              yourName &&
              normalize(yourName) === normalize(district);
            const isHovered = hovered === p.name;
            const val = valueByGeoName[normName];

            let fill = paletteColorFor(p.name); // colourful default (no metric)
            if (dataByDistrict && typeof val === "number") {
              fill = interpolateColor(
                maxVal > minVal ? (val - minVal) / (maxVal - minVal) : 0.5
              );
            }
            if (isSelected) fill = "#1565C0";

            return (
              <path
                key={p.name}
                d={p.d}
                fill={fill}
                stroke={isSelected ? "#0D47A1" : "#8a5a2b"}
                strokeWidth={isSelected ? 2.2 : isHovered ? 1.6 : 0.8}
                opacity={isHovered && !isSelected ? 0.85 : 1}
                style={{ cursor: yourName ? "pointer" : "default" }}
                onMouseEnter={() => setHovered(p.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => yourName && setDistrict(yourName)}
              />
            );
          })}

          {/* Persistent district-name labels, like the reference map —
              placed at each shape's centroid (cx/cy from the boundary
              file). pointer-events "none" so they never block clicks on
              the path underneath them. */}
          {GUJARAT_DISTRICT_PATHS.map((p) => {
            const normName = normalize(p.name);
            const yourName = geoNameToYourName[normName];
            const isSelected =
              district !== "All" &&
              yourName &&
              normalize(yourName) === normalize(district);
            return (
              <text
                key={`label-${p.name}`}
                x={p.cx}
                y={p.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
                style={{
                  fontSize: isSelected ? 8.5 : 7,
                  fontWeight: isSelected ? 700 : 600,
                  fill: isSelected ? "#ffffff" : "#5A3A1B",
                  paintOrder: "stroke",
                  stroke: "#ffffff",
                  strokeWidth: isSelected ? 0 : 2,
                  strokeLinejoin: "round",
                }}
              >
                {p.name}
              </text>
            );
          })}
        </svg>

        {hovered && (
          <Box
            sx={{
              position: "absolute",
              left: containerWidth
                ? Math.min(pointer.x + 14, containerWidth * 0.88)
                : pointer.x + 14,
              top: pointer.y + 10,
              bgcolor: "rgba(30,30,30,0.92)",
              color: "#fff",
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              fontSize: 12,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 5,
            }}
          >
            <b>{hoveredYourName || hovered}</b>
            {hoveredValue !== null && (
              <>
                <br />
                {metricLabel}: {hoveredValue}
                {valueSuffix}
              </>
            )}
          </Box>
        )}
      </Box>

      {dataByDistrict && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {metricLabel}
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${interpolateColor(
                0
              )}, ${interpolateColor(1)})`,
            }}
          />
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {minVal}
            {valueSuffix} – {maxVal}
            {valueSuffix}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GujaratDistrictMap;
