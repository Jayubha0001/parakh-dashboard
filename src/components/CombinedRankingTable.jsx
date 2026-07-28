import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Card,
  CardContent,
  Typography,
  Box,
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
  Tooltip,
} from "@mui/material";
import { bandColor } from "./CombinedBandSummary";

const medalColor = (rank) => {
  if (rank === 1) return "#F0B429";
  if (rank === 2) return "#9AA5B1";
  if (rank === 3) return "#B08D57";
  return null;
};

const RankBadge = ({ rank }) => {
  const medal = medalColor(rank);
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"IBM Plex Mono", monospace',
        fontWeight: 700,
        fontSize: 12.5,
        bgcolor: medal || "#F1F3F8",
        color: medal ? "#fff" : "#5B6B85",
        border: medal ? "none" : "1px solid #E4E7F0",
      }}
    >
      {rank}
    </Box>
  );
};

const CombinedRankingTable = ({ data = [] }) => {
  const [search, setSearch] = useState("");

  const filteredRows = data.filter((row) =>
    row.District.toLowerCase().includes(search.toLowerCase())
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
          Combined PGI-D + PARAKH Ranking — All 33 Districts
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search District..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 500, border: "1px solid #E4E7F0" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>District</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>
                  PGI-D %
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>
                  PARAKH %
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>
                  Composite %
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>
                  Band
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.District} hover>
                  <TableCell>
                    <RankBadge rank={row.Rank} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.District}</TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {row.PGIDScore.toFixed(1)}%
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {row.PARAKHScore.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                  >
                    {row.CompositeScore.toFixed(1)}%
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={row.PriorityNote || ""} arrow>
                      <Chip
                        label={row.Band}
                        size="small"
                        sx={{
                          bgcolor: bandColor(row.Band),
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      />
                    </Tooltip>
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

export default CombinedRankingTable;
