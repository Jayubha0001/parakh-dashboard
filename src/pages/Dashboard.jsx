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

import DashboardHeroBanner, { DASHBOARD_KPI_ICONS } from "../components/DashboardHeroBanner";
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
  getSATWeakestLOs,
  getPGICategoryHeatmap,
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
import DashboardOverviewGrid from "../components/DashboardOverviewGrid";
import { periodOptionsFor } from "../utils/overviewConfig";
import { levelsByDistrict } from "../utils/overviewValues";
import OverviewCompare from "../components/OverviewCompare";
import { useFeatureFlags } from "../config/FeatureFlagsContext";
import OverviewFilters from "../components/OverviewFilters";
import statePgi202526 from "../data/statePgi202526.json";
import pgiD202526 from "../data/pgiD202526.json";
import districtPgiIndicators202526 from "../data/districtPgiIndicators202526.json";
import { PRIORITY_DISTRICTS, isPriorityDistrict } from "../utils/priorityDistricts";

const Dashboard = () => {
  const { flags } = useFeatureFlags();
  const on = (k) => flags[k] !== false;
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

  const [satWeakLOs, setSatWeakLOs] = useState([]);
  const [pgiHeat2425, setPgiHeat2425] = useState(null);
  const [district, setDistrict] = useState("All");
  const [priorityOnly, setPriorityOnly] = useState(false);

  // Overview-grid filters (Academic Year / Assessment / Grade). District
  // reuses the page-level `district` state above so the whole page follows.
  const [ovYear, setOvYear] = useState("Latest");
  const [ovAssessment, setOvAssessment] = useState("Overall");
  const [ovGrade, setOvGrade] = useState("All Grades");

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

      setPgiHeat2425(getPGICategoryHeatmap(workbook));
      setSatWeakLOs(getSATWeakestLOs(workbook, 4).map((x) => ({ label: `${x.grade ? x.grade + " · " : ""}${x.subject} · ${x.loCode}`, note: x.indicator, pct: x.PercentAchieved })));
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


  const enabledAssessments = [["Overall", "as_overall"], ["PGI-D", "as_pgi"], ["PARAKH", "as_parakh"], ["SAT", "as_sat"]].filter(([, k]) => on(k)).map(([a]) => a);
  useEffect(() => {
    if (enabledAssessments.length && !enabledAssessments.includes(ovAssessment)) {
      setOvAssessment(enabledAssessments[0]);
      setOvYear(periodOptionsFor(enabledAssessments[0])[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags]);
  const ovLevels = levelsByDistrict({ assessment: ovAssessment, year: ovYear, grade: ovGrade, pgiRanking2425: pgiRanking, parakhData, satComparison: satSemesterComparison, satGradeWise: satGradeWiseSem2, satGradeWiseSem1 });

  return (
        <DashboardLayout>

      <DashboardHeroBanner
        filters={
          <OverviewFilters
            year={ovYear}
            setYear={setOvYear}
            assessment={ovAssessment}
            setAssessment={setOvAssessment}
            grade={ovGrade}
            setGrade={setOvGrade}
            district={district}
            setDistrict={setDistrict}
            districtOptions={[...districts.slice(1)].sort((x, y) => x.localeCompare(y))}
            satGrades={satGradeWiseSem2.grades}
          />
        }
        kpis={!on("dash_kpis") ? [] : [
          ...(flags.dash_kpiCounts === true ? [
          { label: "Total Districts", value: districts.length - 1 || 33, icon: DASHBOARD_KPI_ICONS.districts },
          { label: "Priority Districts", value: PRIORITY_DISTRICTS.length, icon: DASHBOARD_KPI_ICONS.priority },
          { label: "Other Districts", value: (districts.length - 1 || 33) - PRIORITY_DISTRICTS.length, icon: DASHBOARD_KPI_ICONS.school },
          { label: "Programs Tracked", value: 4, icon: DASHBOARD_KPI_ICONS.programs },
          ] : []),
          (() => {
            const sel = district !== "All" ? district : null;
            const both = ovAssessment === "PGI-D" && ovYear === "Both Years";
            if (sel) {
              const v = ovLevels.level[sel];
              return { label: `${sel} · ${ovAssessment}${ovAssessment === "PGI-D" ? ` (${both ? "2025-26" : ovYear})` : ""}`, value: v != null ? `${v.toFixed(1)}%` : "—", icon: DASHBOARD_KPI_ICONS.pgi };
            }
            if (ovAssessment === "PGI-D") {
              const src = ovYear === "2024-25" ? pgiSummary.overall : statePgi202526.overall;
              return { label: `PGI-D Score (${ovYear === "2024-25" ? ovYear : "2025-26"})`, value: src?.score != null ? `${src.score.toFixed(1)}/1000` : "—", icon: DASHBOARD_KPI_ICONS.pgi };
            }
            const vals = Object.values(ovLevels.level);
            const av = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
            return { label: `${ovAssessment} State Avg`, value: av != null ? `${av.toFixed(1)}%` : "—", icon: DASHBOARD_KPI_ICONS.pgi };
          })(),
          (() => {
            const sem = ovAssessment === "SAT" ? ovYear : "Sem 2";
            const lv = levelsByDistrict({ assessment: "SAT", year: sem, grade: "All Grades", satComparison: satSemesterComparison }).level;
            const sel = district !== "All" ? district : null;
            const vals = Object.values(lv);
            const v = sel ? lv[sel] : vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
            return { label: `SAT ${sel || "State Avg"} (${sem})`, value: v != null ? `${v.toFixed(1)}%` : "—", icon: DASHBOARD_KPI_ICONS.sat };
          })(),
        ]}
      />

      <DashboardOverviewGrid
        year={ovYear}
        assessment={ovAssessment}
        grade={ovGrade}
        district={district}
        setDistrict={setDistrict}
        districts={districts}
        parakhData={parakhData}
        pgiRanking2425={pgiRanking}
        satComparison={satSemesterComparison}
        satGradeWise={satGradeWiseSem2}
        satGradeWiseSem1={satGradeWiseSem1}
        pgiState2425={pgiSummary.overall}
        pgiHeat2425={pgiHeat2425}
      />


{/* District Ranking */}

<>
    {(on("cmp_pgi") || on("cmp_sat") || on("cmp_pmshri") || on("dash_weakest")) && <OverviewCompare pgi2425={pgiSummary} pgiRanking2425={pgiRanking} sat1={satSummarySem1} sat2={satSummarySem2} satGw1={satGradeWiseSem1} satGw2={satGradeWiseSem2} subjectHeatmap={subjectHeatmap} district={district} assessment={ovAssessment}
      satWeak={district !== "All" ? [...(districtLoBreakdown || [])].sort((a, b) => a.pct - b.pct).slice(0, 8).map((x) => ({ label: `${x.grade ? x.grade + " · " : ""}${x.subject} · ${x.loCode}`, note: x.indicator, pct: x.pct })) : satWeakLOs}
      parakhSubjects={(() => {
        const cols = subjectHeatmap.columns.filter((c) => !c.endsWith("Average"));
        return cols.map((c) => {
          const v = subjectHeatmap.data.map((r) => r[c]).filter((x) => typeof x === "number");
          return { label: c, pct: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null };
        }).filter((x) => x.pct != null).sort((a, b) => a.pct - b.pct).slice(0, 4);
      })()} />}
    {on("dash_deepDive") && district !== "All" && (districtPgiIndicators?.overall || districtCompetencies || districtLoBreakdown?.length > 0) && (
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


</>

</DashboardLayout>
);

};

export default Dashboard;