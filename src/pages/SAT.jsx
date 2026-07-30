import { useEffect, useState } from "react";
import { Box, Grid, Paper, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import SATHeatMapChart from "../components/SATHeatMapChart";
import SATSemesterComparison from "../components/SATSemesterComparison";
import Loading from "../components/Loading";
import DistrictFilterBar from "../components/DistrictFilterBar";
import ActionItemsQueue from "../components/ActionItemsQueue";
import { colors, fontDisplay, fontMono } from "../theme/theme";

import {
  loadExcel,
  loadSATSem1Excel,
  getSATDistrictRanking,
  getSATGradeWise,
  getSATStateSummary,
  getSATSubjectWise,
  getSATSubjectHeatmap,
  getSATActionItems,
  getAllDistrictSATActionItems,
  getSATSemesterComparison,
  getSATSem1DistrictRanking,
  getSATSem1GradeWise,
  getSATSem1StateSummary,
  getSATSem1SubjectWise,
  getSATSem1SubjectHeatmap,
  getSATSem1ActionItems,
  getAllDistrictSATSem1ActionItems,
  cleanSubjectLabel,
  getSATDistrictLOBreakdown,
} from "../services/dataService";
import { SATLOBreakdownSection } from "../components/DistrictDeepDive";

const SAT = () => {
  const [loading, setLoading] = useState(true);

  const [satRankingSem2, setSatRankingSem2] = useState([]);
  const [satGradeWiseSem2, setSatGradeWiseSem2] = useState({ grades: [], data: [] });
  const [satSummarySem2, setSatSummarySem2] = useState({
    stateAverage: 0,
    totalDistricts: 0,
    gradeAverages: [],
  });
  const [satSubjectWiseSem2, setSatSubjectWiseSem2] = useState([]);
  const [satSubjectHeatmapSem2, setSatSubjectHeatmapSem2] = useState({ subjects: [], data: [] });
  const [satActionItemsSem2, setSatActionItemsSem2] = useState([]);
  const [allDistrictSatItemsSem2, setAllDistrictSatItemsSem2] = useState([]);

  const [satRankingSem1, setSatRankingSem1] = useState([]);
  const [satGradeWiseSem1, setSatGradeWiseSem1] = useState({ grades: [], data: [] });
  const [satSummarySem1, setSatSummarySem1] = useState({
    stateAverage: 0,
    totalDistricts: 0,
    gradeAverages: [],
  });
  const [satSubjectWiseSem1, setSatSubjectWiseSem1] = useState([]);
  const [satSubjectHeatmapSem1, setSatSubjectHeatmapSem1] = useState({ subjects: [], data: [] });
  const [satActionItemsSem1, setSatActionItemsSem1] = useState([]);
  const [allDistrictSatItemsSem1, setAllDistrictSatItemsSem1] = useState([]);

  const [satSemesterComparison, setSatSemesterComparison] = useState([]);
  const [district, setDistrict] = useState("All");
  const [loBreakdown, setLoBreakdown] = useState(null);

  // Which semester's data drives the state-average/KPI/grade-wise/
  // subject-wise/heat-map/table sections below. The Semester Comparison
  // section further down always shows both semesters together.
  //
  // Defaults to "All" (pooled Sem 1 + Sem 2) — the page opens on the
  // combined picture rather than silently pre-picking Semester 2, so the
  // first thing a viewer sees is the full-year state, not one semester.
  const [semester, setSemester] = useState("all");

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();
      const sem1Workbook = await loadSATSem1Excel();

      setSatRankingSem2(getSATDistrictRanking(workbook));
      setSatGradeWiseSem2(getSATGradeWise(workbook));
      setSatSummarySem2(getSATStateSummary(workbook));
      setSatSubjectWiseSem2(getSATSubjectWise(workbook));
      setSatSubjectHeatmapSem2(getSATSubjectHeatmap(workbook));
      setSatActionItemsSem2(getSATActionItems(workbook));
      setAllDistrictSatItemsSem2(getAllDistrictSATActionItems(workbook));

      setSatRankingSem1(getSATSem1DistrictRanking(sem1Workbook));
      setSatGradeWiseSem1(getSATSem1GradeWise(sem1Workbook));
      setSatSummarySem1(getSATSem1StateSummary(sem1Workbook));
      setSatSubjectWiseSem1(getSATSem1SubjectWise(sem1Workbook));
      setSatSubjectHeatmapSem1(getSATSem1SubjectHeatmap(sem1Workbook));
      setSatActionItemsSem1(getSATSem1ActionItems(sem1Workbook));
      setAllDistrictSatItemsSem1(getAllDistrictSATSem1ActionItems(sem1Workbook));

      setSatSemesterComparison(getSATSemesterComparison(workbook, sem1Workbook));

      setLoading(false);
    }

    fetchData();
  }, []);

  // Full Learning-Outcome breakdown for whichever district is picked —
  // loadExcel() is cached, so re-calling it here is cheap.
  useEffect(() => {
    if (district === "All") {
      setLoBreakdown(null);
      return;
    }
    let cancelled = false;
    loadExcel().then((workbook) => {
      if (!cancelled) setLoBreakdown(getSATDistrictLOBreakdown(workbook, district));
    });
    return () => {
      cancelled = true;
    };
  }, [district]);

  // -----------------------------
  // Combined "All" dataset — both semesters' percentages averaged
  // together (district ranking uses the pooled-marks Total from
  // getSATSemesterComparison; grade/subject/heat-map values are the
  // mean of the two semesters' percentages per cell, since raw marks
  // aren't tracked at that granularity).
  // -----------------------------

  const satRankingAll = satSemesterComparison
    .filter((d) => d.TotalPct != null)
    .map((d) => ({ District: d.District, PercentAchieved: d.TotalPct }))
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
    .map((d, index) => ({ ...d, Rank: index + 1 }));

  const avgOf = (a, b) => (a == null && b == null ? null : ((a ?? b) + (b ?? a)) / 2);

  const satGradeWiseAll = (() => {
    const grades = [...new Set([...satGradeWiseSem2.grades, ...satGradeWiseSem1.grades])];
    const districtsUnion = [
      ...new Set([
        ...satGradeWiseSem2.data.map((d) => d.District),
        ...satGradeWiseSem1.data.map((d) => d.District),
      ]),
    ];

    const data = districtsUnion.map((District) => {
      const row = { District };
      grades.forEach((grade) => {
        const s2 = satGradeWiseSem2.data.find((d) => d.District === District)?.[grade];
        const s1 = satGradeWiseSem1.data.find((d) => d.District === District)?.[grade];
        const avg = avgOf(s1, s2);
        if (avg != null) row[grade] = avg;
      });
      return row;
    });

    return { grades, data };
  })();

  const satSummaryAll = {
    stateAverage: satRankingAll.length
      ? satRankingAll.reduce((sum, d) => sum + d.PercentAchieved, 0) / satRankingAll.length
      : 0,
    totalDistricts: satRankingAll.length,
    gradeAverages: satGradeWiseAll.grades.map((grade) => {
      const values = satGradeWiseAll.data.map((d) => d[grade]).filter((v) => typeof v === "number");
      return {
        grade,
        average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      };
    }),
  };

  const satSubjectWiseAll = (() => {
    const subjects = [
      ...new Set([
        ...satSubjectWiseSem2.map((s) => s.subject),
        ...satSubjectWiseSem1.map((s) => s.subject),
      ]),
    ];

    return subjects
      .map((subject) => ({
        subject,
        PercentAchieved: avgOf(
          satSubjectWiseSem1.find((s) => s.subject === subject)?.PercentAchieved,
          satSubjectWiseSem2.find((s) => s.subject === subject)?.PercentAchieved
        ),
      }))
      .filter((s) => s.PercentAchieved != null)
      .sort((a, b) => b.PercentAchieved - a.PercentAchieved);
  })();

  const satSubjectHeatmapAll = (() => {
    const subjects = [
      ...new Set([...satSubjectHeatmapSem2.subjects, ...satSubjectHeatmapSem1.subjects]),
    ];
    const districtsUnion = [
      ...new Set([
        ...satSubjectHeatmapSem2.data.map((d) => d.District),
        ...satSubjectHeatmapSem1.data.map((d) => d.District),
      ]),
    ];

    const data = districtsUnion.map((District) => {
      const row = { District };
      subjects.forEach((subject) => {
        const s2 = satSubjectHeatmapSem2.data.find((d) => d.District === District)?.[subject];
        const s1 = satSubjectHeatmapSem1.data.find((d) => d.District === District)?.[subject];
        const avg = avgOf(s1, s2);
        if (avg != null) row[subject] = avg;
      });
      return row;
    });

    return { subjects, data };
  })();

  // Active dataset for this page, based on the All / Semester 1 /
  // Semester 2 toggle. Everything below (KPIs, charts, heat-maps,
  // table, action items) reads from these — unchanged variable names —
  // so switching semester swaps the whole page at once.
  const satRanking = semester === "all" ? satRankingAll : semester === "sem1" ? satRankingSem1 : satRankingSem2;
  const satGradeWise = semester === "all" ? satGradeWiseAll : semester === "sem1" ? satGradeWiseSem1 : satGradeWiseSem2;
  const satSummary = semester === "all" ? satSummaryAll : semester === "sem1" ? satSummarySem1 : satSummarySem2;
  const satSubjectWise = semester === "all" ? satSubjectWiseAll : semester === "sem1" ? satSubjectWiseSem1 : satSubjectWiseSem2;
  const satSubjectHeatmap = semester === "all" ? satSubjectHeatmapAll : semester === "sem1" ? satSubjectHeatmapSem1 : satSubjectHeatmapSem2;
  // Action items don't have a pooled-marks version — Semester 2 is used
  // as the basis whenever "All" is selected.
  const satActionItems = semester === "sem1" ? satActionItemsSem1 : satActionItemsSem2;
  const allDistrictSatItems = semester === "sem1" ? allDistrictSatItemsSem1 : allDistrictSatItemsSem2;

  const districts = ["All", ...new Set(satRanking.map((d) => d.District))];

  const sortedByScore = [...satRanking].sort(
    (a, b) => b.PercentAchieved - a.PercentAchieved
  );

  const topDistrict = sortedByScore[0];
  const lowestDistrict = sortedByScore[sortedByScore.length - 1];

  const top5 = sortedByScore.slice(0, 5).map((d) => ({
    District: d.District,
    Score: Number(d.PercentAchieved.toFixed(1)),
  }));

  const bottom5 = [...sortedByScore]
    .reverse()
    .slice(0, 5)
    .map((d) => ({
      District: d.District,
      Score: Number(d.PercentAchieved.toFixed(1)),
    }));

  // District x Grade and District x Subject heat-map tables (Semester 2 /
  // Semester 1, both always shown) are built directly where they're
  // rendered further down, from satGradeWiseSem2/Sem1 and
  // satSubjectHeatmapSem2/Sem1.

  // -----------------------------
  // Sem 1 vs Sem 2 comparison data for the three main charts + the two
  // heat-maps below — these are ALWAYS both-semesters, independent of
  // the Semester 1 / Semester 2 toggle above (which only drives the
  // KPI cards, leaderboard, table, and action items).
  // -----------------------------

  const districtComparisonChartAll = satSemesterComparison.map((d) => ({
    District: d.District,
    "Sem 1": d.Sem1Pct != null ? Number(d.Sem1Pct.toFixed(1)) : null,
    "Sem 2": d.Sem2Pct != null ? Number(d.Sem2Pct.toFixed(1)) : null,
  }));

  const districtComparisonChartData =
    district !== "All"
      ? districtComparisonChartAll.filter((d) => d.District === district)
      : districtComparisonChartAll;

  const gradeComparisonChartData = (() => {
    const grades = [...new Set([...satGradeWiseSem2.grades, ...satGradeWiseSem1.grades])];

    return grades.map((grade) => {
      let sem1Value;
      let sem2Value;

      if (district !== "All") {
        sem1Value = satGradeWiseSem1.data.find((d) => d.District === district)?.[grade];
        sem2Value = satGradeWiseSem2.data.find((d) => d.District === district)?.[grade];
      } else {
        sem1Value = satSummarySem1.gradeAverages.find((g) => g.grade === grade)?.average;
        sem2Value = satSummarySem2.gradeAverages.find((g) => g.grade === grade)?.average;
      }

      return {
        grade,
        "Sem 1": sem1Value != null ? Number(sem1Value.toFixed(1)) : null,
        "Sem 2": sem2Value != null ? Number(sem2Value.toFixed(1)) : null,
      };
    });
  })();

  const subjectComparisonChartData = (() => {
    const subjects = [
      ...new Set([
        ...satSubjectWiseSem2.map((s) => s.subject),
        ...satSubjectWiseSem1.map((s) => s.subject),
      ]),
    ];

    return subjects.map((subject) => {
      const sem1Value = satSubjectWiseSem1.find((s) => s.subject === subject)?.PercentAchieved;
      const sem2Value = satSubjectWiseSem2.find((s) => s.subject === subject)?.PercentAchieved;

      return {
        subject: cleanSubjectLabel(subject),
        "Sem 1": sem1Value != null ? Number(sem1Value.toFixed(1)) : null,
        "Sem 2": sem2Value != null ? Number(sem2Value.toFixed(1)) : null,
      };
    });
  })();

  const gradeHeatmapDataSem1 =
    district !== "All"
      ? satGradeWiseSem1.data.filter((d) => d.District === district)
      : satGradeWiseSem1.data;

  const gradeHeatmapDataSem2 =
    district !== "All"
      ? satGradeWiseSem2.data.filter((d) => d.District === district)
      : satGradeWiseSem2.data;

  const subjectHeatmapDataSem1 =
    district !== "All"
      ? satSubjectHeatmapSem1.data.filter((d) => d.District === district)
      : satSubjectHeatmapSem1.data;

  const subjectHeatmapDataSem2 =
    district !== "All"
      ? satSubjectHeatmapSem2.data.filter((d) => d.District === district)
      : satSubjectHeatmapSem2.data;

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        pageIcon="📝"
        pageEyebrow="SAT Analytics"
        pageTitle="Gujarat SAT Dashboard"
        pageSubtitle={`Semester Assessment Test — ${
          semester === "all" ? "Both Semesters (Combined)" : semester === "sem1" ? "Semester 1" : "Semester 2"
        } · ${satSummary.totalDistricts} Districts · District / Grade / Subject / Learning-Outcome level breakdown`}
        statChip={{
          label: "Gujarat State Overall Score",
          value: satSummary.stateAverage.toFixed(1),
          suffix: "%",
        }}
        controls={
          <ToggleButtonGroup
            value={semester}
            exclusive
            size="small"
            onChange={(e, value) => value && setSemester(value)}
            sx={{
              bgcolor: "rgba(255,255,255,0.12)",
              "& .MuiToggleButton-root": {
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                fontWeight: 600,
                fontSize: 13,
                px: 2,
              },
              "& .MuiToggleButton-root.Mui-selected": {
                bgcolor: colors.gold,
                color: colors.navy,
              },
              "& .MuiToggleButton-root.Mui-selected:hover": {
                bgcolor: colors.goldLight,
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="sem1">Semester 1</ToggleButton>
            <ToggleButton value="sem2">Semester 2</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={2} mb={2}>
        {[
          { label: "State Average", value: `${satSummary.stateAverage.toFixed(1)}%`, accent: colors.gold },
          { label: "Districts Assessed", value: satSummary.totalDistricts, accent: "#1976D2" },
          { label: "Top District", value: topDistrict?.District || "-", sub: `${topDistrict?.PercentAchieved?.toFixed(1) || 0}%`, accent: "#2E7D32" },
          { label: "Needs Support", value: lowestDistrict?.District || "-", sub: `${lowestDistrict?.PercentAchieved?.toFixed(1) || 0}%`, accent: "#D32F2F" },
        ].map((kpi) => (
          <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{kpi.label.toUpperCase()}</Typography>
                <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 24, color: "#16233B" }}>
                  {kpi.value}
                </Typography>
                {kpi.sub && (
                  <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 700, color: kpi.accent }}>
                    {kpi.sub}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grade-wise state overview */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E4E7F0", p: 3, mb: 3 }}>
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 17, mb: 2, color: "#16233B" }}>
          Grade-wise State Average
        </Typography>
        <Grid container spacing={1}>
          {satGradeWise.grades.map((grade) => {
            const avg = satSummary.gradeAverages.find((g) => g.grade === grade)?.average || 0;
            return (
              <Grid size={{ xs: 6, md: 2 }} key={grade}>
                <Box sx={{ p: 1.2 }}>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{grade}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: "#EEF0F5", overflow: "hidden" }}>
                      <Box sx={{ width: `${Math.min(avg, 100)}%`, height: "100%", bgcolor: colors.gold }} />
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
      </Paper>

      {/* Leaderboard: Top 5 / Needs Support */}
      <Grid container spacing={3} mb={3}>
        {[
          { title: "Top SAT Districts", icon: "🎯", data: top5, rankBase: 1 },
          { title: "SAT — Needs Support", icon: "📉", data: bottom5, rankBase: satSummary.totalDistricts || 33, reverse: true },
        ].map((panel) => (
          <Grid size={{ xs: 12, sm: 6 }} key={panel.title}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2 }}>
                  {panel.icon} {panel.title}
                </Typography>

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

                      <Typography sx={{ flex: 1, fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

      {/* District Filter */}
      <Box mt={1} mb={2}>
        <DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />
      </Box>

      <SATSemesterComparison data={satSemesterComparison} district={district} />

      {/* District-wise bar chart — Sem 1 vs Sem 2, always both */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
            District-wise SAT Overall Performance (%) · Semester 1 vs Semester 2
          </Typography>

          <ResponsiveContainer width="100%" height={460}>
            <BarChart data={districtComparisonChartData} margin={{ top: 30, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="District" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => (value == null ? "—" : `${Number(value).toFixed(1)}%`)} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 12 }} />
              <Bar dataKey="Sem 1" fill={colors.navyLight} radius={[4, 4, 0, 0]} barSize={district !== "All" ? 60 : 10} />
              <Bar dataKey="Sem 2" fill={colors.gold} radius={[4, 4, 0, 0]} barSize={district !== "All" ? 60 : 10} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grade-wise bar chart — Sem 1 vs Sem 2, always both */}
      {gradeComparisonChartData.length > 0 && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              SAT — Grade-wise Performance (%) · Semester 1 vs Semester 2{district !== "All" ? ` · ${district}` : " · Gujarat State Average"}
            </Typography>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={gradeComparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => (value == null ? "—" : `${Number(value).toFixed(1)}%`)} />
                <Legend />
                <Bar dataKey="Sem 1" fill={colors.navyLight} radius={[4, 4, 0, 0]} barSize={30}>
                  <LabelList dataKey="Sem 1" position="top" formatter={(v) => (v == null ? "" : `${v}%`)} style={{ fontSize: 10, fontWeight: "bold", fill: "#555" }} />
                </Bar>
                <Bar dataKey="Sem 2" fill={colors.gold} radius={[4, 4, 0, 0]} barSize={30}>
                  <LabelList dataKey="Sem 2" position="top" formatter={(v) => (v == null ? "" : `${v}%`)} style={{ fontSize: 10, fontWeight: "bold", fill: "#333" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subject-wise bar chart (state-wide) — Sem 1 vs Sem 2, always both */}
      {subjectComparisonChartData.length > 0 && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              SAT — Subject-wise Performance (%) · Gujarat State-wide · Semester 1 vs Semester 2
            </Typography>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={subjectComparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => (value == null ? "—" : `${Number(value).toFixed(1)}%`)} />
                <Legend />
                <Bar dataKey="Sem 1" fill={colors.navyLight} radius={[4, 4, 0, 0]} barSize={22}>
                  <LabelList dataKey="Sem 1" position="top" formatter={(v) => (v == null ? "" : `${v}%`)} style={{ fontSize: 9, fontWeight: "bold", fill: "#555" }} />
                </Bar>
                <Bar dataKey="Sem 2" fill={colors.gold} radius={[4, 4, 0, 0]} barSize={22}>
                  <LabelList dataKey="Sem 2" position="top" formatter={(v) => (v == null ? "" : `${v}%`)} style={{ fontSize: 9, fontWeight: "bold", fill: "#333" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <SATHeatMapChart
        icon="📊"
        title={`District x Grade — SAT Score Heat-map (%)${
          semester === "all" ? " · Semester 1 vs Semester 2" : semester === "sem1" ? " · Semester 1" : " · Semester 2"
        }${district !== "All" ? ` · ${district}` : ""}`}
        columns={semester === "sem2" ? satGradeWiseSem2.grades : satGradeWiseSem1.grades}
        data={semester === "sem2" ? gradeHeatmapDataSem2 : gradeHeatmapDataSem1}
        data2={semester === "all" ? gradeHeatmapDataSem2 : null}
        allData={semester === "sem2" ? satGradeWiseSem2.data : satGradeWiseSem1.data}
        allData2={satGradeWiseSem2.data}
      />

      <SATHeatMapChart
        icon="📘"
        title={`District x Subject — SAT Score Heat-map (%)${
          semester === "all" ? " · Semester 1 vs Semester 2" : semester === "sem1" ? " · Semester 1" : " · Semester 2"
        }${district !== "All" ? ` · ${district}` : ""}`}
        columns={semester === "sem2" ? satSubjectHeatmapSem2.subjects : satSubjectHeatmapSem1.subjects}
        data={semester === "sem2" ? subjectHeatmapDataSem2 : subjectHeatmapDataSem1}
        data2={semester === "all" ? subjectHeatmapDataSem2 : null}
        allData={semester === "sem2" ? satSubjectHeatmapSem2.data : satSubjectHeatmapSem1.data}
        allData2={satSubjectHeatmapSem2.data}
      />

      {district !== "All" && loBreakdown?.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 4, border: "1px solid #E4E7F0" }} elevation={0}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              🔎 {district} — Full Learning-Outcome Breakdown
            </Typography>
            <SATLOBreakdownSection los={loBreakdown} />
          </CardContent>
        </Card>
      )}

      <ActionItemsQueue
        items={satActionItems}
        allDistricts={districts.slice(1)}
        allItems={allDistrictSatItems}
        syncDistrict={district}
      />
    </DashboardLayout>
  );
};

export default SAT;