import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { bandColor } from "./CombinedBandSummary";

// One row per indicator: label, accessor, and which sheet/period it comes
// from. There's no weekly breakdown in the source data (PGI-D is one
// annual round, PARAKH one cycle, SAT one semester) so the source chip is
// what tells the reader "where/when this number is from".
const INDICATOR_ROWS = [
  { key: "PGIDScore", label: "PGI-D Score", unit: "%", source: (s) => s.pgid, higherIsBetter: true },
  { key: "PARAKHScore", label: "PARAKH Overall Mastery", unit: "%", source: (s) => s.parakh, higherIsBetter: true },
  { key: "SATSem1Score", label: "SAT Performance — Semester 1", unit: "%", source: (s) => s.satSem1, higherIsBetter: true },
  { key: "SATSem2Score", label: "SAT Performance — Semester 2", unit: "%", source: (s) => s.satSem2, higherIsBetter: true },
  { key: "CompositeWithSAT", label: "Composite (PGI-D + PARAKH + SAT avg)", unit: "%", source: () => "Calculated — equal weights", higherIsBetter: true },
  { key: "RankWithSAT", label: "Overall Rank (out of 33)", unit: "", source: () => "Calculated", higherIsBetter: false },
];

const fmt = (v, unit) => (v === null || v === undefined ? "—" : `${Number(v).toFixed(1)}${unit}`);

// A small reusable "district A vs district B" row for the detail
// accordions below — same winner-highlighting behaviour as the main table.
const DetailRow = ({ label, a, b, unit = "%" }) => {
  const winner = a == null || b == null || a === b ? null : a > b ? "A" : "B";
  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 500 }}>{label}</TableCell>
      <TableCell
        align="center"
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: winner === "A" ? 700 : 400,
          color: winner === "A" ? "#2E7D32" : "inherit",
        }}
      >
        {fmt(a, unit)}
        {winner === "A" && <EmojiEventsIcon sx={{ fontSize: 13, ml: 0.5, verticalAlign: "middle" }} />}
      </TableCell>
      <TableCell
        align="center"
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: winner === "B" ? 700 : 400,
          color: winner === "B" ? "#2E7D32" : "inherit",
        }}
      >
        {fmt(b, unit)}
        {winner === "B" && <EmojiEventsIcon sx={{ fontSize: 13, ml: 0.5, verticalAlign: "middle" }} />}
      </TableCell>
    </TableRow>
  );
};

