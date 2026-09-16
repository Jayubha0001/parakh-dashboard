import DistrictTable from "../components/DistrictTable";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

import Header from "../components/Header";
import DashboardLayout from "../components/DashboardLayout";
import DistrictFilterBar from "../components/DistrictFilterBar";
import PGITable from "../components/PGITable";
import PGIRankingChart from "../charts/PGIRankingChart";
import SATSemesterComparison from "../components/SATSemesterComparison";
import ActionItemsQueue from "../components/ActionItemsQueue";
import NationalBenchmarkPanel from "../components/NationalBenchmarkPanel";
import { colors, fontDisplay, fontMono } from "../theme/theme";

import {
  loadExcel,
  loadSATSem1Excel,
  getSheetData,
  getStatePGISummary,
  getDistrictPGIRanking,
  getSubjectHeatmap,
  getGenderComparison,
  getLocationComparison,
  getManagementComparison,
  getSocialGroupComparison,
  getPriorityActionItems,
  getAllDistrictNames,
  getAllDistrictActionItems,
  getSATDistrictRanking,
  getSATGradeWise,
  getSATStateSummary,
  getSATSubjectWise,
  getSATSemesterComparison,
  getSATSem1DistrictRanking,
  getSATSem1GradeWise,
  getSATSem1StateSummary,
  getSATSem1SubjectWise,
  getSATDistrictSubjectWise,
  getSATSem1DistrictSubjectWise,
  getDistrictPGIIndicators,
  getDistrictCompetencies,
  getSATDistrictLOBreakdown,
} from "../services/dataService";
import { PGIIndicatorSection, PARAKHCompetencySection, SATLOBreakdownSection } from "../components/DistrictDeepDive";
import GujaratBubbleMap from "../components/GujaratBubbleMap";
import ExecutiveOverviewPanel from "../components/ExecutiveOverviewPanel";
import statePgi202526 from "../data/statePgi202526.json";
import pgiD202526 from "../data/pgiD202526.json";
import districtPgiIndicators202526 from "../data/districtPgiIndicators202526.json";
import { PRIORITY_DISTRICTS, isPriorityDistrict } from "../utils/priorityDistricts";

