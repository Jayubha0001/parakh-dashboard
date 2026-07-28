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
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";

const isGapColumn = (col) => col.toLowerCase().includes("gap");

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
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          sx={{ color: "#1E3A8A" }}
        >
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
                <Typography variant="h5" fontWeight="bold" sx={{ color }}>
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", bgcolor: color, color: "#fff" }}>
                  District
                </TableCell>

                {columns.map((col) => (
                  <TableCell
                    key={col}
                    align="center"
                    sx={{ fontWeight: "bold", bgcolor: color, color: "#fff" }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.District} hover>
                  <TableCell>{row.District}</TableCell>

                  {columns.map((col) => {
                    const val = row[col] ?? 0;
                    const gap = isGapColumn(col);

                    return (
                      <TableCell
                        key={col}
                        align="center"
                        sx={{
                          color: gap ? (val < 0 ? "#D32F2F" : "#2E7D32") : "inherit",
                          fontWeight: gap ? "bold" : "normal",
                        }}
                      >
                        {(val * 100).toFixed(1)}%
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ComparisonSection;
