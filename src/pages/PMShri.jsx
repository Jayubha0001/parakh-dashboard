import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  TextField,
  MenuItem,
  TablePagination,
  Tabs,
  Tab,
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

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import Loading from "../components/Loading";

import {
  loadExcel,
  getPMShriData,
  getPMShriActionItems,
  getAllDistrictNames,
  getAllDistrictPMShriActionItems,
  loadPMShriResultExcel,
  getPMShriGSQACResult,
  summarizeSchoolsForYear,
  buildDistrictSummariesForYear,
  PM_SHRI_YEAR_LABELS,
  COLOR_GRADE_KEY,
} from "../services/dataService";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "../components/PriorityChip";
import ActionItemsQueue from "../components/ActionItemsQueue";
import GOIAnalysisPanel from "../components/pmshri/GOIAnalysisPanel";
import GOGAnalysisPanel from "../components/pmshri/GOGAnalysisPanel";
import CombinedOverview from "../components/pmshri/CombinedOverview";

// Five small bars, one per assessment year, coloured by that year's
// colour grade and height-scaled by score — a whole school's history
// readable in one glance, instead of five separate columns.
const YearTrend = ({ years }) => (
  <Box sx={{ display: "flex", gap: 0.6, alignItems: "flex-end", justifyContent: "center" }}>
    {years.map((y) => (
      <Box key={y.year} title={`${y.year}: ${y.pct != null ? `${y.pct}%` : "No data"}`} sx={{ textAlign: "center", width: 14 }}>
        <Box
          sx={{
            width: 8,
            height: y.pct != null ? Math.max(4, (y.pct / 100) * 32) : 4,
            mx: "auto",
            borderRadius: "2px 2px 0 0",
            bgcolor: y.colorGrade ? y.colorGrade.color : "#E4E7F0",
            opacity: y.pct != null ? 1 : 0.35,
          }}
        />
      </Box>
    ))}
  </Box>
);

