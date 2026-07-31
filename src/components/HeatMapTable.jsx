import { Fragment } from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

// ---------------------------------------------------------------------------
// Single shared "District x Column %" heat-map table.
//
// v2: flat, solid-colour badges instead of proportional "fill bar" pills.
// The old fill-bar design put a colour boundary partway THROUGH the text
// whenever a value wasn't near 0% or 100% (worse in the dual Sem1/Sem2
// cells, where each mini-pill was only ~20px tall) — that's what made the
// numbers hard to read. A badge is just one flat background colour with a
// pre-defined readable text colour (the same pair already used for the
// legend chips above the table), so there's no boundary to render through
// at any screen size or zoom level.
//
// Dual-period mode (Sem 1 vs Sem 2) is now laid out as two real
// side-by-side sub-columns under a grouped header, instead of two tiny
// stacked pills squeezed into one cell — plain spreadsheet-style columns,
// easier to scan than a miniaturised chart-in-a-cell.
// ---------------------------------------------------------------------------

const average = (rows, getValue) => {
  const values = rows.map(getValue).filter((v) => typeof v === "number" && !Number.isNaN(v));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

const bandFor = (bands, pct) => bands.find((b) => pct >= b.min) || bands[bands.length - 1];

// One flat, solid-colour percentage badge.
const Badge = ({ pct, bands, bold = false, compact = false }) => {
  if (pct == null || Number.isNaN(pct)) {
    return (
      <Box
        sx={{
          borderRadius: 1.5,
          bgcolor: "#F0F1F5",
          height: compact ? 24 : 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: 11, color: "#9AA5B1" }}>—</Typography>
      </Box>
    );
  }

  const band = bandFor(bands, pct);

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        bgcolor: band.bg,
        color: band.text,
        height: compact ? 24 : 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        fontFamily: fontMono,
        fontWeight: bold ? 800 : 700,
        fontSize: compact ? 11.5 : 12.5,
        border: bold ? `1.5px solid ${band.text}` : "none",
      }}
    >
      {pct.toFixed(1)}%
    </Box>
  );
};

const stickyHeaderCell = {
  position: "sticky",
  left: 0,
  background: colors.navy,
  color: "#fff",
  padding: "10px 12px",
  textAlign: "left",
  minWidth: 150,
  zIndex: 2,
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
  zIndex: 1,
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
  // Dual-period mode (e.g. Semester 1 vs Semester 2, side by side)
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
                <th style={stickyHeaderCell} rowSpan={dual ? 2 : 1}>
                  District
                </th>
                {columns.map((col) => {
                  const isAvg = isAverageColumn(col);
                  return (
                    <th
                      key={col}
                      colSpan={dual ? 2 : 1}
                      rowSpan={dual ? 1 : 1}
                      style={{
                        background: isAvg ? colors.navyLight : colors.navy,
                        color: "#fff",
                        padding: "10px 8px",
                        minWidth: dual ? 140 : isAvg ? 100 : 112,
                        whiteSpace: "nowrap",
                        fontFamily: fontMono,
                        letterSpacing: 0.5,
                        fontSize: 11,
                        textTransform: "uppercase",
                        borderLeft: isAvg ? `2px solid ${colors.gold}` : "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {isAvg ? "⭐ " + columnLabel(col) : columnLabel(col)}
                    </th>
                  );
                })}
              </tr>
              {dual && (
                <tr>
                  {columns.map((col) => {
                    const isAvg = isAverageColumn(col);
                    return (
                      <Fragment key={col}>
                        <th
                          style={{
                            background: isAvg ? colors.navyLight : "#2C3B57",
                            color: "#D8DEEA",
                            padding: "5px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: fontMono,
                            borderLeft: isAvg ? `2px solid ${colors.gold}` : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {label}
                        </th>
                        <th
                          style={{
                            background: isAvg ? colors.navyLight : "#2C3B57",
                            color: "#D8DEEA",
                            padding: "5px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: fontMono,
                          }}
                        >
                          {label2}
                        </th>
                      </Fragment>
                    );
                  })}
                </tr>
              )}
            </thead>

            <tbody>
              {data.map((row, i) => {
                const row2 = dual ? data2ByDistrict[row.District] : null;

                return (
                  <tr key={row.District} style={{ background: i % 2 === 1 ? "#FAFBFD" : "#fff" }}>
                    <td style={stickyBodyCell}>{row.District}</td>

                    {columns.map((col) => {
                      const pct = getValue(row, col);
                      const isAvg = isAverageColumn(col);

                      if (dual) {
                        const pct2 = getValue(row2 || {}, col);
                        return (
                          <Fragment key={col}>
                            <td
                              title={cellTitle ? cellTitle(row, col) : undefined}
                              style={{
                                textAlign: "center",
                                padding: "5px 6px",
                                borderBottom: "1px solid #EEF0F5",
                                borderLeft: isAvg ? `2px solid ${colors.gold}` : "none",
                              }}
                            >
                              <Badge pct={pct} bands={bands} bold={isAvg} compact />
                            </td>
                            <td
                              title={cellTitle ? cellTitle(row, col) : undefined}
                              style={{
                                textAlign: "center",
                                padding: "5px 6px",
                                borderBottom: "1px solid #EEF0F5",
                              }}
                            >
                              <Badge pct={pct2} bands={bands} bold={isAvg} compact />
                            </td>
                          </Fragment>
                        );
                      }

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
                          <Badge pct={pct} bands={bands} bold={isAvg} />
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

                  if (dual) {
                    const avgPct2 = average(statsSource2, (r) => getValue(r, col));
                    return (
                      <Fragment key={col}>
                        <td style={{ textAlign: "center", padding: "5px 6px", borderLeft: isAvg ? `2px solid ${colors.gold}` : "none" }}>
                          <Badge pct={avgPct} bands={bands} bold compact />
                        </td>
                        <td style={{ textAlign: "center", padding: "5px 6px" }}>
                          <Badge pct={avgPct2} bands={bands} bold compact />
                        </td>
                      </Fragment>
                    );
                  }

                  return (
                    <td
                      key={col}
                      style={{
                        textAlign: "center",
                        padding: "6px 8px",
                        borderLeft: isAvg ? `2px solid ${colors.gold}` : "none",
                      }}
                    >
                      <Badge pct={avgPct ?? 0} bands={bands} bold />
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
