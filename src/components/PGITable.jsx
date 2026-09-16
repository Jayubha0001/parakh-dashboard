import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
} from "@mui/material";
import { gradeColor } from "./PGIHeader";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

const avg = (values) => {
  const nums = values.filter((v) => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

// State Average is always computed from the FULL (unfiltered) ranking —
// picking one district in the filter narrows which row(s) the table
// shows, but the summary line underneath should still read "how does
// Gujarat as a whole compare", not "average of the one row left on screen".
// Same logic as the SAT semester-comparison table, so both pages behave
// the same way when a district is selected.
const buildStateAverageRow = (allRows, allRows2526) => ({
  District: "⭐ State Average",
  Score: allRows?.length ? avg(allRows.map((d) => d.Score)) : null,
  PercentAchieved: allRows?.length ? avg(allRows.map((d) => d.PercentAchieved)) : null,
  Score2526: allRows2526?.length ? avg(allRows2526.map((d) => d.Score)) : null,
  PercentAchieved2526: allRows2526?.length ? avg(allRows2526.map((d) => d.PercentAchieved)) : null,
  isStateAverage: true,
});

// `data`/`allData` are the 2024-25 PGI-D ranking (filtered / full). Passing
// `data2526`/`allData2526` — the same shape for 2025-26 — adds a second
// Score/%/Grade column per year instead of the table only ever being able
// to show whichever year happened to be wired up.
const PGITable = ({ data = [], allData = null, data2526 = [], allData2526 = null }) => {
  const has2526 = Array.isArray(data2526) && data2526.length > 0;
  const map2526 = Object.fromEntries((data2526 || []).map((d) => [d.District, d]));
  const stateAverageRow = (allData?.length || allData2526?.length)
    ? buildStateAverageRow(allData || data, allData2526)
    : null;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 2.5 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📋 District-wise PGI-D 2.0 Ranking (out of 600){has2526 ? " — 2024-25 vs 2025-26" : ""}
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6A1B9A" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Score (/600) {has2526 ? "· 24-25" : ""}
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  % Achieved {has2526 ? "· 24-25" : ""}
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Grade {has2526 ? "· 24-25" : ""}
                </TableCell>
                {has2526 && (
                  <>
                    <TableCell align="center" sx={{ color: "white", fontWeight: "bold", borderLeft: "1px solid rgba(255,255,255,0.3)" }}>
                      Score (/600) · 25-26
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                      % Achieved · 25-26
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                      Grade · 25-26
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, index) => {
                const row2526 = map2526[row.District];
                return (
                  <TableRow
                    key={row.District}
                    hover
                    sx={isPriorityDistrict(row.District) ? { bgcolor: "#FFFBEB" } : undefined}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {row.District}
                      <PriorityChip district={row.District} />
                    </TableCell>
                    <TableCell align="center">{row.Score.toFixed(2)}</TableCell>
                    <TableCell align="center">{row.PercentAchieved.toFixed(1)}%</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.Grade}
                        size="small"
                        sx={{
                          bgcolor: gradeColor(row.Grade),
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    {has2526 && (
                      <>
                        <TableCell align="center" sx={{ borderLeft: "1px solid #EEE" }}>
                          {row2526 ? row2526.Score.toFixed(2) : "—"}
                        </TableCell>
                        <TableCell align="center">
                          {row2526 ? `${row2526.PercentAchieved.toFixed(1)}%` : "—"}
                        </TableCell>
                        <TableCell align="center">
                          {row2526 ? (
                            <Chip
                              label={row2526.Grade}
                              size="small"
                              sx={{
                                bgcolor: gradeColor(row2526.Grade),
                                color: "#fff",
                                fontWeight: "bold",
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}

              {stateAverageRow && (
                <TableRow key="state-average" sx={{ bgcolor: "#EFF3FB", borderTop: "2px solid #6A1B9A" }}>
                  <TableCell sx={{ fontWeight: 800, color: "#16233B" }}>—</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#16233B" }}>{stateAverageRow.District}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: "#16233B" }}>
                    {stateAverageRow.Score == null ? "—" : stateAverageRow.Score.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: "#16233B" }}>
                    {stateAverageRow.PercentAchieved == null ? "—" : `${stateAverageRow.PercentAchieved.toFixed(1)}%`}
                  </TableCell>
                  <TableCell align="center">—</TableCell>
                  {has2526 && (
                    <>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#16233B", borderLeft: "1px solid #D8DCE6" }}>
                        {stateAverageRow.Score2526 == null ? "—" : stateAverageRow.Score2526.toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "#16233B" }}>
                        {stateAverageRow.PercentAchieved2526 == null ? "—" : `${stateAverageRow.PercentAchieved2526.toFixed(1)}%`}
                      </TableCell>
                      <TableCell align="center">—</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PGITable;