const Dashboard = () => {
  // -----------------------------
  // State
  // -----------------------------

  const [parakhData, setParakhData] = useState([]);

  const [pgiSummary, setPgiSummary] = useState({ domains: [], overall: {} });
  const [pgiRanking, setPgiRanking] = useState([]);
  const [subjectHeatmap, setSubjectHeatmap] = useState({ columns: [], data: [] });
  const [genderData, setGenderData] = useState({ columns: [], data: [] });
  const [locationData, setLocationData] = useState({ columns: [], data: [] });
  const [managementData, setManagementData] = useState({ columns: [], data: [] });
  const [socialGroupData, setSocialGroupData] = useState({ columns: [], data: [] });
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);

  const [satRankingSem2, setSatRankingSem2] = useState([]);
  const [satGradeWiseSem2, setSatGradeWiseSem2] = useState({ grades: [], data: [] });
  const [satSummarySem2, setSatSummarySem2] = useState({ stateAverage: 0, totalDistricts: 0, gradeAverages: [] });
  const [satSubjectWiseSem2, setSatSubjectWiseSem2] = useState([]);

  const [satRankingSem1, setSatRankingSem1] = useState([]);
  const [satGradeWiseSem1, setSatGradeWiseSem1] = useState({ grades: [], data: [] });
  const [satSummarySem1, setSatSummarySem1] = useState({ stateAverage: 0, totalDistricts: 0, gradeAverages: [] });
  const [satSubjectWiseSem1, setSatSubjectWiseSem1] = useState([]);
  const [satSubjectRowsSem1, setSatSubjectRowsSem1] = useState([]);
  const [satSubjectRowsSem2, setSatSubjectRowsSem2] = useState([]);

  const [satSemesterComparison, setSatSemesterComparison] = useState([]);

  // Which semester's data drives the SAT overview/KPI/grade-wise/chart/
  // table sections below. The Sem1 vs Sem2 comparison section always
  // shows both semesters together regardless of this toggle.
  // (SAT Semester toggle removed — the summary box below now always
  // shows both semesters, so this state no longer drives anything.)

  const [district, setDistrict] = useState("All");
  const [priorityOnly, setPriorityOnly] = useState(false);

  const [stage, setStage] = useState("Overall");

  const [subject, setSubject] = useState("Overall");

  // District-scoped "weakest indicators" deep-dive — combines all three
  // domains (PGI, PARAKH, SAT) that this Dashboard page already summarizes,
  // so picking a district here shows the same weakest-indicator lists each
  // domain's own page shows, without having to visit all three separately.
  const [districtPgiIndicators, setDistrictPgiIndicators] = useState(null);
  const [districtCompetencies, setDistrictCompetencies] = useState(null);
  const [districtLoBreakdown, setDistrictLoBreakdown] = useState(null);

  // -----------------------------
  // Load Excel
  // -----------------------------

  useEffect(() => {

    async function fetchData() {

      const workbook = await loadExcel();
      const sem1Workbook = await loadSATSem1Excel();

      const data = getSheetData(
        workbook,
        "Dashboard_PARAKH"
      );

      setParakhData(data);

      setPgiSummary(getStatePGISummary(workbook));
      setPgiRanking(getDistrictPGIRanking(workbook));
      setSubjectHeatmap(getSubjectHeatmap(workbook));
      setGenderData(getGenderComparison(workbook));
      setLocationData(getLocationComparison(workbook));
      setManagementData(getManagementComparison(workbook));
      setSocialGroupData(getSocialGroupComparison(workbook));
      setActionItems(getPriorityActionItems(workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictActionItems(workbook));

      setSatRankingSem2(getSATDistrictRanking(workbook));
      setSatGradeWiseSem2(getSATGradeWise(workbook));
      setSatSummarySem2(getSATStateSummary(workbook));
      setSatSubjectWiseSem2(getSATSubjectWise(workbook));

      setSatRankingSem1(getSATSem1DistrictRanking(sem1Workbook));
      setSatGradeWiseSem1(getSATSem1GradeWise(sem1Workbook));
      setSatSummarySem1(getSATSem1StateSummary(sem1Workbook));
      setSatSubjectWiseSem1(getSATSem1SubjectWise(sem1Workbook));
      setSatSubjectRowsSem1(getSATSem1DistrictSubjectWise(sem1Workbook));
      setSatSubjectRowsSem2(getSATDistrictSubjectWise(workbook));

      setSatSemesterComparison(getSATSemesterComparison(workbook, sem1Workbook));

    }

    fetchData();

  }, []);

  // Full PGI / PARAKH / SAT indicator-level breakdowns for whichever
  // district is picked in the filter above — loadExcel() is cached, so
  // this is cheap even though it looks like a second load.
  useEffect(() => {
    if (district === "All") {
      setDistrictPgiIndicators(null);
      setDistrictCompetencies(null);
      setDistrictLoBreakdown(null);
      return;
    }
    let cancelled = false;
    loadExcel().then((workbook) => {
      if (cancelled) return;
      setDistrictPgiIndicators(getDistrictPGIIndicators(workbook, district));
      setDistrictCompetencies({
        g3: getDistrictCompetencies(workbook, "PARAKH_Foundational_G3", district),
        g6: getDistrictCompetencies(workbook, "PARAKH_Preparatory_G6", district),
        g9: getDistrictCompetencies(workbook, "PARAKH_Middle_G9", district),
      });
      setDistrictLoBreakdown(getSATDistrictLOBreakdown(workbook, district));
    });
    return () => {
      cancelled = true;
    };
  }, [district]);

  // -----------------------------
  // District List
  // -----------------------------

  const districts = [
    "All",
    ...new Set(
      parakhData.map(
        (item) => item.District
      )
    ),
  ];
  const dropdownDistricts = priorityOnly
    ? ["All", ...districts.slice(1).filter((d) => isPriorityDistrict(d))]
    : districts;

  // -----------------------------
  // Filter Data (District only — Stage/Subject change WHICH score is
  // shown, not which rows are included)
  // -----------------------------

  const filteredData = parakhData.filter((item) => {

    if (
      district !== "All" &&
      item.District !== district
    ) {
      return false;
    }

    if (priorityOnly && !isPriorityDistrict(item.District)) {
      return false;
    }

    return true;

  });

  // -----------------------------
  // Selected Stage
  // -----------------------------

  const selectedColumn =
    stage === "Foundational"
      ? "Foundational"
      : stage === "Preparatory"
      ? "Preparatory"
      : stage === "Middle"
      ? "Middle"
      : "Overall";

  // -----------------------------
  // Subject lookup — "Language"/"Mathematics" scores live in the
  // Subject-wise heat-map (per Grade), not in Dashboard_PARAKH. This maps
  // {District -> {"Grade 3 - Language": 0.42, ...}} so the Subject filter
  // actually changes the numbers instead of being a no-op dropdown.
  // -----------------------------

  const subjectByDistrict = Object.fromEntries(
    subjectHeatmap.data.map((row) => [row.District, row])
  );

  const stageToGrade = {
    Foundational: "Grade 3",
    Preparatory: "Grade 6",
    Middle: "Grade 9",
  };

  const getScore = (item) => {

    if (subject === "Overall") {
      return item[selectedColumn] || 0;
    }

    const subjRow = subjectByDistrict[item.District];
    if (!subjRow) return item[selectedColumn] || 0;

    const subjLabel = subject === "Math" ? "Mathematics" : "Language";

    if (stage !== "Overall") {
      const col = `${stageToGrade[stage]} - ${subjLabel}`;
      return subjRow[col] ?? 0;
    }

    // Stage = Overall + a specific Subject -> average that subject
    // across all grades that have it (Language: G3/G6/G9, Math: G3/G6/G9).
    const matchingValues = Object.keys(subjRow)
      .filter((key) => key.endsWith(`- ${subjLabel}`))
      .map((key) => subjRow[key])
      .filter((v) => typeof v === "number");

    return matchingValues.length
      ? matchingValues.reduce((a, b) => a + b, 0) / matchingValues.length
      : 0;

  };

  // -----------------------------
  // KPI — state-wide (respects Stage/Subject, but NOT the District filter,
  // so these top stat cards stay put just like the leaderboard below).
  // -----------------------------

  const totalDistricts =
    parakhData.length;

  const validScores =
    parakhData.filter(
      (d) =>
        !isNaN(getScore(d))
    );

  const averageScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce(
            (sum, d) =>
              sum + getScore(d),
            0
          ) /
            validScores.length *
            100
        )
      : 0;

  const topDistrict =
    parakhData.length > 0
      ? [...parakhData].sort(
          (a, b) =>
            getScore(b) -
            getScore(a)
        )[0]
      : {};

  const lowestDistrict =
    parakhData.length > 0
      ? [...parakhData].sort(
          (a, b) =>
            getScore(a) -
            getScore(b)
        )[0]
      : {};

  // -----------------------------
  // Chart Data
  // -----------------------------

  const chartData =
    [...filteredData]
      .sort(
        (a, b) =>
          getScore(b) -
          getScore(a)
      )
      .map((item) => ({
        District: item.District,
        Score: Number(
          (
            getScore(item) * 100
          ).toFixed(1)
        ),
      }));

