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

// Same cleanup as dataService's cleanSubjectLabel — kept local here so this
// is a display-only concern; `col` itself (used to look up row[col]) is
// left untouched.
const displayLabel = (col = "") => col.replace(/\s*\(Gujarati Medium\)/gi, "").trim();

const average = (rows, col) => {
  const values = rows.map((r) => r[col]).filter((v) => typeof v === "number");
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

// Generic District x Column percentage heat-map. `data` rows look like
// { District, [column]: percentValue, ... } — used for both the SAT
// Grade-wise and Subject-wise breakdowns. When `data2` is also passed (with
// `label`/`label2`), each cell shows both periods side by side instead of
// needing two separate full-width tables one after another.
const SATHeatMapChart = ({
  title,
  icon = "🌡️",
  columns = [],
  data = [],
  data2 = null,
  label = "S1",
  label2 = "S2",
  allData = null,
  allData2 = null,
}) => {
  const dual = Boolean(data2);
  const data2ByDistrict = dual ? Object.fromEntries(data2.map((r) => [r.District, r])) : {};
  const statsSource = allData || data;
  const statsSource2 = allData2 || data2;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2.5, border: "1px solid #E4E7F0" }} elevation={0}>
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
                      minWidth: dual ? 150 : 112,
                      whiteSpace: "nowrap",
                      fontFamily: fontMono,
                      letterSpacing: 0.5,
                      fontSize: 11,
                      textTransform: "uppercase",
                    }}
                  >
                    {displayLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => {
                const row2 = dual ? data2ByDistrict[row.District] : null;

                return (
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
                      const pct2 = dual ? row2?.[col] ?? null : null;

                      return (
                        <td
                          key={col}
                          style={{
                            textAlign: "center",
                            padding: "6px 8px",
                            borderBottom: "1px solid #EEF0F5",
                          }}
                        >
                          {dual ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <DualPill label={label} pct={pct} />
                              <DualPill label={label2} pct={pct2} />
                            </Box>
                          ) : (
                            <Pill pct={pct} height={22} fontSize={12} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* State Average — same coloured-pill treatment as every
                district row, but pinned as the last row with a distinct
                background so it reads as a summary line, not one more
                district. */}
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
                  const avg = average(statsSource, col);
                  const avg2 = dual ? average(statsSource2, col) : null;

                  return (
                    <td key={col} style={{ textAlign: "center", padding: "6px 8px" }}>
                      {dual ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <DualPill label={label} pct={avg} bold />
                          <DualPill label={label2} pct={avg2} bold />
                        </Box>
                      ) : (
                        <Pill pct={avg ?? 0} height={22} fontSize={12} bold />
                      )}
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

// One row of a dual-semester cell: a small fixed-width period label
// ("S1"/"S2") sitting OUTSIDE the pill, so the pill itself has its full
// width free for the number — nothing crammed together fighting for space.
const DualPill = ({ label, pct, bold = false }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <Typography
      sx={{
        fontFamily: fontMono,
        fontSize: 10,
        fontWeight: 700,
        color: "#5B6B85",
        width: 16,
        flexShrink: 0,
        textAlign: "right",
      }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Pill pct={pct} height={20} fontSize={11.5} bold={bold} />
    </Box>
  </Box>
);

// One coloured, proportional-fill percentage cell.
const Pill = ({ pct, height = 22, fontSize = 12, bold = false }) => {
  if (pct == null) {
    return (
      <Box sx={{ borderRadius: 1.5, bgcolor: "#F0F1F5", height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: fontSize - 1, color: "#9AA5B1" }}>—</Typography>
      </Box>
    );
  }

  const band = bandFor(pct);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 1.5,
        bgcolor: band.bg,
        overflow: "hidden",
        height,
        border: bold ? `1px solid ${band.bar}` : "none",
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
          fontWeight: bold ? 800 : 700,
          fontSize,
          color: "#16233B",
          // A white halo around the number, not a pct-based colour switch —
          // that way it stays readable no matter whether it lands on the
          // filled or unfilled part of the bar.
          textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 3px #fff",
        }}
      >
        {pct.toFixed(0)}%
      </Box>
    </Box>
  );
};

export default SATHeatMapChart;
