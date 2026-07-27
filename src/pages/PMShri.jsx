import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
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
  TextField,
  InputAdornment,
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

import { loadExcel, getPMShriData, getPMShriActionItems, getAllDistrictNames, getAllDistrictPMShriActionItems } from "../services/dataService";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "../components/PriorityChip";
import ActionItemsQueue from "../components/ActionItemsQueue";

const PMShri = () => {
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [stateTotal, setStateTotal] = useState(null);
  const [search, setSearch] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();
      const { districts, stateTotal } = getPMShriData(workbook);
      setDistricts(districts);
      setStateTotal(stateTotal);
      setActionItems(getPMShriActionItems(workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictPMShriActionItems(workbook));
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Header />
        <Loading message="Loading PM Shri school data..." />
      </DashboardLayout>
    );
  }

  const sorted = [...districts].sort((a, b) => b.totalSchools - a.totalSchools);
  const filtered = sorted.filter((d) =>
    d.district.toLowerCase().includes(search.toLowerCase())
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

          <TextField
            fullWidth
            size="small"
            placeholder="Search District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

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
                {filtered.map((d) => (
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

      <ActionItemsQueue
        items={actionItems}
        allDistricts={allDistrictNames}
        allItems={allDistrictItems}
      />
    </DashboardLayout>
  );
};

export default PMShri;
