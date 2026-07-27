import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const EMPTY_DATA = { districtWise: [], gradeWise: [], subjectWise: [], loWise: [] };
const unique = (items) => [...new Set(items)].sort((a, b) => a.localeCompare(b));
const percent = (value) => `${Number(value || 0).toFixed(1)}%`;
const marks = (value) => Number(value || 0).toLocaleString("en-IN");
const average = (rows) => rows.length
  ? rows.reduce((sum, row) => sum + Number(row || 0), 0) / rows.length
  : 0;
const scoreTone = (value) =>
  value >= 80
    ? { bg: "#E8F5E9", color: "#1B5E20" }
    : value >= 60
    ? { bg: "#FFF3E0", color: "#B05F00" }
    : { bg: "#FFEBEE", color: "#B71C1C" };

const ScoreCell = ({ value }) => {
  const tone = scoreTone(Number(value));
  return (
    <TableCell align="right" sx={{ px: 0.5 }}>
      <Box
        sx={{
          display: "inline-flex",
          px: 1.1,
          py: 0.4,
          borderRadius: 1,
          bgcolor: tone.bg,
          color: tone.color,
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {percent(value)}
      </Box>
    </TableCell>
  );
};

const Section = ({ title, subtitle, children }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3, border: "1px solid #E4E7F0" }}>
    <CardContent>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 700, color: "#16233B" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>{subtitle}</Typography>
      {children}
    </CardContent>
  </Card>
);

