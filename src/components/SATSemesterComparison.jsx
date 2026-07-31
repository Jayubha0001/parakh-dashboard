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
  Box,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const pctColor = (pct) => {
  if (pct == null) return "#9AA5B1";
  if (pct >= 60) return "#2E7D32";
  if (pct >= 45) return "#FB8C00";
  return "#D32F2F";
};

const fmt = (pct) => (pct == null ? "—" : `${pct.toFixed(1)}%`);

const avg = (values) => {
  const nums = values.filter((v) => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

// State Average is always computed from the FULL (unfiltered) dataset —
// picking one district in the filter narrows which row(s) the table
// shows, but the summary line underneath should still read "how does
// Gujarat as a whole compare", not "average of the one row left on screen".
const buildStateAverageRow = (allRows) => {
  if (!allRows.length) return null;

  const sem1Pct = avg(allRows.map((d) => d.Sem1Pct));
  const sem2Pct = avg(allRows.map((d) => d.Sem2Pct));
  const totalPct = avg(allRows.map((d) => d.TotalPct));
  const changes = allRows.map((d) => d.Change).filter((v) => typeof v === "number");

  return {
    District: "⭐ State Average",
    Rank: "—",
    Sem1Pct: sem1Pct,
    Sem2Pct: sem2Pct,
    TotalPct: totalPct,
    Change: changes.length ? changes.reduce((a, b) => a + b, 0) / changes.length : null,
    isStateAverage: true,
  };
};

const SATSemesterComparison = ({ data = [], district = "All" }) => {
  const rows = district !== "All" ? data.filter((d) => d.District === district) : data;
  const stateAverageRow = buildStateAverageRow(data);

  const chartRows = district !== "All" && stateAverageRow ? [...rows, stateAverageRow] : rows;

  const chartData = chartRows.map((d) => ({
    District: d.District,
    "Sem 1": d.Sem1Pct != null ? Number(d.Sem1Pct.toFixed(1)) : null,
    "Sem 2": d.Sem2Pct != null ? Number(d.Sem2Pct.toFixed(1)) : null,
  }));

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={0.5}>
          📆 Semester 1 vs Semester 2 — SAT Comparison
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
          {district !== "All"
            ? `${district} · both semesters, plus the combined total`
            : "District-wise, both semesters, plus the combined total"}
        </Typography>

        <ResponsiveContainer width="100%" height={district !== "All" ? 200 : 420}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: district !== "All" ? 10 : 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="District"
              angle={district !== "All" ? 0 : -45}
              textAnchor={district !== "All" ? "middle" : "end"}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => (value == null ? "—" : `${value}%`)} />
            <Legend />
            <Bar dataKey="Sem 1" fill="#9AA5B1" radius={[4, 4, 0, 0]} barSize={district !== "All" ? 60 : 14} />
            <Bar dataKey="Sem 2" fill="#6A1B9A" radius={[4, 4, 0, 0]} barSize={district !== "All" ? 60 : 14} />
          </BarChart>
        </ResponsiveContainer>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6A1B9A" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Sem 1 %</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Sem 2 %</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Change</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Total %</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.District} hover>
                  <TableCell>{row.Rank}</TableCell>
                  <TableCell>{row.District}</TableCell>

                  <TableCell align="center">
                    <Chip
                      label={fmt(row.Sem1Pct)}
                      size="small"
                      sx={{ bgcolor: pctColor(row.Sem1Pct), color: "#fff", fontWeight: "bold" }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={fmt(row.Sem2Pct)}
                      size="small"
                      sx={{ bgcolor: pctColor(row.Sem2Pct), color: "#fff", fontWeight: "bold" }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {row.Change == null ? (
                      "—"
                    ) : (
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 700,
                          color: row.Change >= 0 ? "success.main" : "error.main",
                        }}
                      >
                        {row.Change >= 0 ? "▲" : "▼"} {Math.abs(row.Change).toFixed(1)} pts
                      </Box>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={fmt(row.TotalPct)}
                      size="small"
                      sx={{ bgcolor: "#16233B", color: "#fff", fontWeight: "bold" }}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {stateAverageRow && (
                <TableRow
                  key="state-average"
                  sx={{ bgcolor: "#EFF3FB", borderTop: "2px solid #6A1B9A" }}
                >
                  <TableCell sx={{ fontWeight: 800, color: "#16233B" }}>{stateAverageRow.Rank}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#16233B" }}>{stateAverageRow.District}</TableCell>

                  <TableCell align="center">
                    <Chip
                      label={fmt(stateAverageRow.Sem1Pct)}
                      size="small"
                      sx={{ bgcolor: pctColor(stateAverageRow.Sem1Pct), color: "#fff", fontWeight: "bold" }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={fmt(stateAverageRow.Sem2Pct)}
                      size="small"
                      sx={{ bgcolor: pctColor(stateAverageRow.Sem2Pct), color: "#fff", fontWeight: "bold" }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {stateAverageRow.Change == null ? (
                      "—"
                    ) : (
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 700,
                          color: stateAverageRow.Change >= 0 ? "success.main" : "error.main",
                        }}
                      >
                        {stateAverageRow.Change >= 0 ? "▲" : "▼"} {Math.abs(stateAverageRow.Change).toFixed(1)} pts
                      </Box>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={fmt(stateAverageRow.TotalPct)}
                      size="small"
                      sx={{ bgcolor: "#16233B", color: "#fff", fontWeight: "bold" }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SATSemesterComparison;
