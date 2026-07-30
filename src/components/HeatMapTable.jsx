import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// ---------------------------------------------------------------------------
// Single shared "District x Column %" heat-map table.
//
// SAT, PGI, and Subject-mastery each used to have their own near-duplicate
// copy of this table (different band thresholds, different column sets) —
// that's why the three pages didn't look or behave quite the same. This is
// now the ONE place the layout/logic lives; each page only supplies its own
// data + band thresholds + labels as props, so the underlying behaviour
// (sticky first column, coloured proportional pills, ⭐ State Average row
// pinned at the bottom, legend chips) stays identical everywhere.
// ---------------------------------------------------------------------------

const average = (rows, getValue) => {
  const values = rows.map(getValue).filter((v) => typeof v === "number" && !Number.isNaN(v));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

const bandFor = (bands, pct) => bands.find((b) => pct >= b.min) || bands[bands.length - 1];

// One coloured, proportional-fill percentage cell. Text colour is chosen
// for guaranteed contrast against whichever part of the pill it lands on —
// solid white on the filled (coloured) portion, solid dark ink on the
// unfilled (light) portion — instead of the old text-shadow "halo" trick,
// which could render as invisible at some browser zoom levels / screen
// sizes (the bug where the % just disappeared on larger screens).
const Pill = ({ pct, bands, height = 22, fontSize = 12, bold = false }) => {
  if (pct == null || Number.isNaN(pct)) {
    return (
      <Box sx={{ borderRadius: 1.5, bgcolor: "#F0F1F5", height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: fontSize - 1, color: "#9AA5B1" }}>—</Typography>
      </Box>
    );
  }

  const band = bandFor(bands, pct);
  const fillWidth = Math.min(100, Math.max(0, pct));
  const textColor = fillWidth >= 50 ? "#FFFFFF" : "#16233B";

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
      <Box sx={{ position: "absolute", inset: 0, width: `${fillWidth}%`, bgcolor: band.bar }} />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          fontFamily: fontMono,
          fontWeight: bold ? 800 : 700,
          fontSize,
          color: textColor,
        }}
      >
        {pct.toFixed(1)}%
      </Box>
    </Box>
  );
};

// One cell for the dual-period view (e.g. Sem 1 / Sem 2 side by side): a
// small fixed-width period label sitting OUTSIDE the pill, so the pill
// itself keeps its full width free for the number.
const LabeledPill = ({ label, pct, bands, bold = false }) => (
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
      <Pill pct={pct} bands={bands} height={20} fontSize={11.5} bold={bold} />
    </Box>
  </Box>
);

const stickyHeaderCell = {
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
};

const stickyBodyCell = {
  position: "sticky",
  left: 0,
  background: "inherit",
  padding: "8px 12px",
  fontWeight: 600,
  color: colors.ink,
  borderBottom: "1px solid #EEF0F5",
};

const HeatMapTable = ({
  title,
  icon = "🌡️",
  bands,
  columns = [],
  columnLabel = (col) => col,
  isAverageColumn = () => false,
  data = [],
  allData = null,
  getValue = (row, col) => row[col],
  cellTitle = null,
  // Dual-period mode (e.g. Semester 1 vs Semester 2 in the same cell)
  data2 = null,
  allData2 = null,
  label = "S1",
  label2 = "S2",
}) => {
  const dual = Boolean(data2);
  const statsSource = allData || data;
  const statsSource2 = allData2 || data2;
  const data2ByDistrict = dual ? Object.fromEntries(data2.map((r) => [r.District, r])) : {};

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: colors.ink }}>
            {icon} {title}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {bands.map((b) => (
              <Chip
                key={b.label}
                size="small"
                label={b.label}
                sx={{ bgcolor: b.bg, color: b.text, fontWeight: 600, fontSize: 11 }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ overflowX: "auto", borderRadius: 2, border: "1px solid #E4E7F0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={stickyHeaderCell}>District</th>
                {columns.map((col) => {
                  const isAvg = isAverageColumn(col);
                  return (
                    <th
                      key={col}
                      style={{
                        background: isAvg ? colors.navyLight : colors.navy,
                        color: "#fff",
                        padding: "10px 8px",
                        minWidth: dual ? 150 : isAvg ? 100 : 112,
                        whiteSpace: "nowrap",
                        fontFamily: fontMono,
                        letterSpacing: 0.5,
                        fontSize: 11,
                        textTransform: "uppercase",
                        borderLeft: isAvg ? `2px solid ${colors.gold}` : "none",
                      }}
                    >
                      {isAvg ? "⭐ " + columnLabel(col) : columnLabel(col)}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => {
                const row2 = dual ? data2ByDistrict[row.District] : null;

                return (
                  <tr key={row.District} style={{ background: i % 2 === 1 ? "#FAFBFD" : "#fff" }}>
                    <td style={stickyBodyCell}>{row.District}</td>

                    {columns.map((col) => {
                      const pct = getValue(row, col);
                      const pct2 = dual ? getValue(row2 || {}, col) : null;
                      const isAvg = isAverageColumn(col);

                      return (
                        <td
                          key={col}
                          title={cellTitle ? cellTitle(row, col) : undefined}
                          style={{
                            textAlign: "center",
                            padding: "6px 8px",
                            borderBottom: "1px solid #EEF0F5",
                            borderLeft: isAvg ? `2px solid ${colors.gold}` : "none",
                          }}
                        >
                          {dual ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <LabeledPill label={label} pct={pct} bands={bands} />
                              <LabeledPill label={label2} pct={pct2} bands={bands} />
                            </Box>
                          ) : (
                            <Pill pct={pct} bands={bands} bold={isAvg} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
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
                  const isAvg = isAverageColumn(col);
                  const avgPct = average(statsSource, (r) => getValue(r, col));
                  const avgPct2 = dual ? average(statsSource2, (r) => getValue(r, col)) : null;

                  return (
                    <td
                      key={col}
                      style={{
                        textAlign: "center",
                        padding: "6px 8px",
                        borderLeft: isAvg ? `2px solid ${colors.gold}` : "none",
                      }}
                    >
                      {dual ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <LabeledPill label={label} pct={avgPct} bands={bands} bold />
                          <LabeledPill label={label2} pct={avgPct2} bands={bands} bold />
                        </Box>
                      ) : (
                        <Pill pct={avgPct ?? 0} bands={bands} bold />
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

export default HeatMapTable;