const PMShri = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [stateTotal, setStateTotal] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);
  const [gsqac, setGsqac] = useState(null);

  const [gsqacDistrictFilter, setGsqacDistrictFilter] = useState("All");
  const [gsqacSearch, setGsqacSearch] = useState("");
  const [gsqacPage, setGsqacPage] = useState(0);
  const [gsqacRowsPerPage, setGsqacRowsPerPage] = useState(10);
  const [gsqacSegment, setGsqacSegment] = useState("All"); // "All" | "GOI" | "GOG"
  const [gsqacYearIndex, setGsqacYearIndex] = useState(PM_SHRI_YEAR_LABELS.length - 1);

  const [decliningPage, setDecliningPage] = useState(0);
  const [decliningRowsPerPage, setDecliningRowsPerPage] = useState(10);

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();
      const { districts, stateTotal } = getPMShriData(workbook);
      setDistricts(districts);
      setStateTotal(stateTotal);
      setAllDistrictNames(getAllDistrictNames(workbook));

      // GSQAC quality results are loaded before the action items are
      // built, since the queue now leads with GSQAC weak/declining
      // schools (not just raw PM Shri coverage counts) — same pattern
      // as PGI's ranking+heatmap and SAT's ranking+subject-wise combo.
      const resultWorkbook = await loadPMShriResultExcel();
      const gsqacResult = getPMShriGSQACResult(resultWorkbook);
      setGsqac(gsqacResult);

      setActionItems(getPMShriActionItems(workbook, gsqacResult));
      setAllDistrictItems(getAllDistrictPMShriActionItems(workbook, gsqacResult));

      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    setGsqacPage(0);
  }, [gsqacDistrictFilter, gsqacSearch, gsqacSegment, gsqacYearIndex]);

  useEffect(() => {
    setDecliningPage(0);
  }, [gsqacSegment]);

  if (loading) {
    return (
      <DashboardLayout>
        <Header />
        <Loading message="Loading PM Shri school data..." />
      </DashboardLayout>
    );
  }

  const sorted = [...districts].sort((a, b) => b.totalSchools - a.totalSchools);

  const gsqacSegmentSchools = gsqacSegment === "GOI" ? gsqac.goiSchools : gsqacSegment === "GOG" ? gsqac.gogSchools : gsqac.schools;
  const gsqacCurrentDistricts = buildDistrictSummariesForYear(gsqacSegmentSchools, gsqacYearIndex);
  const gsqacCurrentState = summarizeSchoolsForYear(gsqacSegmentSchools, gsqacYearIndex);
  const gsqacSelectedYearLabel = PM_SHRI_YEAR_LABELS[gsqacYearIndex];

  const gsqacFilteredSchools = gsqac.schools.filter((s) => {
    if (gsqacSegment !== "All" && s.goiGog !== gsqacSegment) return false;
    if (gsqacDistrictFilter !== "All" && s.district !== gsqacDistrictFilter) return false;
    if (gsqacSearch.trim()) {
      const q = gsqacSearch.trim().toLowerCase();
      return [s.schoolName, s.udise, s.block, s.district].some((f) => String(f || "").toLowerCase().includes(q));
    }
    return true;
  });
  const gsqacPagedSchools = gsqacFilteredSchools.slice(
    gsqacPage * gsqacRowsPerPage,
    gsqacPage * gsqacRowsPerPage + gsqacRowsPerPage
  );

  const decliningFiltered = gsqacSegment === "All" ? gsqac.decliningSchools : gsqac.decliningSchools.filter((s) => s.goiGog === gsqacSegment);
  const decliningPaged = decliningFiltered.slice(
    decliningPage * decliningRowsPerPage,
    decliningPage * decliningRowsPerPage + decliningRowsPerPage
  );

  const chartData = sorted.map((d) => ({
    District: d.district,
    "GOI Schools": d.goiSchools,
    "GOG Schools": d.gogSchools,
  }));

  const statCards = [
    { label: "Total PM Shri Schools", value: stateTotal?.totalSchools ?? 0, accent: "#1976D2" },
    { label: "Total Enrolment", value: stateTotal?.totalEnrollment?.toLocaleString() ?? 0, accent: "#2E7D32" },
    { label: "Total Teachers", value: stateTotal?.totalTeachers?.toLocaleString() ?? 0, accent: "#F0B429" },
    { label: "GOI Schools", value: stateTotal?.goiSchools ?? 0, accent: "#8E24AA" },
    { label: "GOG Schools", value: stateTotal?.gogSchools ?? 0, accent: "#00897B" },
  ];

  return (
    <DashboardLayout>
      <Header />

      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", mt: 2, px: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13.5, minHeight: 48 },
            "& .Mui-selected": { color: "#0F172A !important" },
            "& .MuiTabs-indicator": { bgcolor: "#0F172A", height: 3 },
          }}
        >
          <Tab label="GSQAC Overview" />
          <Tab label="GOI Analysis — Enrollment & Board Results" />
          <Tab label="GOG 426 Deep-Dive" />
        </Tabs>
      </Paper>

      {activeTab === 1 && <GOIAnalysisPanel />}
      {activeTab === 2 && <GOGAnalysisPanel />}

      {activeTab === 0 && (
      <>
      <CombinedOverview />
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", overflow: "hidden", mt: 2 }}>
        <Grid container>
          {statCards.map((stat, i) => (
            <Grid
              size={{ xs: 6, sm: 12 / statCards.length }}
              key={stat.label}
              sx={{
                p: 3,
                borderRight: { sm: i < statCards.length - 1 ? "1px solid #E4E7F0" : "none" },
                borderBottom: { xs: i < 4 ? "1px solid #E4E7F0" : "none", sm: "none" },
              }}
            >
              <Box sx={{ width: 24, height: 3, borderRadius: 2, bgcolor: stat.accent, mb: 1.5 }} />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{stat.label.toUpperCase()}</Typography>
              <Typography
                sx={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: 700,
                  fontSize: 26,
                  color: "#16233B",
                }}
              >
                {stat.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
        <CardContent>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
            PM Shri Schools — GOI vs GOG, by District
          </Typography>

          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="District" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={30} />
              <Bar dataKey="GOI Schools" stackId="a" fill="#1976D2" radius={[0, 0, 0, 0]} />
              <Bar dataKey="GOG Schools" stackId="a" fill="#F0B429" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
        <CardContent>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
            District-wise PM Shri School Details
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 500, border: "1px solid #E4E7F0" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Sr No</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>District</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOI Schools</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOI Enrolment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOI Teachers</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOG Schools</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOG Enrolment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOG Teachers</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Total Schools</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Total Enrolment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Total Teachers</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sorted.map((d) => (
                  <TableRow
                    key={d.district}
                    hover
                    sx={isPriorityDistrict(d.district) ? { bgcolor: "#FFFBEB" } : undefined}
                  >
                    <TableCell>{d.srNo}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {d.district}
                      <PriorityChip district={d.district} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.goiSchools}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.goiEnrollment.toLocaleString()}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.goiTeachers}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.gogSchools}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.gogEnrollment.toLocaleString()}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.gogTeachers}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{d.totalSchools}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.totalEnrollment.toLocaleString()}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.totalTeachers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* PM SHRI GSQAC Result — Gujarat State Quality Assurance & Certification grade */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#0F172A" }} />
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#0F172A" }}>
              PM SHRI · GSQAC Result
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 0.5, color: "#16233B" }}>
            Gujarat State Quality Assurance & Certification — {gsqac.latestYearLabel}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
            {gsqac.state.totalSchools.toLocaleString()} PM SHRI schools · State average {gsqac.state.avgPct.toFixed(1)}%
          </Typography>

          {/* GOI vs GOG — kept separate throughout: these are two
              different funding streams, so a combined-only number
              hides which one needs attention. */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "All Schools", data: gsqac.state, accent: "#0F172A" },
              { label: "GOI Schools", data: gsqac.stateGOI, accent: "#1976D2" },
              { label: "GOG Schools", data: gsqac.stateGOG, accent: "#8E24AA" },
            ].map((seg) => (
              <Grid size={{ xs: 12, sm: 4 }} key={seg.label}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: "1px solid #E4E7F0", borderLeft: `4px solid ${seg.accent}`, p: 2 }}>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {seg.label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 24, color: "#16233B" }}>
                      {seg.data.totalSchools.toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>schools</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 15, color: seg.accent, mt: 0.25 }}>
                    Avg {seg.data.avgPct.toFixed(1)}%
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Year-wise comparison — All / GOI / GOG average score across
              every assessment cycle, so an improving or worsening trend
              is visible at a glance. */}
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16, mb: 1.5, color: "#16233B" }}>
            Year-wise Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gsqac.yearWise} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => (v == null ? "—" : `${v}%`)} />
              <Legend verticalAlign="top" height={30} />
              <Bar dataKey="GOI" fill="#1976D2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="GOG" fill="#8E24AA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="All Schools" fill="#F0B429" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <Box sx={{ height: 24 }} />

          {/* GOI / GOG / All segment selector, and the year the legend,
              colour bar and district table below are showing — this
              was ambiguous before (silently always the latest year) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 600 }}>View:</Typography>
            {["All", "GOI", "GOG"].map((seg) => (
              <Chip
                key={seg}
                label={seg === "All" ? "All Schools" : `${seg} Schools`}
                size="small"
                onClick={() => setGsqacSegment(seg)}
                sx={{
                  fontWeight: 700,
                  bgcolor: gsqacSegment === seg ? "#0F172A" : "#F0F1F5",
                  color: gsqacSegment === seg ? "#fff" : "#16233B",
                }}
              />
            ))}
            <TextField
              select
              size="small"
              label="Year"
              value={gsqacYearIndex}
              onChange={(e) => setGsqacYearIndex(Number(e.target.value))}
              sx={{ minWidth: 140, ml: { sm: 1 } }}
            >
              {PM_SHRI_YEAR_LABELS.map((y, i) => (
                <MenuItem key={y} value={i}>{y}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Grade / Color Grade / Score Range key */}
          <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600, mb: 0.75 }}>
            School counts for {gsqacSelectedYearLabel}{gsqacSegment !== "All" ? ` · ${gsqacSegment} Schools` : ""}
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E4E7F0", mb: 3, maxWidth: 520 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Color Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Score Range</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Schools</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {COLOR_GRADE_KEY.map((c) => (
                  <TableRow key={c.colorGrade}>
                    <TableCell sx={{ fontWeight: 700 }}>{c.grade}</TableCell>
                    <TableCell sx={{ bgcolor: c.color, color: c.textColor || "#fff", fontWeight: 600 }}>{c.colorGrade}</TableCell>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {c.exclusiveMin ? `>${c.min}%` : `${c.min}-${c.max}%`}
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>
                      {gsqacCurrentState.colorGradeCounts[c.colorGrade]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* State-wide colour distribution, as one segmented bar */}
          <Box sx={{ display: "flex", height: 22, borderRadius: 2, overflow: "hidden", mb: 3 }}>
            {COLOR_GRADE_KEY.map((c) => {
              const count = gsqacCurrentState.colorGradeCounts[c.colorGrade];
              const pct = gsqacCurrentState.totalSchools ? (count / gsqacCurrentState.totalSchools) * 100 : 0;
              if (!pct) return null;
              return (
                <Box
                  key={c.colorGrade}
                  title={`${c.colorGrade}: ${count} schools (${pct.toFixed(1)}%)`}
                  sx={{ width: `${pct}%`, bgcolor: c.color, minWidth: pct > 0 ? 2 : 0 }}
                />
              );
            })}
          </Box>

          {/* District-wise colour-grade distribution */}
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16, mb: 1.5, color: "#16233B" }}>
            District-wise Colour Grade Distribution — {gsqacSelectedYearLabel}{gsqacSegment !== "All" ? ` · ${gsqacSegment} Schools` : ""}
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 500, border: "1px solid #E4E7F0", mb: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>District</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Schools</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Avg %</TableCell>
                  {COLOR_GRADE_KEY.map((c) => (
                    <TableCell key={c.colorGrade} align="center" sx={{ fontWeight: 700, bgcolor: c.color, color: c.textColor || "#fff", fontSize: 11.5 }}>
                      {c.colorGrade}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {gsqacCurrentDistricts.map((d) => (
                  <TableRow key={d.district} hover sx={isPriorityDistrict(d.district) ? { bgcolor: "#FFFBEB" } : undefined}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {d.district}
                      <PriorityChip district={d.district} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.totalSchools}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{d.avgPct.toFixed(1)}</TableCell>
                    {COLOR_GRADE_KEY.map((c) => (
                      <TableCell key={c.colorGrade} align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        {d.colorGradeCounts[c.colorGrade] || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* School-level search/filter */}
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 16, mb: 1.5, color: "#16233B" }}>
            School-wise Result
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
            <TextField
              select
              size="small"
              label="District"
              value={gsqacDistrictFilter}
              onChange={(e) => setGsqacDistrictFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="All">All Districts</MenuItem>
              {gsqac.districts.map((d) => (
                <MenuItem key={d.district} value={d.district}>{d.district}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Search school, UDISE, block..."
              value={gsqacSearch}
              onChange={(e) => setGsqacSearch(e.target.value)}
              sx={{ minWidth: 260 }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 480, border: "1px solid #E4E7F0" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Block</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>School</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>UDISE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOI/GOG</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Score ({gsqacSelectedYearLabel})</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Color Grade</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff", fontSize: 11 }}>
                    Trend ({PM_SHRI_YEAR_LABELS[0]} → {PM_SHRI_YEAR_LABELS[PM_SHRI_YEAR_LABELS.length - 1]})
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gsqacPagedSchools.map((s) => {
                  const yearData = s.years[gsqacYearIndex];
                  return (
                    <TableRow key={s.udise} hover>
                      <TableCell sx={{ fontSize: 13 }}>{s.district}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{s.block}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{s.schoolName}</TableCell>
                      <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5 }}>{s.udise}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={s.goiGog || "—"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 10.5,
                            bgcolor: s.goiGog === "GOI" ? "#1976D21A" : s.goiGog === "GOG" ? "#8E24AA1A" : "#F0F1F5",
                            color: s.goiGog === "GOI" ? "#1976D2" : s.goiGog === "GOG" ? "#8E24AA" : "#5B6B85",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>
                        {yearData.pct != null ? `${yearData.pct}%` : "—"}
                      </TableCell>
                      <TableCell align="center">
                        {yearData.colorGrade ? (
                          <Chip
                            label={yearData.colorGrade.colorGrade}
                            size="small"
                            sx={{
                              bgcolor: yearData.colorGrade.color,
                              color: yearData.colorGrade.textColor || "#fff",
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <YearTrend years={s.years} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {gsqacPagedSchools.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No schools match this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={gsqacFilteredSchools.length}
            page={gsqacPage}
            onPageChange={(_, newPage) => setGsqacPage(newPage)}
            rowsPerPage={gsqacRowsPerPage}
            onRowsPerPageChange={(e) => {
              setGsqacRowsPerPage(parseInt(e.target.value, 10));
              setGsqacPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Weakest — schools whose latest scored year came in lower than
          the year before it. Worst decline first, so the schools most
          in need of attention surface at the top. */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0", borderLeft: "4px solid #D32F2F" }} elevation={0}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#D32F2F" }} />
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#D32F2F" }}>
              Weakest — needs attention
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 0.5, color: "#16233B" }}>
            Schools Declined vs Previous Year {gsqacSegment !== "All" ? `— ${gsqacSegment} Schools` : ""}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
            {decliningFiltered.length.toLocaleString()} schools scored lower in their latest assessment than the one before it — sorted biggest drop first.
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 480, border: "1px solid #E4E7F0" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Block</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>School</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>GOI/GOG</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Prev Year</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Latest Year</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Δ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff" }}>Color Grade</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#0F172A", color: "#fff", fontSize: 11 }}>
                    Trend ({PM_SHRI_YEAR_LABELS[0]} → {PM_SHRI_YEAR_LABELS[PM_SHRI_YEAR_LABELS.length - 1]})
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {decliningPaged.map((s) => (
                  <TableRow key={s.udise} hover>
                    <TableCell sx={{ fontSize: 13 }}>{s.district}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{s.block}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{s.schoolName}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={s.goiGog || "—"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 10.5,
                          bgcolor: s.goiGog === "GOI" ? "#1976D21A" : s.goiGog === "GOG" ? "#8E24AA1A" : "#F0F1F5",
                          color: s.goiGog === "GOI" ? "#1976D2" : s.goiGog === "GOG" ? "#8E24AA" : "#5B6B85",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, color: "text.secondary" }}>
                      {s.trend.prevYear}: {s.trend.prevPct}%
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, fontWeight: 700 }}>
                      {s.trend.latestYear}: {s.trend.latestPct}%
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: "#D32F2F" }}>
                      {s.trend.delta}
                    </TableCell>
                    <TableCell align="center">
                      {s.latest.colorGrade ? (
                        <Chip
                          label={s.latest.colorGrade.colorGrade}
                          size="small"
                          sx={{
                            bgcolor: s.latest.colorGrade.color,
                            color: s.latest.colorGrade.textColor || "#fff",
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <YearTrend years={s.years} />
                    </TableCell>
                  </TableRow>
                ))}
                {decliningPaged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No declining schools in this view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={decliningFiltered.length}
            page={decliningPage}
            onPageChange={(_, newPage) => setDecliningPage(newPage)}
            rowsPerPage={decliningRowsPerPage}
            onRowsPerPageChange={(e) => {
              setDecliningRowsPerPage(parseInt(e.target.value, 10));
              setDecliningPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </CardContent>
      </Card>

      <ActionItemsQueue
        items={actionItems}
        allDistricts={allDistrictNames}
        allItems={allDistrictItems}
        syncDistrict={gsqacDistrictFilter}
      />
      </>
      )}
    </DashboardLayout>
  );
};

export default PMShri;
