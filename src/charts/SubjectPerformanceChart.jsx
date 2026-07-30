import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// Same three-band read as the rest of the app's heat-maps, just at the
// thresholds this particular indicator (subject mastery %) already used.
const BAND = {
  strong: { min: 45, bg: "#E6F4EA", text: "#1B5E20", bar: "#2E7D32" },
  watch: { min: 40, bg: "#FFF3E0", text: "#B15C00", bar: "#FB8C00" },
  support: { min: -Infinity, bg: "#FDEAEA", text: "#B71C1C", bar: "#D32F2F" },
};

const bandFor = (pct) => (pct >= BAND.strong.min ? BAND.strong : pct >= BAND.watch.min ? BAND.watch : BAND.support);

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
        {pct.toFixed(1)}%
      </Box>
    </Box>
  );
};

const SubjectPerformanceChart = ({ columns = [], data = [] }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: colors.ink }}>
            📚 Subject-wise Mastery Heat-map (% students at mastery, by District)
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip size="small" label={`≥${BAND.strong.min}% High`} sx={{ bgcolor: BAND.strong.bg, color: BAND.strong.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`${BAND.watch.min}–44.99% Medium`} sx={{ bgcolor: BAND.watch.bg, color: BAND.watch.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`<${BAND.watch.min}% Low`} sx={{ bgcolor: BAND.support.bg, color: BAND.support.text, fontWeight: 600, fontSize: 11 }} />
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
                {columns.map((col) => {
                  const isAverage = col.endsWith("Average");
                  return (
                    <th
                      key={col}
                      style={{
                        background: isAverage ? colors.navyLight : colors.navy,
                        color: "#fff",
                        padding: "10px 8px",
                        minWidth: isAverage ? 100 : 112,
                        whiteSpace: "nowrap",
                        fontFamily: fontMono,
                        letterSpacing: 0.5,
                        fontSize: 11,
                        textTransform: "uppercase",
                        borderLeft: isAverage ? `2px solid ${colors.gold}` : "none",
                      }}
                    >
                      {isAverage ? "⭐ " + col : col}
                    </th>
                  );
                })}
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

                  {columns.map((col) => {
                    const pct = (row[col] ?? 0) * 100;
                    const isAverage = col.endsWith("Average");

                    return (
                      <td
                        key={col}
                        style={{
                          textAlign: "center",
                          padding: "6px 8px",
                          borderBottom: "1px solid #EEF0F5",
                          borderLeft: isAverage ? `2px solid ${colors.gold}` : "none",
                        }}
                      >
                        <Pill pct={pct} bold={isAverage} />
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
                {columns.map((col) => {
                  const isAverage = col.endsWith("Average");
                  const avgPct = average(data, (r) => (r[col] ?? 0) * 100);
                  return (
                    <td key={col} style={{ textAlign: "center", padding: "6px 8px", borderLeft: isAverage ? `2px solid ${colors.gold}` : "none" }}>
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

export default SubjectPerformanceChart;
