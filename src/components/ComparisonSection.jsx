import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableFooter,
  Paper,
  Chip,
} from "@mui/material";

import { colors, fontDisplay, fontMono } from "../theme/theme";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

const isGapColumn = (col) => col.toLowerCase().includes("gap");

const average = (rows, col) => {
  const vals = rows.map((d) => d[col]).filter((v) => !isNaN(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};

// Same three-band read as every other heat-map cell in the app, applied
// here to whichever percentage column this card is showing (Boys/Girls,
// Rural/Urban, etc.) — so a "55%" always means the same thing everywhere.
const bandFor = (pct) =>
  pct >= 60
    ? { bg: "#E6F4EA", text: "#1B5E20" }
    : pct >= 45
    ? { bg: "#FFF3E0", text: "#B15C00" }
    : { bg: "#FDEAEA", text: "#B71C1C" };

// Flat, solid-colour badge — same design as the app's HeatMapTable cells.
// (The earlier version filled a proportional bar behind the text, which
// put a colour boundary partway through the digits and made them hard to
// read; a flat background avoids that entirely.)
const PillCell = ({ pct, bold = false }) => {
  const band = bandFor(pct);
  return (
    <Box
      sx={{
        borderRadius: 1.5,
        bgcolor: band.bg,
        color: band.text,
        height: 28,
        minWidth: 76,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        fontFamily: fontMono,
        fontWeight: bold ? 800 : 700,
        fontSize: 12.5,
        border: bold ? `1.5px solid ${band.text}` : "none",
      }}
    >
      {pct.toFixed(1)}%
    </Box>
  );
};

// `data` is what's actually shown as rows (already narrowed by the page's
// district filter). `allData` is always the full, unfiltered 33-district
// set — the "Gujarat Average" cards and the State Average footer row are
// computed from allData, so picking a district doesn't quietly turn the
// state average into that one district's own number.
const ComparisonSection = ({
  title,
  icon = "📊",
  columns = [],
  data = [],
  allData = null,
  color = "#1976D2",
}) => {
  const statsSource = allData || data;
  const valueColumns = columns.filter((c) => !isGapColumn(c));

  const averages = valueColumns.map((col) => ({ label: col, avg: average(statsSource, col) }));

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2.5, border: "1px solid #E4E7F0", borderTop: `4px solid ${color}` }} elevation={0}>
      <CardContent>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: colors.ink, mb: 2 }}>
          {icon} {title}
        </Typography>

        {/* State-level average summary — always from the full district set */}
        <Grid container spacing={2} mb={2}>
          {averages.map((a, i) => (
            <Grid size={{ xs: 6, sm: 4, md: Math.max(2, Math.floor(12 / averages.length)) }} key={i}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f4f7fc",
                  textAlign: "center",
                  borderTop: `4px solid ${color}`,
                  height: "100%",
                }}
              >
                <Typography fontSize={12} color="text.secondary" noWrap>
                  {a.label}
                </Typography>
                <Typography sx={{ fontFamily: fontMono, fontWeight: 700, fontSize: 22, color }}>
                  {(a.avg * 100).toFixed(1)}%
                </Typography>
                <Typography fontSize={11} color="text.secondary">
                  Gujarat Average
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 420, border: "1px solid #E4E7F0", borderRadius: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", bgcolor: colors.navy, color: "#fff", fontFamily: fontMono, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  District
                </TableCell>

                {columns.map((col) => (
                  <TableCell
                    key={col}
                    align="center"
                    sx={{ fontWeight: "bold", bgcolor: colors.navy, color: "#fff", fontFamily: fontMono, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, i) => (
                <TableRow
                  key={row.District}
                  hover
                  sx={{
                    bgcolor: isPriorityDistrict(row.District) ? "#FFFBEB" : i % 2 === 1 ? "#FAFBFD" : "#fff",
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.District}
                    <PriorityChip district={row.District} />
                  </TableCell>

                  {columns.map((col) => {
                    const val = row[col] ?? 0;
                    const gap = isGapColumn(col);
                    const pct = val * 100;

                    return (
                      <TableCell key={col} align="center">
                        {gap ? (
                          <Chip
                            label={`${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}%`}
                            size="small"
                            sx={{
                              bgcolor: pct < 0 ? "#FDEAEA" : "#E6F4EA",
                              color: pct < 0 ? "#B71C1C" : "#1B5E20",
                              fontFamily: fontMono,
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          />
                        ) : (
                          <PillCell pct={pct} />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>

            <TableFooter>
              <TableRow sx={{ bgcolor: "#EFF3FB", "& td": { borderTop: `2px solid ${colors.navy}` } }}>
                <TableCell sx={{ fontWeight: 800, color: colors.navy, fontFamily: fontMono, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  ⭐ State Average
                </TableCell>
                {columns.map((col) => {
                  const gap = isGapColumn(col);
                  const avgPct = average(statsSource, col) * 100;

                  return (
                    <TableCell key={col} align="center">
                      {gap ? (
                        <Chip
                          label={`${avgPct >= 0 ? "▲" : "▼"} ${Math.abs(avgPct).toFixed(1)}%`}
                          size="small"
                          sx={{
                            bgcolor: avgPct < 0 ? "#FDEAEA" : "#E6F4EA",
                            color: avgPct < 0 ? "#B71C1C" : "#1B5E20",
                            fontFamily: fontMono,
                            fontWeight: 800,
                            fontSize: 12,
                          }}
                        />
                      ) : (
                        <PillCell pct={avgPct} bold />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ComparisonSection;