// -----------------------------
// Leaderboard (Top 5 / Bottom 5) — always ranks ALL 33 districts (never
// narrows to one district, so it stays put when the District filter
// changes), but DOES follow Stage/Subject — otherwise picking
// "Foundational" here would still rank by the Overall column, which
// looks wrong next to KPI cards that are clearly showing Foundational
// numbers.
// -----------------------------

const stateWideRanked = [...parakhData].sort(
  (a, b) => getScore(b) - getScore(a)
);

const stateWideChartData = stateWideRanked.map((item) => ({
  District: item.District,
  Score: Number((getScore(item) * 100).toFixed(1)),
}));

const top5Districts = stateWideChartData.slice(0, 5);

const bottom5Districts = [...stateWideChartData].reverse().slice(0, 5);

// -----------------------------
// Bar Chart Data — when a single district is filtered, add the Gujarat
// state average alongside it so the chart always has context to compare
// against, instead of one bar floating alone.
// -----------------------------

const stateAverageForColumn =
  parakhData.length > 0
    ? parakhData.reduce((sum, d) => sum + (getScore(d) || 0), 0) /
      parakhData.length
    : 0;

const barChartData =
  district !== "All"
    ? [
        ...chartData,
        {
          District: "Gujarat State Average",
          Score: Number((stateAverageForColumn * 100).toFixed(1)),
          isAverage: true,
        },
      ]
    : chartData;

// District Performance Table

const districtTableData = [...filteredData]
  .sort((a, b) => b.Overall - a.Overall)
  .map((item, index) => ({
    Rank: index + 1,
    District: item.District,
    Foundational: (item.Foundational * 100).toFixed(1),
    Preparatory: (item.Preparatory * 100).toFixed(1),
    Middle: (item.Middle * 100).toFixed(1),
    Overall: (item.Overall * 100).toFixed(1),
  }));

// -----------------------------
// PGI-D 2.0 — Top5/Bottom5, filtered chart (+ state average when a single
// district is selected), and full ranking table. PGI only has a District
// axis (no Stage/Subject), so it only responds to the district filter.
// -----------------------------