const HeaderCell = ({ children, align }) => (
  <TableCell align={align} sx={{ bgcolor: "#16233B", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>
    {children}
  </TableCell>
);

const SATWorkbookExplorer = () => {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [district, setDistrict] = useState("All");
  const [grade, setGrade] = useState("All");
  const [subject, setSubject] = useState("All");
  const [learningOutcome, setLearningOutcome] = useState("All");
  const [loPage, setLoPage] = useState(0);

  useEffect(() => {
    fetch("/sat-sem2-data.json")
      .then((response) => {
        if (!response.ok) throw new Error("SAT workbook data could not be loaded.");
        return response.json();
      })
      .then(setData)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const districts = useMemo(() => unique(data.districtWise.map((row) => row.district)), [data]);
  const grades = useMemo(() => unique(
    data.gradeWise
      .filter((row) => district === "All" || row.district === district)
      .map((row) => row.grade)
  ), [data, district]);
  const subjects = useMemo(() => unique(
    data.subjectWise
      .filter((row) => (district === "All" || row.district === district) && (grade === "All" || row.grade === grade))
      .map((row) => row.subject)
  ), [data, district, grade]);
  const learningOutcomes = useMemo(() => unique(
    data.loWise
      .filter((row) =>
        (district === "All" || row.district === district) &&
        (grade === "All" || row.grade === grade) &&
        (subject === "All" || row.subject === subject)
      )
      .map((row) => row.lo)
  ), [data, district, grade, subject]);

  const districtRows = useMemo(() => data.districtWise.filter((row) => district === "All" || row.district === district), [data, district]);
  const gradeRows = useMemo(() => data.gradeWise.filter((row) =>
    (district === "All" || row.district === district) && (grade === "All" || row.grade === grade)
  ), [data, district, grade]);
  const subjectRows = useMemo(() => data.subjectWise.filter((row) =>
    (district === "All" || row.district === district) &&
    (grade === "All" || row.grade === grade) &&
    (subject === "All" || row.subject === subject)
  ), [data, district, grade, subject]);
  const stateSubjectRows = useMemo(() => data.subjectWise.filter((row) =>
    (grade === "All" || row.grade === grade) &&
    (subject === "All" || row.subject === subject)
  ), [data, grade, subject]);
  const subjectAverageStateRow = useMemo(() => {
    if (!stateSubjectRows.length) return null;
    const mathValues = stateSubjectRows.map((row) => Number(row.subjects?.math || 0)).filter((v) => !Number.isNaN(v));
    const scienceValues = stateSubjectRows.map((row) => Number(row.subjects?.science || 0)).filter((v) => !Number.isNaN(v));
    const englishValues = stateSubjectRows.map((row) => Number(row.subjects?.english || 0)).filter((v) => !Number.isNaN(v));
    const gujaratiValues = stateSubjectRows.map((row) => Number(row.subjects?.gujarati || 0)).filter((v) => !Number.isNaN(v));
    const totalQuestionMarksValues = stateSubjectRows.map((row) => Number(row.totalQuestionMarks || 0)).filter((v) => !Number.isNaN(v));
    const totalObtainedScoreValues = stateSubjectRows.map((row) => Number(row.totalObtainedScore || 0)).filter((v) => !Number.isNaN(v));

    return {
      district: "GUJARAT STATE AVERAGE",
      grade: grade === "All" ? "All Grades" : grade,
      subject: subject === "All" ? "All Subjects" : subject,
      totalQuestionMarks: Number(average(totalQuestionMarksValues).toFixed(0)),
      totalObtainedScore: Number(average(totalObtainedScoreValues).toFixed(0)),
      averageScore: Number(average(stateSubjectRows.map((row) => row.averageScore)).toFixed(1)),
      subjects: {
        math: Number(average(mathValues).toFixed(1)),
        science: Number(average(scienceValues).toFixed(1)),
        english: Number(average(englishValues).toFixed(1)),
        gujarati: Number(average(gujaratiValues).toFixed(1)),
      },
    };
  }, [stateSubjectRows, grade, subject]);

  const subjectDisplayRows = useMemo(() => {
    if (district === "All") return subjectRows;
    return subjectRows.length && subjectAverageStateRow
      ? [...subjectRows, subjectAverageStateRow]
      : subjectRows;
  }, [district, subjectRows, subjectAverageStateRow]);

  const loRows = useMemo(() => data.loWise.filter((row) =>
    (district === "All" || row.district === district) &&
    (grade === "All" || row.grade === grade) &&
    (subject === "All" || row.subject === subject) &&
    (learningOutcome === "All" || row.lo === learningOutcome)
  ), [data, district, grade, subject, learningOutcome]);
  const stateLoRows = useMemo(() => data.loWise.filter((row) =>
    (grade === "All" || row.grade === grade) &&
    (subject === "All" || row.subject === subject) &&
    (learningOutcome === "All" || row.lo === learningOutcome)
  ), [data, grade, subject, learningOutcome]);
  const loDisplayRows = useMemo(() => {
    const comparisonRow = (rows) => ({
      district: "GUJARAT STATE AVERAGE",
      grade: grade === "All" ? "All Grades" : grade,
      subject: subject === "All" ? "All Subjects" : subject,
      lo: learningOutcome === "All" ? "All Learning Outcomes" : learningOutcome,
      indicator: "State average for the selected filters",
      averageScore: Number(average(rows).toFixed(1)),
      isStateAverage: true,
    });
    return district === "All"
      ? loRows
      : [...loRows, ...(stateLoRows.length ? [comparisonRow(stateLoRows)] : [])];
  }, [district, grade, learningOutcome, loRows, stateLoRows, subject]);
  const visibleLoRows = useMemo(() => loDisplayRows.slice(loPage * 50, loPage * 50 + 50), [loDisplayRows, loPage]);

  const updateDistrict = (value) => {
    setDistrict(value);
    setGrade("All");
    setSubject("All");
    setLearningOutcome("All");
    setLoPage(0);
  };
  const updateGrade = (value) => {
    setGrade(value);
    setSubject("All");
    setLearningOutcome("All");
    setLoPage(0);
  };
  const updateSubject = (value) => {
    setSubject(value);
    setLearningOutcome("All");
    setLoPage(0);
  };

  if (loading) return <Box sx={{ py: 5, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 1 }}>Loading Semester 2 workbook data…</Typography></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #E4E7F0", bgcolor: "#FBFBFE" }}>
        <Typography sx={{ fontWeight: 700, color: "#16233B", mb: 2 }}>Semester 2 data drill-down</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><FormControl fullWidth size="small"><InputLabel>District</InputLabel><Select value={district} label="District" onChange={(event) => updateDistrict(event.target.value)}><MenuItem value="All">All Districts</MenuItem>{districts.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><FormControl fullWidth size="small"><InputLabel>Grade</InputLabel><Select value={grade} label="Grade" onChange={(event) => updateGrade(event.target.value)}><MenuItem value="All">All Grades</MenuItem>{grades.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><FormControl fullWidth size="small"><InputLabel>Subject</InputLabel><Select value={subject} label="Subject" onChange={(event) => updateSubject(event.target.value)}><MenuItem value="All">All Subjects</MenuItem>{subjects.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><FormControl fullWidth size="small"><InputLabel>Learning outcome</InputLabel><Select value={learningOutcome} label="Learning outcome" onChange={(event) => { setLearningOutcome(event.target.value); setLoPage(0); }}><MenuItem value="All">All Learning Outcomes</MenuItem>{learningOutcomes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
        </Grid>
      </Paper>

      <Section title="District-wise SAT Data" subtitle={`${districtRows.length} district records · actual total and obtained question marks`}>
        <Box sx={{ height: 360, mb: 3 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={districtRows} margin={{ top: 16, right: 16, left: 0, bottom: 70 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="district" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} /><Tooltip formatter={(value) => percent(value)} /><Bar dataKey="averageScore" name="Average score" fill="#1976D2" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></Box>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}><Table stickyHeader size="small"><TableHead><TableRow><HeaderCell>District</HeaderCell><HeaderCell align="right">Total Question Marks</HeaderCell><HeaderCell align="right">Obtained Score</HeaderCell><HeaderCell align="right">Average Score</HeaderCell></TableRow></TableHead><TableBody>{districtRows.map((row) => <TableRow key={row.district} hover><TableCell>{row.district}</TableCell><TableCell align="right">{marks(row.totalQuestionMarks)}</TableCell><TableCell align="right">{marks(row.totalObtainedScore)}</TableCell><TableCell align="right">{percent(row.averageScore)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
      </Section>

      <Section title="District Grade-wise SAT Data" subtitle={`${gradeRows.length} records · filtered by district and grade`}>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 460 }}><Table stickyHeader size="small"><TableHead><TableRow><HeaderCell>District</HeaderCell><HeaderCell>Grade</HeaderCell><HeaderCell align="right">Total Question Marks</HeaderCell><HeaderCell align="right">Obtained Score</HeaderCell><HeaderCell align="right">Average Score</HeaderCell></TableRow></TableHead><TableBody>{gradeRows.map((row, index) => <TableRow key={`${row.district}-${row.grade}-${index}`} hover><TableCell>{row.district}</TableCell><TableCell>{row.grade}</TableCell><TableCell align="right">{marks(row.totalQuestionMarks)}</TableCell><TableCell align="right">{marks(row.totalObtainedScore)}</TableCell><TableCell align="right">{percent(row.averageScore)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
      </Section>

      <Section title="District Grade Subject-wise SAT Data" subtitle={`${subjectDisplayRows.length} records · choose a subject to narrow the table`}>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1E293B" }}>
                <HeaderCell>District</HeaderCell>
                <HeaderCell>Grade</HeaderCell>
                <HeaderCell>Subject</HeaderCell>
                <HeaderCell align="right">Total Question Marks</HeaderCell>
                <HeaderCell align="right">Obtained Score</HeaderCell>
                <HeaderCell align="right">Average Score</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(subjectDisplayRows || []).map((row, index) => {
                const isAverage = row.district === "GUJARAT STATE AVERAGE";
                const rowColor = isAverage ? "#F1F5F9" : "transparent";
                return (
                  <TableRow key={`${row.district}-${row.grade}-${row.subject}-${index}`} hover sx={{ backgroundColor: rowColor }}>
                    <TableCell>{row.district}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell align="right">{row.totalQuestionMarks ? marks(row.totalQuestionMarks) : "-"}</TableCell>
                    <TableCell align="right">{row.totalObtainedScore ? marks(row.totalObtainedScore) : "-"}</TableCell>
                    <ScoreCell value={row.averageScore} />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section title="District Grade Subject Learning Outcome-wise SAT Data" subtitle={`${loRows.length.toLocaleString("en-IN")} records · select district, grade, subject and learning outcome for the full drill-down`}>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}><Table stickyHeader size="small"><TableHead><TableRow><HeaderCell>District</HeaderCell><HeaderCell>Grade</HeaderCell><HeaderCell>Subject</HeaderCell><HeaderCell>LO</HeaderCell><HeaderCell>Indicator</HeaderCell><HeaderCell align="right">Total Marks</HeaderCell><HeaderCell align="right">Obtained</HeaderCell><HeaderCell align="right">Score</HeaderCell></TableRow></TableHead><TableBody>{visibleLoRows.map((row, index) => <TableRow key={`${row.district}-${row.grade}-${row.subject}-${row.lo}-${index}`} hover><TableCell>{row.district}</TableCell><TableCell>{row.grade}</TableCell><TableCell>{row.subject}</TableCell><TableCell>{row.lo}</TableCell><TableCell sx={{ minWidth: 360 }}>{row.indicator}</TableCell><TableCell align="right">{marks(row.totalQuestionMarks)}</TableCell><TableCell align="right">{marks(row.totalObtainedScore)}</TableCell><TableCell align="right">{percent(row.averageScore)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
        <TablePagination component="div" count={loDisplayRows.length} page={loPage} onPageChange={(_, page) => setLoPage(page)} rowsPerPage={50} rowsPerPageOptions={[50]} />
      </Section>
    </Box>
  );
};

export default SATWorkbookExplorer;
