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
import { gradeColor } from "./PGIHeader";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

const PGITable = ({ data = [] }) => {
  const [search, setSearch] = useState("");

  const filteredRows = data.filter((row) =>
    row.District.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📋 District-wise PGI-D 2.0 Ranking (out of 600)
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
              {filteredRows.map((row, index) => (
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
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default PGITable;
