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
              {names.map((n) => (
                <MenuItem key={n} value={n}>
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
              {names.map((n) => (
                <MenuItem key={n} value={n}>
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
                    <DetailTable colHeadA={districtA} colHeadB={districtB}>
                      {pgiHeatmap.categories.map((cat) => (
                        <DetailRow key={cat} label={cat} a={pgiA[cat]} b={pgiB[cat]} unit="" />
                      ))}
                    </DetailTable>
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
                    <DetailTable colHeadA={districtA} colHeadB={districtB}>
                      {/* Dashboard_PARAKH stores these as 0-1 fractions (e.g. 0.6 =
                          60%), same as every other PARAKH reader in this app — multiply
                          by 100 here too, or these rows print "0.6%" instead of "60.0%". */}
                      <DetailRow label="Foundational (Grade 3)" a={parakhA.Foundational * 100} b={parakhB.Foundational * 100} />
                      <DetailRow label="Preparatory (Grade 6)" a={parakhA.Preparatory * 100} b={parakhB.Preparatory * 100} />
                      <DetailRow label="Middle (Grade 9)" a={parakhA.Middle * 100} b={parakhB.Middle * 100} />
                      <DetailRow label="Overall" a={parakhA.Overall * 100} b={parakhB.Overall * 100} />
                    </DetailTable>
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
                    <DetailTable colHeadA={districtA} colHeadB={districtB}>
                      {satGradeSem1.grades.map((g) => (
                        <DetailRow key={`s1-${g}`} label={g} a={sat1A[g]} b={sat1B[g]} />
                      ))}
                    </DetailTable>
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>No SAT Sem 1 grade-wise data for one of these districts.</Typography>
                  )}

                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mt: 2, mb: 1 }}>Semester 2</Typography>
                  {sat2A && sat2B ? (
                    <DetailTable colHeadA={districtA} colHeadB={districtB}>
                      {satGradeSem2.grades.map((g) => (
                        <DetailRow key={`s2-${g}`} label={g} a={sat2A[g]} b={sat2B[g]} />
                      ))}
                    </DetailTable>
                  ) : (
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No SAT Sem 2 grade-wise data for one of these districts.</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
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