const pgiSortedByScore = [...pgiRanking].sort(
  (a, b) => b.PercentAchieved - a.PercentAchieved
);

// District -> PGI % achieved lookup, used to shade the district map in
// the DistrictFilterBar (src/components/GujaratDistrictMap.jsx) so the
// map's colours mean something instead of being flat.
const pgiByDistrict = Object.fromEntries(
  pgiRanking.map((d) => [d.District, d.PercentAchieved])
);

const pgiChartAll = pgiSortedByScore.map((d) => ({
  District: d.District,
  Score: Number(d.PercentAchieved.toFixed(1)),
}));

const pgiTop5 = pgiChartAll.slice(0, 5);
const pgiBottom5 = [...pgiChartAll].reverse().slice(0, 5);

const pgiStateAverage =
  pgiRanking.length > 0
    ? pgiRanking.reduce((sum, d) => sum + d.PercentAchieved, 0) / pgiRanking.length
    : 0;

const pgiTableDataAll = [...pgiRanking]
  .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
  .map((d, index) => ({
    Rank: index + 1,
    District: d.District,
    Score: d.Score,
    PercentAchieved: d.PercentAchieved,
    Grade: d.Grade,
  }));

const pgiTableData = pgiTableDataAll
  .filter((d) => district === "All" || d.District === district)
  .filter((d) => !priorityOnly || isPriorityDistrict(d.District));

// 2025-26 PGI-D ranking, filtered the same way as the 2024-25 table above,
// so the "District-wise PGI-D % Achieved" chart can plot both years side
// by side instead of only ever showing 2024-25.
const pgiTableDataAll2526 = [...pgiD202526.ranking]
  .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
  .map((d, index) => ({
    Rank: index + 1,
    District: d.District,
    Score: d.Score,
    PercentAchieved: d.PercentAchieved,
    Grade: d.Grade,
  }));

const pgiTableData2526 = pgiTableDataAll2526
  .filter((d) => district === "All" || d.District === district)
  .filter((d) => !priorityOnly || isPriorityDistrict(d.District));

// -----------------------------
// Priority Districts Spotlight — the state's 10 focus districts, pulled
// out with PARAKH + both years of PGI side by side so leadership doesn't
// have to hunt through the full 33-district tables to check on them.
// Sorted by 2025-26 PGI % ascending (lowest/most-in-need first).
// -----------------------------

const pgi2526ByDistrict = Object.fromEntries(
  pgiD202526.ranking.map((d) => [d.District, d])
);

const priorityRows = PRIORITY_DISTRICTS.map((name) => {
  const parakhEntry = stateWideChartData.find((d) => d.District === name);
  const pgi2425 = pgiByDistrict[name] ?? null;
  const pgi2526 = pgi2526ByDistrict[name]?.PercentAchieved ?? null;
  return {
    District: name,
    parakh: parakhEntry?.Score ?? null,
    pgi2425,
    pgi2526,
    delta: pgi2425 != null && pgi2526 != null ? Math.round((pgi2526 - pgi2425) * 10) / 10 : null,
  };
}).sort((a, b) => (a.pgi2526 ?? 999) - (b.pgi2526 ?? 999));

// -----------------------------
// SAT (Student Assessment Test) — Top5/Bottom5, filtered chart (+ state
// average when a single district is selected), grade-wise chart, and full
// ranking table. Like PGI, SAT only has a District axis, so it only
// responds to the district filter above.
// -----------------------------

// -----------------------------
// Sem 1 vs Sem 2 comparison data — always both semesters; the state
// summary box above now always shows both too, so there's no separate
// single-semester toggle left driving anything on this page.
// -----------------------------

const satDistrictComparisonChartAll = satSemesterComparison.map((d) => ({
  District: d.District,
  "Sem 1": d.Sem1Pct != null ? Number(d.Sem1Pct.toFixed(1)) : null,
  "Sem 2": d.Sem2Pct != null ? Number(d.Sem2Pct.toFixed(1)) : null,
}));

const satDistrictComparisonChartData =
  district !== "All"
    ? satDistrictComparisonChartAll.filter((d) => d.District === district)
    : satDistrictComparisonChartAll;

