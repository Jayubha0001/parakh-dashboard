import SearchIcon from "@mui/icons-material/Search";
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
  TextField,
  Button,
InputAdornment,
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
  LabelList,
} from "recharts";

import Header from "../components/Header";
import DashboardLayout from "../components/DashboardLayout";
import FilterBar from "../components/FilterBar";
import PGITable from "../components/PGITable";

import {
  loadExcel,
  getSheetData,
  getStatePGISummary,
  getDistrictPGIRanking,
} from "../services/dataService";

const Dashboard = () => {
  // -----------------------------
  // State
  // -----------------------------

  const [parakhData, setParakhData] = useState([]);

  const [pgiSummary, setPgiSummary] = useState({ domains: [], overall: {} });
  const [pgiRanking, setPgiRanking] = useState([]);

  const [district, setDistrict] = useState("All");

  const [stage, setStage] = useState("Overall");

  const [subject, setSubject] = useState("Overall");

  // -----------------------------
  // Load Excel
  // -----------------------------

  useEffect(() => {

    async function fetchData() {

      const workbook = await loadExcel();

      const data = getSheetData(
        workbook,
        "Dashboard_PARAKH"
      );

      setParakhData(data);

      setPgiSummary(getStatePGISummary(workbook));
      setPgiRanking(getDistrictPGIRanking(workbook));

    }

    fetchData();

  }, []);

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
  // Filter Data
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
  // KPI
  // -----------------------------

  const totalDistricts =
    filteredData.length;

  const validScores =
    filteredData.filter(
      (d) =>
        !isNaN(d[selectedColumn])
    );

  const averageScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce(
            (sum, d) =>
              sum + d[selectedColumn],
            0
          ) /
            validScores.length *
            100
        )
      : 0;

  const topDistrict =
    filteredData.length > 0
      ? [...filteredData].sort(
          (a, b) =>
            b[selectedColumn] -
            a[selectedColumn]
        )[0]
      : {};

  const lowestDistrict =
    filteredData.length > 0
      ? [...filteredData].sort(
          (a, b) =>
            a[selectedColumn] -
            b[selectedColumn]
        )[0]
      : {};

  // -----------------------------
  // Chart Data
  // -----------------------------

  const chartData =
    [...filteredData]
      .sort(
        (a, b) =>
          b[selectedColumn] -
          a[selectedColumn]
      )
      .map((item) => ({
        District: item.District,
        Score: Number(
          (
            item[selectedColumn] * 100
          ).toFixed(1)
        ),
      }));

      // Top 5 Districts
const top5Districts = chartData.slice(0, 5);

// Bottom 5 Districts
const bottom5Districts = [...chartData]
  .reverse()
  .slice(0, 5);

// -----------------------------
// Bar Chart Data — when a single district is filtered, add the Gujarat
// state average alongside it so the chart always has context to compare
// against, instead of one bar floating alone.
// -----------------------------

const stateAverageForColumn =
  parakhData.length > 0
    ? parakhData.reduce((sum, d) => sum + (d[selectedColumn] || 0), 0) /
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

const pgiChartData =
  district !== "All"
    ? [
        ...pgiChartAll.filter((d) => d.District === district),
        {
          District: "Gujarat State Average",
          Score: Number(pgiStateAverage.toFixed(1)),
          isAverage: true,
        },
      ]
    : pgiChartAll;

const pgiTableData = [...pgiRanking]
  .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
  .map((d, index) => ({
    Rank: index + 1,
    District: d.District,
    Score: d.Score,
    PercentAchieved: d.PercentAchieved,
    Grade: d.Grade,
  }));

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
          { title: "Top PARAKH Districts", icon: "🎓", data: top5Districts, rankBase: 1, tone: "success.main" },
          { title: "PARAKH — Needs Support", icon: "📉", data: bottom5Districts, rankBase: 33, tone: "error.main", reverse: true },
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
                    mb: 2,
                  }}
                >
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

<FilterBar
  district={district}
  setDistrict={setDistrict}
  stage={stage}
  setStage={setStage}
  subject={subject}
  setSubject={setSubject}
  districts={districts}
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
    <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: "#16233B" }}>
      🏛️ PGI 2.0 — Governance Score
    </Typography>

    <Button
      component={RouterLink}
      to="/pgi"
      endIcon={<ArrowForwardIcon />}
      sx={{ textTransform: "none", fontWeight: 600 }}
    >
      View full PGI 2.0 Dashboard
    </Button>
  </Box>
  <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
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
      District-wise PGI-D 2.0 Overall Performance (%)
    </Typography>

    <ResponsiveContainer width="100%" height={420}>
      <BarChart
        data={pgiChartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
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

        <Tooltip formatter={(value) => `${value}%`} />

        <Bar dataKey="Score" barSize={20} radius={[6, 6, 0, 0]}>
          {pgiChartData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.isAverage
                  ? "#0F172A"
                  : entry.Score >= 61
                  ? "#2E7D32"
                  : entry.Score >= 31
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

<PGITable data={pgiTableData} />

</DashboardLayout>
);

};

export default Dashboard;