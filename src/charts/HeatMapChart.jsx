import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// Max weight for each PGI-D category (used to compute % for colour scaling)
const CATEGORY_MAX = {
  "Outcomes (/290)": 290,
  "Classroom Transaction (/90)": 90,
  "Infrastructure (/51)": 51,
  "Safety & Protection (/35)": 35,
  "Digital Learning (/50)": 50,
  "Governance (/84)": 84,
};

// Same four-tier PGI-D grading brackets the rest of the PGI page already
// uses (Akanshi / Prachesta / Utkarsh / Atti-Uttam), just read as bands here.
const BAND = {
  strong: { min: 71, bg: "#E6F4EA", text: "#1B5E20", bar: "#2E7D32" },
  good: { min: 51, bg: "#EEF7EE", text: "#2E7D32", bar: "#66BB6A" },
  watch: { min: 31, bg: "#FFF3E0", text: "#B15C00", bar: "#FB8C00" },
  support: { min: -Infinity, bg: "#FDEAEA", text: "#B71C1C", bar: "#D32F2F" },
};

const bandFor = (pct) =>
  pct >= BAND.strong.min ? BAND.strong : pct >= BAND.good.min ? BAND.good : pct >= BAND.watch.min ? BAND.watch : BAND.support;

const average = (rows, getValue) => {
  const values = rows.map(getValue).filter((v) => typeof v === "number" && !Number.isNaN(v));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
};

const Pill = ({ pct, bold = false }) => {
  const band = bandFor(pct);
  return (
    <Box sx={{ position: "relative", borderRadius: 1.5, bgcolor: band.bg, overflow: "hidden", height: 22, border: bold ? `1px solid ${band.bar}` : "none" }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${Math.min(100, Math.max(0, pct))}%`, bgcolor: band.bar }} />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          fontFamily: fontMono,
          fontWeight: bold ? 800 : 700,
          fontSize: 12,
          color: "#16233B",
          textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 3px #fff",
        }}
      >
        {pct.toFixed(0)}%
      </Box>
    </Box>
  );
};

const HeatMapChart = ({ categories = [], data = [], allData = null }) => {
  const statsSource = allData || data;
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: colors.ink }}>
            🌡️ Category-wise Score Heat-map (% of max, by District)
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip size="small" label={`≥${BAND.strong.min}% Atti-Uttam+`} sx={{ bgcolor: BAND.strong.bg, color: BAND.strong.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`${BAND.good.min}–70% Utkarsh`} sx={{ bgcolor: BAND.good.bg, color: BAND.good.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`${BAND.watch.min}–50% Prachesta`} sx={{ bgcolor: BAND.watch.bg, color: BAND.watch.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`<${BAND.watch.min}% Akanshi`} sx={{ bgcolor: BAND.support.bg, color: BAND.support.text, fontWeight: 600, fontSize: 11 }} />
          </Box>
        </Box>

        <Box sx={{ overflowX: "auto", borderRadius: 2, border: "1px solid #E4E7F0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: colors.navy,
                    color: "#fff",
                    padding: "10px 12px",
                    textAlign: "left",
                    minWidth: 150,
                    zIndex: 1,
                    fontFamily: fontMono,
                    letterSpacing: 0.5,
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  District
                </th>
                {categories.map((cat) => (
                  <th
                    key={cat}
                    style={{
                      background: colors.navy,
                      color: "#fff",
                      padding: "10px 8px",
                      minWidth: 128,
                      whiteSpace: "nowrap",
                      fontFamily: fontMono,
                      letterSpacing: 0.5,
                      fontSize: 11,
                      textTransform: "uppercase",
                    }}
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={row.District} style={{ background: i % 2 === 1 ? "#FAFBFD" : "#fff" }}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "inherit",
                      padding: "8px 12px",
                      fontWeight: 600,
                      color: colors.ink,
                      borderBottom: "1px solid #EEF0F5",
                    }}
                  >
                    {row.District}
                  </td>

                  {categories.map((cat) => {
                    const max = CATEGORY_MAX[cat] || 100;
                    const value = row[cat] ?? 0;
                    const pct = max ? (value / max) * 100 : 0;

                    return (
                      <td
                        key={cat}
                        title={`${value} / ${max}`}
                        style={{
                          textAlign: "center",
                          padding: "6px 8px",
                          borderBottom: "1px solid #EEF0F5",
                        }}
                      >
                        <Pill pct={pct} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr style={{ background: "#EFF3FB", borderTop: `2px solid ${colors.navy}` }}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#EFF3FB",
                    padding: "8px 12px",
                    fontWeight: 800,
                    color: colors.navy,
                    fontFamily: fontMono,
                    fontSize: 11,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  ⭐ State Average
                </td>
                {categories.map((cat) => {
                  const max = CATEGORY_MAX[cat] || 100;
                  const avgPct = average(statsSource, (r) => (max ? ((r[cat] ?? 0) / max) * 100 : 0));
                  return (
                    <td key={cat} style={{ textAlign: "center", padding: "6px 8px" }}>
                      <Pill pct={avgPct} bold />
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HeatMapChart;
