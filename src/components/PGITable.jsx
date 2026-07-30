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
const buildStateAverageRow = (allRows) => {
  if (!allRows?.length) return null;

  return {
    District: "⭐ State Average",
    Score: avg(allRows.map((d) => d.Score)),
    PercentAchieved: avg(allRows.map((d) => d.PercentAchieved)),
    isStateAverage: true,
  };
};

const PGITable = ({ data = [], allData = null }) => {
  const stateAverageRow = buildStateAverageRow(allData || data);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📋 District-wise PGI-D 2.0 Ranking (out of 600)
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6A1B9A" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Score (/600)
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  % Achieved
                </TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Grade
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, index) => (
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
                </TableRow>
              ))}

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
