import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
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
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

const satGradeColor = (pct) => {
  if (pct >= 60) return "#2E7D32";
  if (pct >= 45) return "#FB8C00";
  return "#D32F2F";
};

const SATTable = ({ data = [] }) => {
  const [search, setSearch] = useState("");

  const filteredRows = data.filter((row) =>
    row.District.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📝 District-wise SAT Ranking
        </Typography>

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

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6A1B9A" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  % Achieved
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.District}
                  hover
                  sx={isPriorityDistrict(row.District) ? { bgcolor: "#FFFBEB" } : undefined}
                >
                  <TableCell>{row.Rank}</TableCell>
                  <TableCell>
                    {row.District}
                    <PriorityChip district={row.District} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row.PercentAchieved.toFixed(1)}%`}
                      size="small"
                      sx={{
                        bgcolor: satGradeColor(row.PercentAchieved),
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SATTable;
