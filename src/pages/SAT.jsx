import { useEffect, useState } from "react";
import { Box, Grid, Paper, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

import DashboardLayout from "../components/DashboardLayout";
import SATTable from "../components/SATTable";
import SATHeatMapChart from "../components/SATHeatMapChart";
import SATSemesterComparison from "../components/SATSemesterComparison";
import Loading from "../components/Loading";
import DistrictFilterBar from "../components/DistrictFilterBar";
import ActionItemsQueue from "../components/ActionItemsQueue";

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
} from "../services/dataService";

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

  // Which semester's data drives the state-average/KPI/grade-wise/
  // subject-wise/heat-map/table sections below. The Semester Comparison
  // section further down always shows both semesters together.
  const [semester, setSemester] = useState("sem2");

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

  // Active dataset for this page, based on the Semester 1 / Semester 2
  // toggle. Everything below (KPIs, charts, heat-maps, table, action
  // items) reads from these — unchanged variable names — so switching
  // semester swaps the whole page at once.
  const satRanking = semester === "sem1" ? satRankingSem1 : satRankingSem2;
  const satGradeWise = semester === "sem1" ? satGradeWiseSem1 : satGradeWiseSem2;
  const satSummary = semester === "sem1" ? satSummarySem1 : satSummarySem2;
  const satSubjectWise = semester === "sem1" ? satSubjectWiseSem1 : satSubjectWiseSem2;
  const satSubjectHeatmap = semester === "sem1" ? satSubjectHeatmapSem1 : satSubjectHeatmapSem2;
  const satActionItems = semester === "sem1" ? satActionItemsSem1 : satActionItemsSem2;
  const allDistrictSatItems = semester === "sem1" ? allDistrictSatItemsSem1 : allDistrictSatItemsSem2;

  const districts = ["All", ...new Set(satRanking.map((d) => d.District))];

  const sortedByScore = [...satRanking].sort(
    (a, b) => b.PercentAchieved - a.PercentAchieved
  );

  const topDistrict = sortedByScore[0];
  const lowestDistrict = sortedByScore[sortedByScore.length - 1];

  // Leaderboard + table narrow to the selected district; the state-level
  // overview card above stays state-wide as a fixed reference.
  const filteredRanking =
    district === "All"
      ? sortedByScore
      : sortedByScore.filter((d) => d.District === district);

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

  const chartAll = sortedByScore.map((d) => ({
    District: d.District,
    Score: Number(d.PercentAchieved.toFixed(1)),
  }));

  const chartData =
    district !== "All"
      ? [
          ...chartAll.filter((d) => d.District === district),
          {
            District: "Gujarat State Average",
            Score: Number(satSummary.stateAverage.toFixed(1)),
            isAverage: true,
          },
        ]
      : chartAll;

  const gradeChartData = satGradeWise.grades.map((grade) => {
    const row = { grade };
    if (district !== "All") {
      const districtRow = satGradeWise.data.find((d) => d.District === district);
      row.Score = Number((districtRow?.[grade] ?? 0).toFixed(1));
    } else {
      const stateAvg = satSummary.gradeAverages.find((g) => g.grade === grade);
      row.Score = Number((stateAvg?.average ?? 0).toFixed(1));
    }
    return row;
  });

  const subjectChartData = satSubjectWise.map((s) => ({
    subject: s.subject,
    Score: Number(s.PercentAchieved.toFixed(1)),
  }));

  // District x Grade and District x Subject heat-map tables, narrowed to
  // the selected district like the rest of the page.
  const gradeHeatmapData =
    district !== "All"
      ? satGradeWise.data.filter((d) => d.District === district)
      : satGradeWise.data;

  const subjectHeatmapData =
    district !== "All"
      ? satSubjectHeatmap.data.filter((d) => d.District === district)
      : satSubjectHeatmap.data;

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)",
          borderRadius: 4,
          color: "#fff",
          p: 4,
          mb: 4,
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3" fontWeight="bold">
              📝 Gujarat SAT Dashboard
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.85 }}>
              Semester Assessment Test — {semester === "sem1" ? "Semester 1" : "Semester 2"}
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.75, fontSize: 14 }}>
              {satSummary.totalDistricts} Districts · District / Grade / Subject / Learning-Outcome level breakdown
            </Typography>

            <ToggleButtonGroup
              value={semester}
              exclusive
              size="small"
              onChange={(e, value) => value && setSemester(value)}
              sx={{
                mt: 2,
                bgcolor: "rgba(255,255,255,0.12)",
                "& .MuiToggleButton-root": {
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                },
                "& .MuiToggleButton-root.Mui-selected": {
                  bgcolor: "#fff",
                  color: "#4A148C",
                },
                "& .MuiToggleButton-root.Mui-selected:hover": {
                  bgcolor: "#f0e6f7",
                },
              }}
            >
              <ToggleButton value="sem2">Semester 2</ToggleButton>
              <ToggleButton value="sem1">Semester 1</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                borderRadius: 3,
                p: 2.5,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 13, opacity: 0.8 }}>Gujarat State Overall Score</Typography>
              <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 44 }}>
                {satSummary.stateAverage.toFixed(1)}
                <Typography component="span" sx={{ fontSize: 18 }}>%</Typography>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={2}>
        {[
          { label: "State Average", value: `${satSummary.stateAverage.toFixed(1)}%`, accent: "#6A1B9A" },
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
      </Paper>

      {/* District Filter */}
      <Box mt={1} mb={2}>
        <DistrictFilterBar district={district} setDistrict={setDistrict} districts={districts} />
      </Box>

      <SATSemesterComparison data={satSemesterComparison} district={district} />

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

      {/* District-wise bar chart */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
            District-wise SAT Overall Performance (%) · {semester === "sem1" ? "Semester 1" : "Semester 2"}
          </Typography>

          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="District" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="Score" barSize={20} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.isAverage
                        ? "#0F172A"
                        : entry.Score >= 60
                        ? "#2E7D32"
                        : entry.Score >= 45
                        ? "#FB8C00"
                        : "#D32F2F"
                    }
                  />
                ))}
                <LabelList
                  dataKey="Score"
                  position="top"
                  formatter={(value) => `${value}%`}
                  style={{ fontSize: 11, fontWeight: "bold", fill: "#333" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grade-wise bar chart */}
      {gradeChartData.length > 0 && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              SAT — Grade-wise Performance (%) · {semester === "sem1" ? "Semester 1" : "Semester 2"}{district !== "All" ? ` · ${district}` : " · Gujarat State Average"}
            </Typography>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={gradeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="Score" barSize={40} radius={[6, 6, 0, 0]}>
                  {gradeChartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.Score >= 60 ? "#2E7D32" : entry.Score >= 45 ? "#FB8C00" : "#D32F2F"}
                    />
                  ))}
                  <LabelList
                    dataKey="Score"
                    position="top"
                    formatter={(value) => `${value}%`}
                    style={{ fontSize: 11, fontWeight: "bold", fill: "#333" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subject-wise bar chart (state-wide) */}
      {subjectChartData.length > 0 && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              SAT — Subject-wise Performance (%) · Gujarat State-wide · {semester === "sem1" ? "Semester 1" : "Semester 2"}
            </Typography>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={subjectChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="Score" barSize={30} radius={[6, 6, 0, 0]}>
                  {subjectChartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.Score >= 60 ? "#2E7D32" : entry.Score >= 45 ? "#FB8C00" : "#D32F2F"}
                    />
                  ))}
                  <LabelList
                    dataKey="Score"
                    position="top"
                    formatter={(value) => `${value}%`}
                    style={{ fontSize: 11, fontWeight: "bold", fill: "#333" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <SATHeatMapChart
        icon="📊"
        title={`District x Grade — SAT Score Heat-map (%) · ${semester === "sem1" ? "Semester 1" : "Semester 2"}${district !== "All" ? ` · ${district}` : ""}`}
        columns={satGradeWise.grades}
        data={gradeHeatmapData}
      />

      <SATHeatMapChart
        icon="📘"
        title={`District x Subject — SAT Score Heat-map (%) · ${semester === "sem1" ? "Semester 1" : "Semester 2"}${district !== "All" ? ` · ${district}` : ""}`}
        columns={satSubjectHeatmap.subjects}
        data={subjectHeatmapData}
      />

      <SATTable data={filteredRanking} />

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
