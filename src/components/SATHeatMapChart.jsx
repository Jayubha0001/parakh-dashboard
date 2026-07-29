import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// Three-band read, same thresholds as the rest of the app's band colouring
// (Strong / Watch / Needs Support) so this table means the same thing as
// every other coloured chip in the dashboard.
const BAND = {
  strong: { min: 60, bg: "#E6F4EA", text: "#1B5E20", bar: "#2E7D32" },
  watch: { min: 45, bg: "#FFF3E0", text: "#B15C00", bar: "#FB8C00" },
  support: { min: -Infinity, bg: "#FDEAEA", text: "#B71C1C", bar: "#D32F2F" },
};

const bandFor = (pct) => (pct >= BAND.strong.min ? BAND.strong : pct >= BAND.watch.min ? BAND.watch : BAND.support);

// Generic District x Column percentage heat-map. `data` rows look like
// { District, [column]: percentValue, ... } — used for both the SAT
// Grade-wise and Subject-wise breakdowns.
const SATHeatMapChart = ({ title, icon = "🌡️", columns = [], data = [] }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: colors.ink }}>
            {icon} {title}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip size="small" label={`≥${BAND.strong.min}% Strong`} sx={{ bgcolor: BAND.strong.bg, color: BAND.strong.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`${BAND.watch.min}–59% Watch`} sx={{ bgcolor: BAND.watch.bg, color: BAND.watch.text, fontWeight: 600, fontSize: 11 }} />
            <Chip size="small" label={`<${BAND.watch.min}% Needs Support`} sx={{ bgcolor: BAND.support.bg, color: BAND.support.text, fontWeight: 600, fontSize: 11 }} />
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
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      background: colors.navy,
                      color: "#fff",
                      padding: "10px 8px",
                      minWidth: 112,
                      whiteSpace: "nowrap",
                      fontFamily: fontMono,
                      letterSpacing: 0.5,
                      fontSize: 11,
                      textTransform: "uppercase",
                    }}
                  >
                    {col}
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

                  {columns.map((col) => {
                    const pct = row[col] ?? 0;
                    const band = bandFor(pct);

                    return (
                      <td
                        key={col}
                        style={{
                          textAlign: "center",
                          padding: "6px 8px",
                          borderBottom: "1px solid #EEF0F5",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 1.5,
                            bgcolor: band.bg,
                            overflow: "hidden",
                            height: 22,
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: `${Math.min(100, Math.max(0, pct))}%`,
                              bgcolor: band.bar,
                            }}
                          />
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
                              fontWeight: 700,
                              fontSize: 12,
                              color: "#16233B",
                              // A white halo around the number, not a pct-based
                              // colour switch — that way it stays readable no
                              // matter whether it lands on the filled or
                              // unfilled part of the bar.
                              textShadow:
                                "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 3px #fff",
                            }}
                          >
                            {pct.toFixed(0)}%
                          </Box>
                        </Box>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SATHeatMapChart;