const satGradeComparisonChartData = (() => {
  const grades = [...new Set([...satGradeWiseSem2.grades, ...satGradeWiseSem1.grades])];
  const showStateAvgBg = district !== "All" || priorityOnly;

  const avgAcrossPriority = (dataset, grade) => {
    const vals = dataset
      .filter((d) => isPriorityDistrict(d.District))
      .map((d) => d[grade])
      .filter((v) => typeof v === "number");
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  return grades.map((grade) => {
    const stateSem1 = satSummarySem1.gradeAverages.find((g) => g.grade === grade)?.average;
    const stateSem2 = satSummarySem2.gradeAverages.find((g) => g.grade === grade)?.average;

    let sem1Value;
    let sem2Value;

    if (district !== "All") {
      sem1Value = satGradeWiseSem1.data.find((d) => d.District === district)?.[grade];
      sem2Value = satGradeWiseSem2.data.find((d) => d.District === district)?.[grade];
    } else if (priorityOnly) {
      sem1Value = avgAcrossPriority(satGradeWiseSem1.data, grade);
      sem2Value = avgAcrossPriority(satGradeWiseSem2.data, grade);
    } else {
      sem1Value = stateSem1;
      sem2Value = stateSem2;
    }

    return {
      grade,
      "Sem 1": sem1Value != null ? Number(sem1Value.toFixed(1)) : null,
      "Sem 2": sem2Value != null ? Number(sem2Value.toFixed(1)) : null,
      "Sem 1 (State Avg)": showStateAvgBg && stateSem1 != null ? Number(stateSem1.toFixed(1)) : null,
      "Sem 2 (State Avg)": showStateAvgBg && stateSem2 != null ? Number(stateSem2.toFixed(1)) : null,
    };
  });
})();

const satSubjectComparisonChartData = (() => {
  const subjects = [
    ...new Set([
      ...satSubjectWiseSem2.map((s) => s.subject),
      ...satSubjectWiseSem1.map((s) => s.subject),
    ]),
  ];

  const stateAvgBySubject = (rows) => {
    const bucket = {};
    rows.forEach((s) => {
      if (!bucket[s.subject]) bucket[s.subject] = { total: 0, count: 0 };
      bucket[s.subject].total += s.PercentAchieved;
      bucket[s.subject].count += 1;
    });
    return Object.fromEntries(
      Object.entries(bucket).map(([subj, b]) => [subj, b.count ? b.total / b.count : null])
    );
  };

  const sem1StateAvg = stateAvgBySubject(satSubjectRowsSem1);
  const sem2StateAvg = stateAvgBySubject(satSubjectRowsSem2);

  return subjects.map((subject) => {
    const stateSem1 = sem1StateAvg[subject];
    const stateSem2 = sem2StateAvg[subject];

    let sem1Value;
    let sem2Value;

    if (district !== "All") {
      sem1Value = satSubjectRowsSem1.find((s) => s.District === district && s.subject === subject)?.PercentAchieved;
      sem2Value = satSubjectRowsSem2.find((s) => s.District === district && s.subject === subject)?.PercentAchieved;
    } else {
      sem1Value = satSubjectWiseSem1.find((s) => s.subject === subject)?.PercentAchieved;
      sem2Value = satSubjectWiseSem2.find((s) => s.subject === subject)?.PercentAchieved;
    }

    return {
      subject,
      "Sem 1": sem1Value != null ? Number(sem1Value.toFixed(1)) : null,
      "Sem 2": sem2Value != null ? Number(sem2Value.toFixed(1)) : null,
      "Sem 1 (State Avg)": district !== "All" && stateSem1 != null ? Number(stateSem1.toFixed(1)) : null,
      "Sem 2 (State Avg)": district !== "All" && stateSem2 != null ? Number(stateSem2.toFixed(1)) : null,
    };
  });
})();

  // -----------------------------
  // Return
  // -----------------------------

  return (
        <DashboardLayout>

      <Header />

      {/* The PARAKH / PGI-D headline KPI rows used to live here as gradient
          cards, but they duplicated numbers the Executive Snapshot panel
          below already covers (state average, top/bottom districts,
          priority split) — removed so the snapshot panel gets the space
          and reads as the primary "first thing you see" block instead of
          competing with a KPI strip above it. */}

      <ExecutiveOverviewPanel
        parakhData={stateWideChartData}
        pgiRanking={pgiD202526.ranking}
        satData={satSemesterComparison}
        priorityOnly={priorityOnly}
        districts={districts}
        district={district}
        setDistrict={setDistrict}
      />

{/* District Ranking */}

<DistrictFilterBar
  district={district}
  setDistrict={setDistrict}
  districts={dropdownDistricts}
  priorityOnly={priorityOnly}
  onPriorityOnlyChange={(v) => {
    setPriorityOnly(v);
    if (v && district !== "All" && !isPriorityDistrict(district)) setDistrict("All");
  }}
/>

<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2.5, mb: 1 }}>
  <Box sx={{ width: 4, height: 26, borderRadius: 2, bgcolor: "#1976D2" }} />
  <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#16233B" }}>
    📚 PARAKH — Learning Outcomes
  </Typography>
