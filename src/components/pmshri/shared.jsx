import { useMemo, useState } from "react";
import {
  Box,
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
  Grid,
  Chip,
  TextField,
  MenuItem,
  TablePagination,
} from "@mui/material";

// -----------------------------------------------------------------
// Shared building blocks for the GOI / GOG analysis panels added to
// the PM Shri page. Reusing these keeps every new table/card visually
// identical to the existing PM Shri sections (dark header tables,
// Fraunces headings, IBM Plex Mono numerics) instead of drifting into
// a different look per sheet.
// -----------------------------------------------------------------

export const fmt = (v) => {
  if (v === null || v === undefined || v === "" || v === "—") return "—";
  if (typeof v === "number") {
    // Values under 1 that aren't whole numbers are stored as raw
    // fractions (e.g. 0.0123 for 1.23%) in a couple of the source
    // sheets' change columns — render those as percentages.
    if (Math.abs(v) < 1 && v !== 0 && !Number.isInteger(v)) {
      return `${(v * 100).toFixed(2)}%`;
    }
    return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
  }
  return String(v);
};

export const SectionHeading = ({ eyebrow, title, subtitle, color = "#0F172A" }) => (
  <Box sx={{ mb: 2 }}>
    {eyebrow && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color,
          }}
        >
          {eyebrow}
        </Typography>
      </Box>
    )}
    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, color: "#16233B" }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>{subtitle}</Typography>
    )}
  </Box>
);

// Small grid of metric tiles, e.g. state overview key/value pairs.
export const StatMiniGrid = ({ items, cols = 4 }) => (
  <Grid container spacing={1.5} sx={{ mb: 1 }}>
    {items.map((it, i) => (
      <Grid size={{ xs: 6, sm: 12 / cols }} key={i}>
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: "1px solid #E4E7F0", borderLeft: `4px solid ${it.accent || "#0F172A"}`, p: 1.75, height: "100%" }}>
          <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>
            {it.label}
          </Typography>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 20, color: "#16233B", mt: 0.25 }}>
            {fmt(it.value)}
          </Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

// Generic paginated table for arrays of row objects. `columns` is
// [{ key, label, align, mono, format }]. Falls back to every key on
// the first row when `columns` isn't supplied.
export const AnalysisDataTable = ({
  rows = [],
  columns,
  maxHeight = 440,
  pageSize = 10,
  searchable = false,
  searchKeys,
  districtFilterKey,
  externalDistrict, // optional: value from a page-level district filter. When
  // provided, this table's own District dropdown is hidden and rows are
  // filtered by this value instead — keeps every table in sync with one
  // shared filter instead of each table having its own disconnected one.
  dense = true,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [search, setSearch] = useState("");
  const [internalDistrictFilter, setInternalDistrictFilter] = useState("All");
  const isControlled = externalDistrict !== undefined;
  const districtFilter = isControlled ? externalDistrict : internalDistrictFilter;
  const setDistrictFilter = setInternalDistrictFilter;

  const cols = columns || (rows[0] ? Object.keys(rows[0]).map((k) => ({ key: k, label: k })) : []);

  const districts = useMemo(() => {
    if (!districtFilterKey) return [];
    return Array.from(new Set(rows.map((r) => r[districtFilterKey]).filter(Boolean))).sort();
  }, [rows, districtFilterKey]);

  const filtered = useMemo(() => {
    let out = rows;
    if (districtFilterKey && districtFilter !== "All") {
      out = out.filter((r) => r[districtFilterKey] === districtFilter);
    }
    if (searchable && search.trim()) {
      const q = search.trim().toLowerCase();
      const keys = searchKeys || cols.map((c) => c.key);
      out = out.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
    }
    return out;
  }, [rows, search, districtFilter]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {(searchable || (districtFilterKey && !isControlled)) && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
          {districtFilterKey && !isControlled && (
            <TextField
              select
              size="small"
              label="District"
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="All">All Districts</MenuItem>
              {districts.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>
          )}
          {searchable && (
            <TextField
              size="small"
              label="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 220 }}
            />
          )}
        </Box>
      )}
      <TableContainer component={Paper} elevation={0} sx={{ maxHeight, border: "1px solid #E4E7F0" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.align || (c.mono ? "center" : "left")}
                  sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff", fontSize: 12 }}
                >
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r, i) => (
              <TableRow key={i} hover>
                {cols.map((c) => (
                  <TableCell
                    key={c.key}
                    align={c.align || (c.mono ? "center" : "left")}
                    sx={{
                      fontSize: 13,
                      fontFamily: c.mono ? '"IBM Plex Mono", monospace' : undefined,
                      fontWeight: c.bold ? 700 : 400,
                    }}
                  >
                    {c.render ? c.render(r[c.key], r) : fmt(r[c.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={cols.length} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  No rows match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {filtered.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}
    </Box>
  );
};

// Colour chip for GSQAC letter grades (A+/A/B/C) reused across panels.
const GRADE_COLORS = {
  "A+": { bg: "#2E7D32", fg: "#fff" },
  A: { bg: "#66BB6A", fg: "#fff" },
  B: { bg: "#F0B429", fg: "#16233B" },
  C: { bg: "#EF6C00", fg: "#fff" },
  NA: { bg: "#F0F1F5", fg: "#5B6B85" },
};
export const GradeChip = ({ grade }) => {
  const c = GRADE_COLORS[grade] || GRADE_COLORS.NA;
  return (
    <Chip
      label={grade || "—"}
      size="small"
      sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 700, fontSize: 11 }}
    />
  );
};

export const TrendChip = ({ trend }) => {
  const map = {
    Improved: { bg: "#2E7D3220", fg: "#2E7D32" },
    Increased: { bg: "#2E7D3220", fg: "#2E7D32" },
    Declined: { bg: "#D32F2F20", fg: "#D32F2F" },
    Decreased: { bg: "#D32F2F20", fg: "#D32F2F" },
    "No Data": { bg: "#F0F1F5", fg: "#5B6B85" },
  };
  const c = map[trend] || { bg: "#F0F1F5", fg: "#5B6B85" };
  return <Chip label={trend || "—"} size="small" sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 700, fontSize: 10.5 }} />;
};

export const CardShell = ({ children, accent }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 3,
      mt: 4,
      border: "1px solid #E4E7F0",
      ...(accent ? { borderLeft: `4px solid ${accent}` } : {}),
    }}
    elevation={0}
  >
    <CardContent>{children}</CardContent>
  </Card>
);
