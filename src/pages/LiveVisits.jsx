import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
  TablePagination,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import NearMeIcon from "@mui/icons-material/NearMe";
import DomainIcon from "@mui/icons-material/Domain";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EditNoteIcon from "@mui/icons-material/EditNote";

import Header from "../components/Header";
import DashboardLayout from "../components/DashboardLayout";
import { colors, fontMono, fontDisplay } from "../theme/theme";
import PriorityChip from "../components/PriorityChip";

import {
  fetchVisitDetails,
  getOverallStats,
  getAllDistrictNamesFromVisits,
  getDistrictReportRows,
  getDistrictReportTotals,
  getBlockReportRows,
  getCRCMonitoringList,
  searchVisits,
  todayISO,
  STATUS_META,
  VISIT_ROLES,
  REASON_CATEGORIES,
} from "../services/visitService";
import masterClusters from "../data/masterClusters.json";

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

// -----------------------------------------------------------------
// A three-level drill-down (District -> Block -> Cluster/visit) is the
// whole shape of this page, so each level gets its own accent colour,
// reused everywhere that level shows up — table rail, section eyebrow,
// row hover. Colour encodes depth here, it isn't decoration: glance at
// the strip on the left of any card and you know which zoom level
// you're reading without re-reading the heading.
// -----------------------------------------------------------------
const LEVEL = {
  district: { label: "District level", color: colors.navy },
  block: { label: "Block level", color: colors.teal },
  cluster: { label: "Cluster level", color: colors.gold },
};

const LevelEyebrow = ({ level }) => {
  const meta = LEVEL[level];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
      <Typography sx={{ fontFamily: fontMono, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: meta.color }}>
        {meta.label}
      </Typography>
    </Box>
  );
};

// Section shell shared by every table card on this page: the level
// rail on the left, a consistent header block, zebra rows and a gold
// hover-tint on the table below it (same idiom repeated three times,
// not three different table styles).
const SectionCard = ({ level, eyebrowExtra, title, subtitle, action, children }) => {
  const accent = LEVEL[level].color;
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E4E7F0",
        borderLeft: `4px solid ${accent}`,
        overflow: "hidden",
        mb: 2,
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #E4E7F0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <LevelEyebrow level={level} />
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 17, mt: 0.4 }}>{title}</Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 12.5, color: colors.slate, mt: 0.3, maxWidth: 640 }}>{subtitle}</Typography>
          )}
        </Box>
        {(eyebrowExtra || action) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {eyebrowExtra}
            {action}
          </Box>
        )}
      </Box>
      {children}
    </Paper>
  );
};

// Zebra + gold-tint hover, applied identically to every table on the
// page via the `sx` spread below rather than redefined per table.
const zebraTableSx = {
  "& tbody tr:nth-of-type(odd)": { bgcolor: "#FAFBFD" },
  "& tbody tr:hover": { bgcolor: "#FDF6E3" },
};
const headCellSx = { fontWeight: 700, bgcolor: "#F7F8FC", whiteSpace: "nowrap" };

const StatusChip = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.NOTVISITED;
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        bgcolor: `${meta.color}1A`,
        color: meta.color,
        fontWeight: 700,
        fontSize: 11.5,
        border: `1px solid ${meta.color}55`,
      }}
    />
  );
};

// Two-segment bar (visited vs not-visited) so a district's standing
// reads as a shape, not just a number — the one chart-like device on
// the page, reused at both District and Block level so it functions
// as a signature rather than a one-off.
const CompletionBar = ({ visitedPct }) => {
  const rest = Math.max(100 - visitedPct, 0);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.45, minWidth: 76 }}>
      <Typography sx={{ fontFamily: fontMono, fontSize: 12.5, fontWeight: 700 }}>{visitedPct.toFixed(1)}%</Typography>
      <Box sx={{ width: 68, height: 5, borderRadius: 3, bgcolor: "#EDEFF6", overflow: "hidden", display: "flex" }}>
        <Box sx={{ width: `${visitedPct}%`, bgcolor: STATUS_META.FREEZED.color }} />
        <Box sx={{ width: `${rest}%`, bgcolor: STATUS_META.NOTVISITED.color }} />
      </Box>
    </Box>
  );
};