// The chart half of each detail box: same rows as the table next to it,
// drawn as a grouped bar chart so the gap between the two districts is
// visible at a glance instead of only readable from numbers in a table.
// Standing (vertical) columns, not lying-down bars — matches every other
// chart in the app.
const DetailChart = ({ rows, colHeadA, colHeadB }) => {
  const chartData = rows.map((r) => ({
    name: r.label,
    [colHeadA]: r.a == null ? null : Number(r.a.toFixed(1)),
    [colHeadB]: r.b == null ? null : Number(r.b.toFixed(1)),
  }));

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: rows.length > 4 ? 70 : 30 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={rows.length > 4 ? -30 : 0}
            textAnchor={rows.length > 4 ? "end" : "middle"}
            interval={0}
          />
          <YAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <RechartsTooltip formatter={(value) => (value == null ? "No data" : `${value}%`)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={colHeadA} fill="#1E3A8A" radius={[3, 3, 0, 0]} barSize={rows.length > 6 ? 14 : 22} />
          <Bar dataKey={colHeadB} fill="#F0B429" radius={[3, 3, 0, 0]} barSize={rows.length > 6 ? 14 : 22} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const DetailTable = ({ colHeadA, colHeadB, children }) => (
  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E4E7F0" }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Indicator</TableCell>
          <TableCell align="center" sx={{ fontWeight: 700 }}>{colHeadA}</TableCell>
          <TableCell align="center" sx={{ fontWeight: 700 }}>{colHeadB}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  </TableContainer>
);

const DistrictCompareView = ({
  districts = [],
  districtA,
  districtB,
  onChangeDistrictA,
  onChangeDistrictB,
  pgiHeatmap = { categories: [], data: [] },
  parakhGradeWise = [],
  satGradeSem1 = { grades: [], data: [] },
  satGradeSem2 = { grades: [], data: [] },
}) => {
  const names = districts.map((d) => d.District);

  const rowA = districts.find((d) => d.District === districtA);
  const rowB = districts.find((d) => d.District === districtB);
  const sources = districts[0]?.sources || {};

  const better = (indicator, a, b) => {
    if (a == null || b == null || a === b) return null;
    if (indicator.higherIsBetter) return a > b ? "A" : "B";
    return a < b ? "A" : "B"; // lower rank number wins
  };

  const pgiA = pgiHeatmap.data.find((d) => d.District === districtA);
  const pgiB = pgiHeatmap.data.find((d) => d.District === districtB);

  const parakhA = parakhGradeWise.find((d) => d.District === districtA);
  const parakhB = parakhGradeWise.find((d) => d.District === districtB);

  const sat1A = satGradeSem1.data.find((d) => d.District === districtA);
  const sat1B = satGradeSem1.data.find((d) => d.District === districtB);
  const sat2A = satGradeSem2.data.find((d) => d.District === districtA);
  const sat2B = satGradeSem2.data.find((d) => d.District === districtB);

  // One combined "weak spots" list across all three detail boxes above —
  // same treatment as the Reports page's Weakest Indicators list, just
  // scoped to whichever two districts are being compared here. A row
  // counts as weak if EITHER district is under 45% on it.
  const weakCompareRows = [];
  if (pgiA && pgiB) {
    pgiHeatmap.categories.forEach((cat) => {
      const a = pgiA[cat];
      const b = pgiB[cat];
      if ((a != null && a < 45) || (b != null && b < 45)) {
        weakCompareRows.push({ section: "PGI-D 2.0", label: cat, a, b });
      }
    });
  }
  if (parakhA && parakhB) {
    [
      { label: "Foundational (Grade 3)", a: parakhA.Foundational * 100, b: parakhB.Foundational * 100 },
      { label: "Preparatory (Grade 6)", a: parakhA.Preparatory * 100, b: parakhB.Preparatory * 100 },
      { label: "Middle (Grade 9)", a: parakhA.Middle * 100, b: parakhB.Middle * 100 },
    ].forEach((r) => {
      if (r.a < 45 || r.b < 45) weakCompareRows.push({ section: "PARAKH", ...r });
    });
  }
  if (sat1A && sat1B) {
    satGradeSem1.grades.forEach((g) => {
      const a = sat1A[g];
      const b = sat1B[g];
      if ((a != null && a < 45) || (b != null && b < 45)) {
        weakCompareRows.push({ section: "SAT — Sem 1", label: g, a, b });
      }
    });
  }
  if (sat2A && sat2B) {
    satGradeSem2.grades.forEach((g) => {
      const a = sat2A[g];
      const b = sat2B[g];
      if ((a != null && a < 45) || (b != null && b < 45)) {
        weakCompareRows.push({ section: "SAT — Sem 2", label: g, a, b });
      }
    });
  }
  weakCompareRows.sort(
    (r1, r2) => Math.min(r1.a ?? 999, r1.b ?? 999) - Math.min(r2.a ?? 999, r2.b ?? 999)
  );

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
      <CardContent>
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            fontSize: 18,
            mb: 2,
            color: "#16233B",
          }}
        >
          Compare Two Districts — Indicator by Indicator
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="District A"
              value={districtA}
              onChange={(e) => onChangeDistrictA(e.target.value)}
            >
              <MenuItem value="">
                <em>Select a district…</em>
              </MenuItem>
              {names.map((n) => (
                <MenuItem key={n} value={n} disabled={n === districtB}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="District B"
              value={districtB}
              onChange={(e) => onChangeDistrictB(e.target.value)}
            >
              <MenuItem value="">
                <em>Select a district…</em>
              </MenuItem>
              {names.map((n) => (
                <MenuItem key={n} value={n} disabled={n === districtA}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {rowA && rowB && (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E4E7F0" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Indicator</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>
                      {districtA}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>
                      {districtB}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Data Source / Period</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {INDICATOR_ROWS.map((row) => {
                    const a = rowA[row.key];
                    const b = rowB[row.key];
                    const winner = better(row, a, b);
                    return (
                      <TableRow key={row.key} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{row.label}</TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontWeight: winner === "A" ? 700 : 400,
                            color: winner === "A" ? "#2E7D32" : "inherit",
                          }}
                        >
                          {row.unit ? fmt(a, row.unit) : a ?? "—"}
                          {winner === "A" && <EmojiEventsIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }} />}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontWeight: winner === "B" ? 700 : 400,
                            color: winner === "B" ? "#2E7D32" : "inherit",
                          }}
                        >
                          {row.unit ? fmt(b, row.unit) : b ?? "—"}
                          {winner === "B" && <EmojiEventsIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }} />}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Source workbook / period this indicator's number is drawn from" arrow>
                            <Chip label={row.source(sources)} size="small" sx={{ bgcolor: "#EEF2FF", color: "#3730A3" }} />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Performance Band</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={rowA.BandWithSAT}
                        size="small"
                        sx={{ bgcolor: bandColor(rowA.BandWithSAT), color: "#fff", fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={rowB.BandWithSAT}
                        size="small"
                        sx={{ bgcolor: bandColor(rowB.BandWithSAT), color: "#fff", fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label="Calculated from all 3 above" size="small" sx={{ bgcolor: "#EEF2FF", color: "#3730A3" }} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* ---- Detail reports: PGI-D category-wise, PARAKH grade-wise, SAT grade-wise ---- */}
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#16233B", mb: 1 }}>
                Detailed Reports — {districtA} vs {districtB}
              </Typography>

              <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", "&:before": { display: "none" }, mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    🏛️ PGI-D 2.0 — Category-wise Detail{" "}
                    <Chip label="PGI-D 2.0 (annual round)" size="small" sx={{ ml: 1, bgcolor: "#EEF2FF", color: "#3730A3" }} />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {pgiA && pgiB ? (
                    (() => {
                      const rows = pgiHeatmap.categories.map((cat) => ({ label: cat, a: pgiA[cat], b: pgiB[cat] }));
                      return (
                        <>
                          <DetailChart rows={rows} colHeadA={districtA} colHeadB={districtB} />
                          <Box sx={{ mt: 2 }}>
                            <DetailTable colHeadA={districtA} colHeadB={districtB}>
                              {rows.map((r) => (
                                <DetailRow key={r.label} label={r.label} a={r.a} b={r.b} unit="" />
                              ))}
                            </DetailTable>
                          </Box>
                        </>
                      );
                    })()
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No PGI-D category data for one of these districts.</Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", "&:before": { display: "none" }, mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    📘 PARAKH — Grade-wise Detail{" "}
                    <Chip label="PARAKH Survey (latest cycle)" size="small" sx={{ ml: 1, bgcolor: "#EEF2FF", color: "#3730A3" }} />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {parakhA && parakhB ? (
                    (() => {
                      // Dashboard_PARAKH stores these as 0-1 fractions (e.g. 0.6 =
                      // 60%), same as every other PARAKH reader in this app —
                      // multiply by 100 here too, or these print "0.6%" instead
                      // of "60.0%".
                      const rows = [
                        { label: "Foundational (Grade 3)", a: parakhA.Foundational * 100, b: parakhB.Foundational * 100 },
                        { label: "Preparatory (Grade 6)", a: parakhA.Preparatory * 100, b: parakhB.Preparatory * 100 },
                        { label: "Middle (Grade 9)", a: parakhA.Middle * 100, b: parakhB.Middle * 100 },
                        { label: "Overall", a: parakhA.Overall * 100, b: parakhB.Overall * 100 },
                      ];
                      return (
                        <>
                          <DetailChart rows={rows} colHeadA={districtA} colHeadB={districtB} />
                          <Box sx={{ mt: 2 }}>
                            <DetailTable colHeadA={districtA} colHeadB={districtB}>
                              {rows.map((r) => (
                                <DetailRow key={r.label} label={r.label} a={r.a} b={r.b} />
                              ))}
                            </DetailTable>
                          </Box>
                        </>
                      );
                    })()
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No PARAKH grade-wise data for one of these districts.</Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    📝 SAT — Grade-wise Detail{" "}
                    <Chip label="SAT — Semester 1 & 2" size="small" sx={{ ml: 1, bgcolor: "#EEF2FF", color: "#3730A3" }} />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>Semester 1</Typography>
                  {sat1A && sat1B ? (
                    (() => {
                      const rows = satGradeSem1.grades.map((g) => ({ label: g, a: sat1A[g], b: sat1B[g] }));
                      return (
                        <>
                          <DetailChart rows={rows} colHeadA={districtA} colHeadB={districtB} />
                          <Box sx={{ mt: 2 }}>
                            <DetailTable colHeadA={districtA} colHeadB={districtB}>
                              {rows.map((r) => (
                                <DetailRow key={`s1-${r.label}`} label={r.label} a={r.a} b={r.b} />
                              ))}
                            </DetailTable>
                          </Box>
                        </>
                      );
                    })()
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>No SAT Sem 1 grade-wise data for one of these districts.</Typography>
                  )}

                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mt: 3, mb: 1 }}>Semester 2</Typography>
                  {sat2A && sat2B ? (
                    (() => {
                      const rows = satGradeSem2.grades.map((g) => ({ label: g, a: sat2A[g], b: sat2B[g] }));
                      return (
                        <>
                          <DetailChart rows={rows} colHeadA={districtA} colHeadB={districtB} />
                          <Box sx={{ mt: 2 }}>
                            <DetailTable colHeadA={districtA} colHeadB={districtB}>
                              {rows.map((r) => (
                                <DetailRow key={`s2-${r.label}`} label={r.label} a={r.a} b={r.b} />
                              ))}
                            </DetailTable>
                          </Box>
                        </>
                      );
                    })()
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No SAT Sem 2 grade-wise data for one of these districts.</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>

            {weakCompareRows.length > 0 && (
              <Box sx={{ mt: 3, p: 2.5, borderRadius: 2, bgcolor: "#FFFBEF", border: "1px dashed #F0B429" }}>
                <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16, color: "#16233B", mb: 0.5 }}>
                  🎯 Action Points — Weakest Indicators ({weakCompareRows.length})
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
                  Every indicator below is under 45% for {districtA}, {districtB}, or both — pulled together from
                  the PGI-D, PARAKH, and SAT sections above, weakest first.
                </Typography>

                <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                  {weakCompareRows.map((row, i) => (
                    <Box component="li" key={i} sx={{ mb: 1.2 }}>
                      <Typography sx={{ fontSize: 13.5, color: "#16233B" }}>
                        <strong>{row.label}</strong>{" "}
                        <span style={{ color: "#5B6B85", fontSize: 12 }}>({row.section})</span> —{" "}
                        {districtA}:{" "}
                        <span
                          style={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontWeight: 700,
                            color: row.a != null && row.a < 45 ? "#B71C1C" : "#16233B",
                          }}
                        >
                          {row.a != null ? `${row.a.toFixed(1)}%` : "—"}
                        </span>
                        {" · "}
                        {districtB}:{" "}
                        <span
                          style={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontWeight: 700,
                            color: row.b != null && row.b < 45 ? "#B71C1C" : "#16233B",
                          }}
                        >
                          {row.b != null ? `${row.b.toFixed(1)}%` : "—"}
                        </span>
                        .
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}

        {!(rowA && rowB) && (
          <Box
            sx={{
              mt: 1,
              p: 3,
              textAlign: "center",
              border: "1px dashed #C9CFDD",
              borderRadius: 2,
              color: "text.secondary",
              fontSize: 13,
            }}
          >
            Pick District A and District B above to see the indicator-by-indicator comparison, charts, and detailed
            reports.
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Note: the source workbook doesn't track week-by-week data — PGI-D is one annual round, PARAKH one
            assessment cycle, and SAT is tracked per semester (Sem 1 and Sem 2 shown separately above; the
            Composite row averages both). Every chip above shows exactly which sheet/period that row's number
            comes from. District A and District B above drive the ranking chart, table, and action items
            further down this page too — pick your two districts here and the rest of the page narrows to
            just those two.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DistrictCompareView;