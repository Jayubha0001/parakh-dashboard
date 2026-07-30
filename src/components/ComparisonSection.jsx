import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
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
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";

import { colors, fontDisplay, fontMono } from "../theme/theme";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

const isGapColumn = (col) => col.toLowerCase().includes("gap");

// Same three-band read as every other heat-map cell in the app, applied
// here to whichever percentage column this card is showing (Boys/Girls,
// Rural/Urban, etc.) — so a "55%" always means the same thing everywhere.
const bandFor = (pct) =>
  pct >= 60
    ? { bg: "#E6F4EA", bar: "#2E7D32" }
    : pct >= 45
    ? { bg: "#FFF3E0", bar: "#FB8C00" }
    : { bg: "#FDEAEA", bar: "#D32F2F" };

const PillCell = ({ pct }) => {
  const band = bandFor(pct);
  return (
    <Box sx={{ position: "relative", borderRadius: 1.5, bgcolor: band.bg, overflow: "hidden", height: 22, minWidth: 76 }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${Math.min(100, Math.max(0, pct))}%`, bgcolor: band.bar }} />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          fontFamily: fontMono,
          fontWeight: 700,
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

const ComparisonSection = ({
  title,
  icon = "📊",
  columns = [],
  data = [],
  color = "#1976D2",
}) => {
  const [search, setSearch] = useState("");

  const valueColumns = columns.filter((c) => !isGapColumn(c));

  const averages = valueColumns.map((col) => {
    const vals = data.map((d) => d[col]).filter((v) => !isNaN(v));
    const avg =
      vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : 0;
    return { label: col, avg };
  });

  const filteredRows = data.filter((row) =>
    (row.District || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0", borderTop: `4px solid ${color}` }} elevation={0}>
      <CardContent>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: colors.ink, mb: 2 }}>
          {icon} {title}
        </Typography>

        {/* State-level average summary */}
        <Grid container spacing={2} mb={3}>
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

        <TextField
          fullWidth
          size="small"
          placeholder="Search District..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />

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
              {filteredRows.map((row, i) => (
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
                  const vals = data.map((d) => d[col]).filter((v) => !isNaN(v));
                  const avgPct = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) * 100 : 0;

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
                        <PillCell pct={avgPct} />
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