const StatTile = ({ label, value, gradient, textColor = "#fff", Icon }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      background: gradient,
      color: textColor,
      height: "100%",
      p: 2.25,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 6px 16px rgba(15,23,42,0.12)",
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(255,255,255,0.22)",
        mb: 1.25,
      }}
    >
      <Icon sx={{ fontSize: 21 }} />
    </Box>
    <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 30, lineHeight: 1.1 }}>{value}</Typography>
    <Typography sx={{ fontSize: 12.5, opacity: 0.92, mt: 0.4, fontWeight: 600 }}>{label}</Typography>
  </Paper>
);

const LiveVisits = () => {
  const [date, setDate] = useState(todayISO());
  const [role, setRole] = useState("crc");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVisitDetails(date, role);
      setVisits(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to load visit data");
    } finally {
      setLoading(false);
    }
  }, [date, role]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(load, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const overall = useMemo(() => getOverallStats(visits), [visits]);
  const districtRows = useMemo(() => getDistrictReportRows(visits, masterClusters), [visits]);
  const districtTotals = useMemo(() => getDistrictReportTotals(districtRows), [districtRows]);
  const districtNames = useMemo(() => getAllDistrictNamesFromVisits(visits), [visits]);
  const blockRows = useMemo(() => getBlockReportRows(visits, masterClusters, selectedDistrict), [visits, selectedDistrict]);
  const crcMonitoring = useMemo(() => getCRCMonitoringList(visits, selectedDistrict), [visits, selectedDistrict]);

  const isDistrictFiltered = selectedDistrict !== "All";

  const filteredVisits = useMemo(() => {
    const base = isDistrictFiltered ? visits.filter((v) => v.DistrictName === selectedDistrict) : visits;
    return searchVisits(base, search);
  }, [visits, selectedDistrict, isDistrictFiltered, search]);

  const pagedVisits = filteredVisits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [selectedDistrict, search, date, role]);

  const controls = (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
      <TextField
        type="date"
        size="small"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        sx={{ bgcolor: "rgba(255,255,255,0.95)", borderRadius: 1, minWidth: 170 }}
      />
      <TextField
        select
        size="small"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        sx={{ bgcolor: "rgba(255,255,255,0.95)", borderRadius: 1, minWidth: 220 }}
      >
        {VISIT_ROLES.map((r) => (
          <MenuItem key={r.value} value={r.value}>
            {r.label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
        onClick={load}
        disabled={loading}
        sx={{ bgcolor: colors.gold, color: colors.navy, fontWeight: 700, "&:hover": { bgcolor: colors.goldLight } }}
      >
        Refresh
      </Button>
      <FormControlLabel
        control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
        label={<Typography sx={{ fontSize: 13, color: "#fff" }}>Auto-refresh every 5 min</Typography>}
      />
    </Box>
  );

  return (
    <DashboardLayout>
      <Header
        pageEyebrow={
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: STATUS_META.NOTVISITED.color,
                boxShadow: `0 0 0 3px ${STATUS_META.NOTVISITED.color}33`,
                animation: "livePulse 1.6s ease-in-out infinite",
                "@keyframes livePulse": {
                  "0%": { opacity: 1, transform: "scale(1)" },
                  "50%": { opacity: 0.35, transform: "scale(1.5)" },
                  "100%": { opacity: 1, transform: "scale(1)" },
                },
                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
              }}
            />
            LIVE FEED · APISMA.SSGUJARAT.ORG
          </Box>
        }
        pageIcon="📍"
        pageTitle="CRC Visit Tracker"
        pageSubtitle="Daily school-visit compliance, live from the field-monitoring app"
        controls={controls}
        statChip={{
          label: "Today's Completion",
          value: overall.completionRate.toFixed(1),
          suffix: "%",
          badge: lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : null,
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statewide snapshot — same colourful-tile idiom as the SSA admin
          dashboard, built only from figures this page can actually
          verify (see the note under the District-wise table for the
          two fields — Freezed / Bagless Activity — still unconfirmed). */}
      <Typography sx={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: colors.slate, mb: 1 }}>
        Statewide Snapshot
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Total Cluster"
            value={districtTotals.totalCluster.toLocaleString()}
            gradient={`linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`}
            Icon={DomainIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="In Place CRC"
            value={districtTotals.inPlace.toLocaleString()}
            gradient={`linear-gradient(135deg, ${colors.navyLight}, #3D5A80)`}
            Icon={PersonPinCircleIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Vacant"
            value={districtTotals.vacantCount.toLocaleString()}
            gradient={`linear-gradient(135deg, ${colors.slate}, #8291A8)`}
            Icon={EventBusyIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Total Visits"
            value={overall.total.toLocaleString()}
            gradient={`linear-gradient(135deg, #6A3DB8, #9B6DE0)`}
            Icon={ChecklistRtlIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Completed Visits"
            value={overall.completed.toLocaleString()}
            gradient={`linear-gradient(135deg, ${STATUS_META.FREEZED.color}, #3FB897)`}
            Icon={TaskAltIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Visit In Progress"
            value={overall.inProgress.toLocaleString()}
            gradient={`linear-gradient(135deg, ${STATUS_META.INPROGRESS.color}, ${colors.goldLight})`}
            textColor={colors.navy}
            Icon={HourglassBottomIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Not Visited — with reason"
            value={districtTotals.notVisitedWithReason.toLocaleString()}
            gradient="linear-gradient(135deg, #FB8C00, #FFB74D)"
            textColor={colors.navy}
            Icon={EditNoteIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatTile
            label="Not Visited — no reason"
            value={districtTotals.notVisitedWithoutReason.toLocaleString()}
            gradient={`linear-gradient(135deg, ${STATUS_META.NOTVISITED.color}, #E5737E)`}
            Icon={ReportProblemOutlinedIcon}
          />
        </Grid>
      </Grid>

      {/* District-wise Visit Statistics — matches sma.ssgujarat.org's report */}
      <SectionCard
        level="district"
        title="District-wise Visit Statistics"
        subtitle="Total Cluster is from the official cluster master list, not the live feed. Click a district to drill into its blocks and cluster-level records below. Test/QA entries (code 2499) are excluded from every count."
      >
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table size="small" stickyHeader sx={zebraTableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>District</TableCell>
                <TableCell align="right" sx={headCellSx}>Total Cluster</TableCell>
                <TableCell align="right" sx={headCellSx}>In Place</TableCell>
                <TableCell align="right" sx={headCellSx}>Vacant Count</TableCell>
                <TableCell align="right" sx={headCellSx}>Total Visit</TableCell>
                <TableCell align="right" sx={headCellSx}>Visited</TableCell>
                <TableCell align="right" sx={headCellSx}>Visited (%)</TableCell>
                <TableCell align="right" sx={headCellSx}>Total Not Visited</TableCell>
                <TableCell align="right" sx={headCellSx}>Not Visited with reason</TableCell>
                {REASON_CATEGORIES.map((cat) => (
                  <TableCell key={cat} align="right" sx={{ ...headCellSx, color: colors.slate, fontSize: 11.5 }}>{cat}</TableCell>
                ))}
                <TableCell align="right" sx={{ ...headCellSx, color: colors.slate, fontSize: 11.5 }}>Other reason</TableCell>
                <TableCell align="right" sx={headCellSx}>Not Visited without reason</TableCell>
                <TableCell align="right" sx={headCellSx}>Not Visited (%)</TableCell>
                <TableCell align="right" sx={headCellSx}>Freezed</TableCell>
                <TableCell align="right" sx={headCellSx}>Bagless Activity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {districtRows.map((d) => (
                <TableRow
                  key={d.district}
                  hover
                  selected={selectedDistrict === d.district}
                  onClick={() => setSelectedDistrict(selectedDistrict === d.district ? "All" : d.district)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>
                    {d.district}
                    <PriorityChip district={d.district} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.totalCluster}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.inPlace}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.vacantCount}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.totalVisit}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.visited}</TableCell>
                  <TableCell align="right"><CompletionBar visitedPct={d.visitedPct} /></TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.totalNotVisited}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.notVisitedWithReason}</TableCell>
                  {REASON_CATEGORIES.map((cat) => (
                    <TableCell key={cat} align="right" sx={{ fontFamily: fontMono, fontSize: 12, color: colors.slate }}>
                      {d.reasonCounts[cat] || 0}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontSize: 12, color: colors.slate }}>{d.reasonCounts.Other || 0}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.notVisitedWithoutReason}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{d.notVisitedPct.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, color: d.freezed === null ? colors.slate : "inherit" }}>
                    {d.freezed === null ? "—" : d.freezed}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, color: d.baglessActivity === null ? colors.slate : "inherit" }}>
                    {d.baglessActivity === null ? "—" : d.baglessActivity}
                  </TableCell>
                </TableRow>
              ))}
              {districtRows.length > 0 && (
                <TableRow sx={{ bgcolor: "#F2F4FA !important" }}>
                  <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.totalCluster}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.inPlace}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.vacantCount}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.totalVisit}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.visited}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.visitedPct.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.totalNotVisited}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.notVisitedWithReason}</TableCell>
                  {REASON_CATEGORIES.map((cat) => (
                    <TableCell key={cat} align="right" sx={{ fontFamily: fontMono, fontWeight: 800, fontSize: 12, color: colors.slate }}>
                      {districtTotals.reasonCounts[cat] || 0}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800, fontSize: 12, color: colors.slate }}>
                    {districtTotals.reasonCounts.Other || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.notVisitedWithoutReason}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800 }}>{districtTotals.notVisitedPct.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800, color: districtTotals.freezed === null ? colors.slate : "inherit" }}>
                    {districtTotals.freezed === null ? "—" : districtTotals.freezed}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono, fontWeight: 800, color: districtTotals.baglessActivity === null ? colors.slate : "inherit" }}>
                    {districtTotals.baglessActivity === null ? "—" : districtTotals.baglessActivity}
                  </TableCell>
                </TableRow>
              )}
              {!loading && districtRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13 + REASON_CATEGORIES.length + 1} align="center" sx={{ py: 4, color: colors.slate }}>
                    No data for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      {/* Block-wise Visit Statistics for the selected district */}
      <SectionCard
        level="block"
        title={`Block-wise Visit Statistics ${isDistrictFiltered ? `— ${selectedDistrict}` : "(All Districts)"}`}
        subtitle={`${blockRows.length} block${blockRows.length !== 1 ? "s" : ""} · District, Block, Total Cluster first — same layout as the district table above, one level deeper.`}
        action={
          isDistrictFiltered && (
            <Button size="small" onClick={() => setSelectedDistrict("All")} sx={{ textTransform: "none" }}>
              Clear district filter
            </Button>
          )
        }
      >
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader sx={zebraTableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>District</TableCell>
                <TableCell sx={headCellSx}>Block</TableCell>
                <TableCell align="right" sx={headCellSx}>Total Cluster</TableCell>
                <TableCell align="right" sx={headCellSx}>In Place</TableCell>
                <TableCell align="right" sx={headCellSx}>Vacant Count</TableCell>
                <TableCell align="right" sx={headCellSx}>Total Visit</TableCell>
                <TableCell align="right" sx={headCellSx}>Visited</TableCell>
                <TableCell align="right" sx={headCellSx}>Visited (%)</TableCell>
                <TableCell align="right" sx={headCellSx}>Total Not Visited</TableCell>
                <TableCell align="right" sx={headCellSx}>Not Visited with reason</TableCell>
                <TableCell align="right" sx={headCellSx}>Not Visited without reason</TableCell>
                <TableCell align="right" sx={headCellSx}>Not Visited (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blockRows.map((b) => (
                <TableRow key={`${b.district}-${b.block}`} hover>
                  <TableCell sx={{ color: colors.slate }}>
                    {b.district}
                    <PriorityChip district={b.district} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{b.block}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.totalCluster}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.inPlace}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.vacantCount}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.totalVisit}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.visited}</TableCell>
                  <TableCell align="right"><CompletionBar visitedPct={b.visitedPct} /></TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.totalNotVisited}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.notVisitedWithReason}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.notVisitedWithoutReason}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: fontMono }}>{b.notVisitedPct.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {blockRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4, color: colors.slate }}>
                    No blocks for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      {/* CRC Monitoring — named list of CRCs still pending, for
          follow-up. Cluster-level detail like Visit Records below, so
          it stays out of sight (all 1,800+ pending CRCs statewide is
          not a usable follow-up list) until a district narrows it down. */}
      {isDistrictFiltered ? (
        <SectionCard
          level="cluster"
          title={`CRC Monitoring — ${selectedDistrict}`}
          subtitle={`${crcMonitoring.length} CRC${crcMonitoring.length !== 1 ? "s" : ""} pending in this district — Not Visited listed first, for follow-up calls`}
          action={
            <Button size="small" onClick={() => setSelectedDistrict("All")} sx={{ textTransform: "none" }}>
              Clear district filter
            </Button>
          }
        >
          <TableContainer sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader sx={zebraTableSx}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>District</TableCell>
                  <TableCell sx={headCellSx}>Block</TableCell>
                  <TableCell sx={headCellSx}>Cluster</TableCell>
                  <TableCell sx={headCellSx}>CRC Name</TableCell>
                  <TableCell sx={headCellSx}>Mobile</TableCell>
                  <TableCell sx={headCellSx}>Status</TableCell>
                  <TableCell sx={headCellSx}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {crcMonitoring.map((c, i) => (
                  <TableRow key={`${c.name}-${c.cluster}-${i}`} hover>
                    <TableCell sx={{ fontSize: 13, color: colors.slate }}>{c.district}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: colors.slate }}>{c.block}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{c.cluster}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{c.name}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontFamily: fontMono }}>{c.mobile}</TableCell>
                    <TableCell>
                      <StatusChip status={c.status} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, color: colors.slate }}>{c.reason || "—"}</TableCell>
                  </TableRow>
                ))}
                {!loading && crcMonitoring.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: colors.slate }}>
                      All CRCs completed — nothing pending.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px dashed ${LEVEL.cluster.color}66`,
            borderLeft: `4px solid ${LEVEL.cluster.color}`,
            p: 4,
            textAlign: "center",
            color: colors.slate,
            mb: 2,
          }}
        >
          <NearMeIcon sx={{ fontSize: 26, color: LEVEL.cluster.color, mb: 1 }} />
          <LevelEyebrow level="cluster" />
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 17, mt: 1, color: colors.ink }}>
            Pick a district to open CRC Monitoring
          </Typography>
          <Typography sx={{ fontSize: 13, mt: 0.5, maxWidth: 460, mx: "auto" }}>
            Click any row in the District-wise table above — the {crcMonitoring.length.toLocaleString()} CRCs pending
            statewide will narrow to a follow-up list for that district.
          </Typography>
        </Paper>
      )}

      {/* Individual visit records — cluster-level, so kept out of sight
          until a district is picked: 2,600+ raw rows dumped up front
          would bury the district/block summaries this page leads with. */}
      {isDistrictFiltered ? (
        <SectionCard
          level="cluster"
          title={`Visit Records — ${selectedDistrict}`}
          subtitle="Every cluster-level visit in this district, in District, Block, Cluster order."
          action={
            <TextField
              size="small"
              placeholder="Search CRC, school, cluster, block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: colors.slate }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />
          }
        >
          <TableContainer sx={{ maxHeight: 560 }}>
            <Table size="small" stickyHeader sx={zebraTableSx}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>District</TableCell>
                  <TableCell sx={headCellSx}>Block</TableCell>
                  <TableCell sx={headCellSx}>Cluster</TableCell>
                  <TableCell sx={headCellSx}>CRC</TableCell>
                  <TableCell sx={headCellSx}>School</TableCell>
                  <TableCell sx={headCellSx}>Status</TableCell>
                  <TableCell sx={headCellSx}>Started</TableCell>
                  <TableCell sx={headCellSx}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedVisits.map((v) => (
                  <TableRow key={v.VisitId} hover>
                    <TableCell sx={{ fontSize: 13, color: colors.slate }}>{v.DistrictName}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: colors.slate }}>{v.BlockName}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{v.ClusterName}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{v.FullName}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: colors.slate }}>{v.MobileNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PlaceIcon sx={{ fontSize: 14, color: colors.slate }} />
                        <Typography sx={{ fontSize: 13 }}>{v.SchoolName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={v.SchoolStatus} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, fontFamily: fontMono, color: colors.slate }}>
                      {v.SchoolVisitStartedAt || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, color: colors.slate }}>{v.Reason || "—"}</TableCell>
                  </TableRow>
                ))}
                {!loading && pagedVisits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: colors.slate }}>
                      No visits match this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredVisits.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </SectionCard>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px dashed ${LEVEL.cluster.color}66`,
            borderLeft: `4px solid ${LEVEL.cluster.color}`,
            p: 4,
            textAlign: "center",
            color: colors.slate,
          }}
        >
          <NearMeIcon sx={{ fontSize: 26, color: LEVEL.cluster.color, mb: 1 }} />
          <LevelEyebrow level="cluster" />
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 17, mt: 1, color: colors.ink }}>
            Pick a district to see cluster-level records
          </Typography>
          <Typography sx={{ fontSize: 13, mt: 0.5, maxWidth: 460, mx: "auto" }}>
            Click any row in the District-wise table above — the {filteredVisits.length.toLocaleString()} individual
            visit records for that district will open here, in District, Block, Cluster order.
          </Typography>
        </Paper>
      )}
    </DashboardLayout>
  );
};

export default LiveVisits;
