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
  Chip,
  Tooltip,
} from "@mui/material";
import { bandColor } from "./CombinedBandSummary";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

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
          Combined PGI-D + PARAKH + SAT Ranking — All 33 Districts
        </Typography>

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
                  SAT % (Sem1+2 avg)
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
              {data.map((row) => (
                <TableRow
                  key={row.District}
                  hover
                  sx={isPriorityDistrict(row.District) ? { bgcolor: "#FFFBEB" } : undefined}
                >
                  <TableCell>
                    <RankBadge rank={row.RankWithSAT ?? row.Rank} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.District}
                    <PriorityChip district={row.District} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {row.PGIDScore.toFixed(1)}%
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {row.PARAKHScore.toFixed(1)}%
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {row.SATScore != null ? `${row.SATScore.toFixed(1)}%` : "—"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                  >
                    {(row.CompositeWithSAT ?? row.CompositeScore).toFixed(1)}%
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={row.PriorityNote || ""} arrow>
                      <Chip
                        label={row.BandWithSAT ?? row.Band}
                        size="small"
                        sx={{
                          bgcolor: bandColor(row.BandWithSAT ?? row.Band),
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
