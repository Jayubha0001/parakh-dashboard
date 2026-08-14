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
import { colors } from "../theme/theme";

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
import DropdownFilter from "../components/DropdownFilter";

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
  const [satSemester, setSatSemester] = useState("sem2");

  const [district, setDistrict] = useState("All");

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

const pgiTableData =
  district !== "All"
    ? pgiTableDataAll.filter((d) => d.District === district)
    : pgiTableDataAll;

// -----------------------------
// SAT (Student Assessment Test) — Top5/Bottom5, filtered chart (+ state
// average when a single district is selected), grade-wise chart, and full
// ranking table. Like PGI, SAT only has a District axis, so it only
// responds to the district filter above.
// -----------------------------

// Active SAT dataset, based on the Semester 1 / Semester 2 toggle.
const satGradeWise = satSemester === "sem1" ? satGradeWiseSem1 : satGradeWiseSem2;
const satSummary = satSemester === "sem1" ? satSummarySem1 : satSummarySem2;

// -----------------------------
// Sem 1 vs Sem 2 comparison data — always both semesters, independent
// of the satSemester toggle above (which only drives the KPI/table).
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

  return grades.map((grade) => {
    const stateSem1 = satSummarySem1.gradeAverages.find((g) => g.grade === grade)?.average;
    const stateSem2 = satSummarySem2.gradeAverages.find((g) => g.grade === grade)?.average;

    let sem1Value;
    let sem2Value;

    if (district !== "All") {
      sem1Value = satGradeWiseSem1.data.find((d) => d.District === district)?.[grade];
      sem2Value = satGradeWiseSem2.data.find((d) => d.District === district)?.[grade];
    } else {
      sem1Value = stateSem1;
      sem2Value = stateSem2;
    }

    return {
      grade,
      "Sem 1": sem1Value != null ? Number(sem1Value.toFixed(1)) : null,
      "Sem 2": sem2Value != null ? Number(sem2Value.toFixed(1)) : null,
      "Sem 1 (State Avg)": district !== "All" && stateSem1 != null ? Number(stateSem1.toFixed(1)) : null,
      "Sem 2 (State Avg)": district !== "All" && stateSem2 != null ? Number(stateSem2.toFixed(1)) : null,
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

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 4,
          border: "1px solid #E4E7F0",
          overflow: "hidden",
        }}
      >
        <Grid container>
          {[
            {
              group: "PARAKH",
              label: "Districts Covered",
              value: totalDistricts,
              suffix: "",
              accent: "#1976D2",
            },
            {
              group: "PARAKH",
              label: "State Average",
              value: averageScore,
              suffix: "%",
              accent: "#2E7D32",
            },
            {
              group: "PARAKH",
              label: "Top District",
              value: topDistrict?.District || "-",
              suffix: "",
              accent: "#F0B429",
              sub: `${chartData[0]?.Score || 0}%`,
              isText: true,
            },
            {
              group: "PARAKH",
              label: "Needs Support",
              value: lowestDistrict?.District || "-",
              suffix: "",
              accent: "#D32F2F",
              sub: `${chartData[chartData.length - 1]?.Score || 0}%`,
              isText: true,
            },
            {
              group: "PGI-D 2.0",
              label: "State Score",
              value: pgiSummary.overall?.percentAchieved?.toFixed(1) ?? "-",
              suffix: "%",
              accent: "#1976D2",
            },
            {
              group: "PGI-D 2.0",
              label: "State Average",
              value: pgiStateAverage.toFixed(1),
              suffix: "%",
              accent: "#2E7D32",
            },
            {
              group: "PGI-D 2.0",
              label: "Top District",
              value: pgiTop5[0]?.District || "-",
              suffix: "",
              accent: "#F0B429",
              sub: `${pgiTop5[0]?.Score || 0}%`,
              isText: true,
            },
            {
              group: "PGI-D 2.0",
              label: "Needs Support",
              value: pgiBottom5[0]?.District || "-",
              suffix: "",
              accent: "#D32F2F",
              sub: `${pgiBottom5[0]?.Score || 0}%`,
              isText: true,
            },
          ].map((stat, i) => (
            <Grid
              size={{ xs: 6, sm: 3, md: 1.5 }}
              key={stat.group + stat.label}
              sx={{
                p: 2.5,
                borderRight: { sm: i !== 3 && i !== 7 ? "1px solid #E4E7F0" : "none" },
                borderLeft: i === 4 ? { sm: "3px solid #0F172A" } : "none",
                borderBottom: { xs: i < 6 ? "1px solid #E4E7F0" : "none", sm: "none" },
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mb: 1 }}>
                <Box sx={{ width: 20, height: 3, borderRadius: 2, bgcolor: stat.accent }} />
                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: "text.secondary", letterSpacing: 0.5 }}>
                  {stat.group}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 11, color: "text.secondary", letterSpacing: 0.3 }}>
                {stat.label.toUpperCase()}
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: 700,
                  fontSize: stat.isText ? 18 : 26,
                  mt: 0.3,
                  color: "#16233B",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {stat.value}
                {stat.suffix}
              </Typography>

              {stat.sub && (
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontWeight: 600,
                    fontSize: 13,
                    color: stat.accent,
                  }}
                >
                  {stat.sub}
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Leaderboard: Top 5 / Bottom 5 — PARAKH + PGI-D */}
      <Grid container spacing={3} mt={0.5}>
        {[
          { title: "Top PARAKH Districts", icon: "🎓", data: top5Districts, rankBase: 1, tone: "success.main", subtitle: `Ranked by: ${stage}${subject !== "Overall" ? ` · ${subject}` : ""}` },
          { title: "PARAKH — Needs Support", icon: "📉", data: bottom5Districts, rankBase: 33, tone: "error.main", reverse: true, subtitle: `Ranked by: ${stage}${subject !== "Overall" ? ` · ${subject}` : ""}` },
          { title: "Top PGI-D 2.0 Districts", icon: "🏛️", data: pgiTop5, rankBase: 1, tone: "success.main" },
          { title: "PGI-D 2.0 — Needs Support", icon: "📉", data: pgiBottom5, rankBase: 33, tone: "error.main", reverse: true },
        ].map((panel) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={panel.title}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Typography
                  sx={{
                    fontFamily: '"Fraunces", serif',
                    fontWeight: 600,
                    fontSize: 18,
                    mb: panel.subtitle ? 0.3 : 2,
                  }}
                >
                  {panel.icon} {panel.title}
                </Typography>

                {panel.subtitle && (
                  <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 1.5 }}>
                    {panel.subtitle}
                  </Typography>
                )}

                {panel.data.map((item, index) => {
                  const rank = panel.reverse ? panel.rankBase - index : panel.rankBase + index;
                  const medal = rank === 1 ? "#F0B429" : rank === 2 ? "#9AA5B1" : rank === 3 ? "#B08D57" : "transparent";
                  const medalText = rank <= 3 && !panel.reverse ? "#fff" : "#16233B";

                  return (
                    <Box
                      key={item.District}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1.1,
                        borderBottom: index < panel.data.length - 1 ? "1px solid #EEF0F5" : "none",
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: '"IBM Plex Mono", monospace',
                          bgcolor: !panel.reverse && rank <= 3 ? medal : "#F1F3F8",
                          color: !panel.reverse && rank <= 3 ? medalText : "#5B6B85",
                          border: !panel.reverse && rank <= 3 ? "none" : "1px solid #E4E7F0",
                        }}
                      >
                        {rank}
                      </Box>

                      <Typography
                        sx={{
                          flex: 1,
                          fontWeight: 500,
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.District}
                      </Typography>

                      <Box sx={{ width: 70, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${Math.min(item.Score, 100)}%`,
                            height: "100%",
                            bgcolor: panel.reverse ? "#D32F2F" : "#2E7D32",
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontWeight: 700,
                          fontSize: 13,
                          width: 46,
                          textAlign: "right",
                          color: panel.reverse ? "error.main" : "success.main",
                        }}
                      >
                        {item.Score}%
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

{/* District Ranking */}

<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 5, mb: 1 }}>
  <Box sx={{ width: 4, height: 26, borderRadius: 2, bgcolor: "#1976D2" }} />
  <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#16233B" }}>
    📚 PARAKH — Learning Outcomes
  </Typography>
</Box>
<Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
  District-wise mastery by grade band
</Typography>

<DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />

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


<Box mt={3}>

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

<Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", p: 3, mb: 3 }}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#F5F6FA", textAlign: "center", height: "100%" }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>STATE OVERALL SCORE</Typography>
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 28, color: "#0F172A" }}>
          {pgiSummary.overall?.score?.toFixed(1) ?? "-"}
          <Typography component="span" sx={{ fontSize: 14, color: "text.secondary" }}>
            {" "}/ {pgiSummary.overall?.maxWeight ?? 1000}
          </Typography>
        </Typography>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 700, color: "#F0B429" }}>
          {pgiSummary.overall?.grade || "-"} · {pgiSummary.overall?.percentAchieved?.toFixed(1) ?? 0}%
        </Typography>
      </Box>
    </Grid>

    <Grid size={{ xs: 12, sm: 8 }}>
      <Grid container spacing={1}>
        {pgiSummary.domains.slice(0, 6).map((d) => (
          <Grid size={{ xs: 6, md: 4 }} key={d.domain}>
            <Box sx={{ p: 1.2 }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {d.domain.split(" - ")[0].replace("Domain ", "D")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                  <Box sx={{ width: `${Math.min(d.percentAchieved, 100)}%`, height: "100%", bgcolor: "#1976D2" }} />
                </Box>
                <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 700, width: 34 }}>
                  {d.percentAchieved.toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Grid>
  </Grid>
</Paper>

<PGIRankingChart data={pgiTableData} allData={pgiTableDataAll} />

<PGITable data={pgiTableData} allData={pgiTableDataAll} />

{/* SAT — Student Assessment Test */}
<Box mt={5} mb={2}>
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 4, height: 26, borderRadius: 2, bgcolor: "#6A1B9A" }} />
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#16233B" }}>
        📝 SAT — Student Assessment Test
      </Typography>
    </Box>

    <DropdownFilter
      minWidth={160}
      value={satSemester}
      onChange={(e) => setSatSemester(e.target.value)}
      options={[
        { value: "sem2", label: "Semester 2" },
        { value: "sem1", label: "Semester 1" },
      ]}
    />
  </Box>
  <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5, ml: 2.5 }}>
    District-wise SAT ({satSemester === "sem1" ? "Semester 1" : "Semester 2"}) performance, plus Semester 1 vs Semester 2 comparison below · filtered by the same District selector above
  </Typography>
</Box>

<Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", p: 3, mb: 3 }}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#F5F6FA", textAlign: "center", height: "100%" }}>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>STATE AVERAGE SCORE</Typography>
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 28, color: "#0F172A" }}>
          {satSummary.stateAverage.toFixed(1)}
          <Typography component="span" sx={{ fontSize: 14, color: "text.secondary" }}>
            {" "}%
          </Typography>
        </Typography>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 700, color: "#6A1B9A" }}>
          {satSummary.totalDistricts} Districts Covered
        </Typography>
      </Box>
    </Grid>

    <Grid size={{ xs: 12, sm: 8 }}>
      <Grid container spacing={1}>
        {satGradeWise.grades.map((grade) => {
          const avg = satSummary.gradeAverages.find((g) => g.grade === grade)?.average || 0;
          return (
            <Grid size={{ xs: 6, md: 4 }} key={grade}>
              <Box sx={{ p: 1.2 }}>
                <Typography sx={{ fontSize: 11, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {grade}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                    <Box sx={{ width: `${Math.min(avg, 100)}%`, height: "100%", bgcolor: "#6A1B9A" }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 700, width: 34 }}>
                    {avg.toFixed(0)}%
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
  <Card elevation={3} sx={{ mt: 3 }}>
    <CardContent>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
        SAT — Grade-wise Performance (%) · Semester 1 vs Semester 2{district !== "All" ? ` · ${district} vs Gujarat State Average` : " · Gujarat State Average"}
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
  <Card elevation={3} sx={{ mt: 3 }}>
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

<SATSemesterComparison data={satSemesterComparison} district={district} />

{district !== "All" && (districtPgiIndicators?.overall || districtCompetencies || districtLoBreakdown?.length > 0) && (
  <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
    <CardContent>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 20, color: "#16233B", mb: 0.5 }}>
        🔎 {district} — Weakest Indicators, Across PGI, PARAKH & SAT
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
        The same weakest-indicator breakdown each individual page shows, combined here since this Dashboard already
        covers all three.
      </Typography>

      {districtPgiIndicators?.overall && (
        <>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, color: "#16233B", mb: 1 }}>
            🏛️ PGI-D 2.0 — Full Indicator Breakdown (70 Indicators)
          </Typography>
          <PGIIndicatorSection
            indicators={districtPgiIndicators.indicators}
            domainSummary={districtPgiIndicators.domainSummary}
            overall={districtPgiIndicators.overall}
          />
        </>
      )}

      {districtCompetencies && (
        <>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, color: "#16233B", mt: 4, mb: 1 }}>
            📖 PARAKH — Competency-wise Mastery vs National Benchmark
          </Typography>
          <PARAKHCompetencySection competencies={districtCompetencies} />
        </>
      )}

      {districtLoBreakdown?.length > 0 && (
        <>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, color: "#16233B", mt: 4, mb: 1 }}>
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
/>

</DashboardLayout>
);

};

export default Dashboard;