</Box>
<Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
  District-wise mastery by grade band
</Typography>

<NationalBenchmarkPanel
  district={district}
  subjectData={subjectHeatmap.data}
  genderData={genderData.data}
  locationData={locationData.data}
  managementData={managementData.data}
  socialGroupData={socialGroupData.data}
/>

<Paper
  elevation={0}
  sx={{
    p: 2.5,
    borderRadius: 3,
    mb: 2,
    mt: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
    border: "1px solid #E4E7F0",
    bgcolor: "#FBFBFE",
  }}
>

  <Typography
    sx={{
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
      fontSize: 17,
      color: "#16233B",
    }}
  >
    District Ranking Explorer
  </Typography>

  <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>

    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, fontWeight: 600, color: "#2E7D32" }}>
      ● HIGH ≥45%
    </Typography>

    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, fontWeight: 600, color: "#FB8C00" }}>
      ● MEDIUM 40–44.99%
    </Typography>

    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12.5, fontWeight: 600, color: "#D32F2F" }}>
      ● LOW &lt;40%
    </Typography>

  </Box>

</Paper>


<Box mt={2}>

  <Card elevation={3}>

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
  District-wise Overall Performance (%)
</Typography>

           <ResponsiveContainer
        width="100%"
        height={420}
      >

        <BarChart
          data={barChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 100,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="District"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 10 }}
          />

          <YAxis domain={[0, 100]} />

          <Tooltip
            formatter={(value) => `${value}%`}
          />

         <Bar
  dataKey="Score"
  barSize={20}
  radius={[6, 6, 0, 0]}
>

  {barChartData.map((entry, index) => (

    <Cell
      key={index}
      fill={
        entry.isAverage
          ? "#0F172A"   // Gujarat State Average - navy, visually distinct
          : entry.Score >= 45
          ? "#2E7D32"   // Green
          : entry.Score >= 40
          ? "#FB8C00"   // Orange
          : "#D32F2F"   // Red
      }
    />

  ))}

  <LabelList
    dataKey="Score"
    position="top"
    formatter={(value) => `${value}%`}
    style={{
      fontSize: 11,
      fontWeight: "bold",
      fill: "#333",
    }}
  />
          </Bar>

        </BarChart>

      </ResponsiveContainer>

    </CardContent>

  </Card>

</Box>

<DistrictTable
  data={districtTableData}
/>

{/* PGI 2.0 — District Explorer */}
<Box mt={5} mb={2}>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 4, height: 26, borderRadius: 2, bgcolor: "#F0B429" }} />
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#16233B" }}>
        🏛️ PGI 2.0 — Governance Score
      </Typography>
    </Box>

    <Button
      component={RouterLink}
      to="/pgi"
      endIcon={<ArrowForwardIcon />}
      sx={{ textTransform: "none", fontWeight: 600 }}
    >
      View full PGI 2.0 Dashboard
    </Button>
  </Box>
  <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, ml: 2.5 }}>
    Filtered by the same District selector above · out of 1000 (state) / 600 (district)
  </Typography>
</Box>

<Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", p: 3, mb: 2 }}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#F5F6FA", textAlign: "center", height: "100%" }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>STATE OVERALL SCORE</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mt: 0.5 }}>
          <Box>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 600 }}>2024-25</Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: colors.navyLight }}>
              {pgiSummary.overall?.score?.toFixed(1) ?? "-"}
              <Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
                {" "}/ {pgiSummary.overall?.maxWeight ?? 1000}
              </Typography>
            </Typography>
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, fontWeight: 700, color: colors.navyLight }}>
              {pgiSummary.overall?.grade || "-"} · {pgiSummary.overall?.percentAchieved?.toFixed(1) ?? 0}%
            </Typography>
          </Box>
          <Box sx={{ borderTop: "1px dashed #D8DCE6", pt: 0.6, mt: 0.2 }}>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 600 }}>2025-26</Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#8A6200" }}>
              {statePgi202526.overall?.score?.toFixed(1) ?? "-"}
              <Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
                {" "}/ {statePgi202526.overall?.maxWeight ?? 1000}
              </Typography>
            </Typography>
            <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, fontWeight: 700, color: "#F0B429" }}>
              {statePgi202526.overall?.grade || "-"} · {statePgi202526.overall?.percentAchieved?.toFixed(1) ?? 0}%
              {pgiSummary.overall?.percentAchieved != null && statePgi202526.overall?.percentAchieved != null && (
                <>
                  {" "}({(statePgi202526.overall.percentAchieved - pgiSummary.overall.percentAchieved >= 0 ? "+" : "") +
                    (Math.round((statePgi202526.overall.percentAchieved - pgiSummary.overall.percentAchieved) * 10) / 10)}
                  pp)
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>

    <Grid size={{ xs: 12, sm: 8 }}>
      <Grid container spacing={1}>
        {pgiSummary.domains.slice(0, 6).map((d) => {
          const d2526 = statePgi202526.domains.find((x) => x.domain === d.domain);
          return (
            <Grid size={{ xs: 6, md: 4 }} key={d.domain}>
              <Box sx={{ p: 1.2 }}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.domain.split(" - ")[0].replace("Domain ", "D")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                    <Box sx={{ width: `${Math.min(d.percentAchieved, 100)}%`, height: "100%", bgcolor: colors.navyLight }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 700, width: 66, textAlign: "right" }}>
                    {d.percentAchieved.toFixed(0)}% (24-25)
                  </Typography>
                </Box>
                {d2526 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                    <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                      <Box sx={{ width: `${Math.min(d2526.percentAchieved, 100)}%`, height: "100%", bgcolor: colors.gold }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 700, width: 66, textAlign: "right", color: "#8A6200" }}>
                      {d2526.percentAchieved.toFixed(0)}% (25-26)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  </Grid>
</Paper>

<PGIRankingChart
  data={pgiTableData}
  allData={pgiTableDataAll}
  data2526={pgiTableData2526}
  allData2526={pgiTableDataAll2526}
/>

<PGITable
  data={pgiTableData}
  allData={pgiTableDataAll}
  data2526={pgiTableData2526}
  allData2526={pgiTableDataAll2526}
/>

{/* SAT — Student Assessment Test */}
<Box mt={5} mb={2}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box sx={{ width: 4, height: 26, borderRadius: 2, bgcolor: "#6A1B9A" }} />
    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#16233B" }}>
      📝 SAT — Student Assessment Test
    </Typography>
  </Box>
  <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, ml: 2.5 }}>
    District-wise SAT performance — Semester 1 vs Semester 2, plus the full comparison below · filtered by the same District selector above
  </Typography>
</Box>

<Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", p: 3, mb: 2 }}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#F5F6FA", textAlign: "center", height: "100%" }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>STATE AVERAGE SCORE</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mt: 0.5 }}>
          <Box>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 600 }}>Semester 1</Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: colors.navyLight }}>
              {satSummarySem1.stateAverage.toFixed(1)}
              <Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}> %</Typography>
            </Typography>
          </Box>
          <Box sx={{ borderTop: "1px dashed #D8DCE6", pt: 0.6, mt: 0.2 }}>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 600 }}>Semester 2</Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#8A6200" }}>
              {satSummarySem2.stateAverage.toFixed(1)}
              <Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}> %</Typography>
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 700, color: "#6A1B9A", mt: 0.8 }}>
          {(satSummarySem2.totalDistricts || satSummarySem1.totalDistricts)} Districts Covered
        </Typography>
      </Box>
    </Grid>

    <Grid size={{ xs: 12, sm: 8 }}>
      <Grid container spacing={1}>
        {[...new Set([...satGradeWiseSem1.grades, ...satGradeWiseSem2.grades])].map((grade) => {
          const avgSem1 = satSummarySem1.gradeAverages.find((g) => g.grade === grade)?.average || 0;
          const avgSem2 = satSummarySem2.gradeAverages.find((g) => g.grade === grade)?.average || 0;
          return (
            <Grid size={{ xs: 6, md: 4 }} key={grade}>
              <Box sx={{ p: 1.2 }}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {grade}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                    <Box sx={{ width: `${Math.min(avgSem1, 100)}%`, height: "100%", bgcolor: colors.navyLight }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 700, width: 68, textAlign: "right" }}>
                    {avgSem1.toFixed(0)}% (Sem1)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                    <Box sx={{ width: `${Math.min(avgSem2, 100)}%`, height: "100%", bgcolor: colors.gold }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 700, width: 68, textAlign: "right", color: "#8A6200" }}>
                    {avgSem2.toFixed(0)}% (Sem2)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  </Grid>
</Paper>

{satGradeComparisonChartData.length > 0 && (
  <Card elevation={3} sx={{ mt: 2 }}>
    <CardContent>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
        SAT — Grade-wise Performance (%) · Semester 1 vs Semester 2
        {district !== "All"
          ? ` · ${district} vs Gujarat State Average`
          : priorityOnly
          ? " · ⭐ Priority Districts Avg vs Gujarat State Average"
          : " · Gujarat State Average"}
      </Typography>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={satGradeComparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => (value == null ? "—" : `${Number(value).toFixed(1)}%`)} />
          <Legend />
          <Bar dataKey="Sem 1" fill={colors.navyLight} radius={[4, 4, 0, 0]} barSize={district !== "All" ? 18 : 30} />
          <Bar dataKey="Sem 2" fill={colors.gold} radius={[4, 4, 0, 0]} barSize={district !== "All" ? 18 : 30} />
          <Bar dataKey="Sem 1 (State Avg)" fill="#B7C0D1" radius={[4, 4, 0, 0]} barSize={18} />
          <Bar dataKey="Sem 2 (State Avg)" fill="#F0D9A6" radius={[4, 4, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)}

{satSubjectComparisonChartData.length > 0 && (
  <Card elevation={3} sx={{ mt: 2 }}>
    <CardContent>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
        SAT — Subject-wise Performance (%) · Semester 1 vs Semester 2{district !== "All" ? ` · ${district} vs Gujarat State Average` : " · Gujarat State-wide"}
      </Typography>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={satSubjectComparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => (value == null ? "—" : `${Number(value).toFixed(1)}%`)} />
          <Legend />
          <Bar dataKey="Sem 1" fill={colors.navyLight} radius={[4, 4, 0, 0]} barSize={district !== "All" ? 14 : 22} />
          <Bar dataKey="Sem 2" fill={colors.gold} radius={[4, 4, 0, 0]} barSize={district !== "All" ? 14 : 22} />
          <Bar dataKey="Sem 1 (State Avg)" fill="#B7C0D1" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="Sem 2 (State Avg)" fill="#F0D9A6" radius={[4, 4, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)}

<SATSemesterComparison
  data={satSemesterComparison}
  district={district}
  priorityDistricts={priorityOnly ? PRIORITY_DISTRICTS : []}
/>

{district !== "All" && (districtPgiIndicators?.overall || districtCompetencies || districtLoBreakdown?.length > 0) && (
  <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2.5, border: "1px solid #E4E7F0" }} elevation={0}>
    <CardContent>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 20, color: "#16233B", mb: 0.5 }}>
        🔎 {district} — Weakest Indicators, Across PGI, PARAKH & SAT
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
        The same weakest-indicator breakdown each individual page shows, combined here since this Dashboard already
        covers all three.
      </Typography>

      {districtPgiIndicators?.overall && (
        <>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, color: "#16233B", mb: 1 }}>
            🏛️ PGI-D 2.0 — Full Indicator Breakdown (70 Indicators) — 2024-25 vs 2025-26
          </Typography>
          <PGIIndicatorSection
            indicators={districtPgiIndicators.indicators}
            domainSummary={districtPgiIndicators.domainSummary}
            overall={districtPgiIndicators.overall}
            indicators2={districtPgiIndicators202526[district]?.indicators ?? null}
            overall2={districtPgiIndicators202526[district]?.overall ?? null}
            label="24-25"
            label2="25-26"
          />
        </>
      )}

      {districtCompetencies && (
        <>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, color: "#16233B", mt: 2.5, mb: 1 }}>
            📖 PARAKH — Competency-wise Mastery vs National Benchmark
          </Typography>
          <PARAKHCompetencySection competencies={districtCompetencies} />
        </>
      )}

      {districtLoBreakdown?.length > 0 && (
        <>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, color: "#16233B", mt: 2.5, mb: 1 }}>
            📝 SAT — Learning-Outcome Breakdown
          </Typography>
          <SATLOBreakdownSection los={districtLoBreakdown} />
        </>
      )}
    </CardContent>
  </Card>
)}

<ActionItemsQueue
  items={actionItems}
  allDistricts={allDistrictNames}
  allItems={allDistrictItems}
  syncDistrict={district}
  focusDistricts={priorityOnly ? PRIORITY_DISTRICTS : []}
/>

</DashboardLayout>
);

};

export default Dashboard;