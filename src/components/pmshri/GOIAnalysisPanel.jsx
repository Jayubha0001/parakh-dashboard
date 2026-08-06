import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import goi from "../../data/pmshriGOI.json";
import { SectionHeading, StatMiniGrid, AnalysisDataTable, CardShell, fmt } from "./shared";

const latest = (arr) => arr[arr.length - 1];

// UDISE codes are internal IDs, not a figure to compare — and formatting
// them through the numeric formatter added misleading thousands-commas.
// Drop that column wherever we auto-derive columns from the sheet's own keys.
const autoColumns = (sample = {}) =>
  Object.keys(sample)
    .filter((k) => !k.toLowerCase().includes("udise"))
    .map((k) => ({
      key: k,
      label: k,
      mono: k.toLowerCase().includes("result") || k === "Sr. No.",
    }));

const GOIAnalysisPanel = () => {
  const latestEnr = latest(goi.stateEnrollment);
  const latestGSQAC = latest(goi.stateGSQAC);
  const latestG1012 = latest(goi.stateGrade1012);

  return (
    <Box>
      {/* State-level headline metrics */}
      <CardShell>
        <SectionHeading
          eyebrow="PM SHRI · GOI Analysis"
          title="State-level Enrollment, GSQAC & Board Result Summary"
          subtitle="Year-on-year comparison across all Gujarat PM SHRI schools (source: PM_SHRI_GOI_Final analysis)"
        />
        <StatMiniGrid
          cols={4}
          items={[
            { label: `Enrollment (${latestEnr.year})`, value: latestEnr.totalEnrollment, accent: "#1976D2" },
            { label: `Avg GSQAC % (${latestGSQAC.year})`, value: `${latestGSQAC.avgPct.toFixed(1)}%`, accent: "#8E24AA" },
            { label: `Avg Grade 10 % (${latestG1012.year})`, value: `${latestG1012.avgGrade10.toFixed(1)}%`, accent: "#2E7D32" },
            { label: `Avg Grade 12 % (${latestG1012.year})`, value: `${latestG1012.avgGrade12.toFixed(1)}%`, accent: "#F0B429" },
          ]}
        />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
              Total Enrollment by Year
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={goi.stateEnrollment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalEnrollment" name="Enrollment" fill="#1976D2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
              Avg GSQAC % by Year
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={goi.stateGSQAC}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgPct" name="Avg GSQAC %" stroke="#8E24AA" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardShell>

      {/* District — Enrollment */}
      <CardShell accent="#1976D2">
        <SectionHeading eyebrow="Enrollment" title="District-wise Enrollment Trend (Grade 1–12)" color="#1976D2" />
        <AnalysisDataTable
          rows={goi.districtEnrollment}
          searchable
          districtFilterKey="District"
          pageSize={15}
          columns={[
            { key: "District", label: "District" },
            { key: "No. of Schools", label: "Schools", mono: true },
            { key: "Enrollment 2022-23", label: "2022-23", mono: true },
            { key: "Enrollment 2023-24", label: "2023-24", mono: true },
            { key: "Enrollment 2024-25", label: "2024-25", mono: true },
            { key: "Enrollment 2025-26", label: "2025-26", mono: true, bold: true },
            { key: "Schools with Enrollment ↑ (latest yr)", label: "Schools ↑", mono: true },
            { key: "Schools with Enrollment ↓ (latest yr)", label: "Schools ↓", mono: true },
            { key: "Overall Trend", label: "Trend" },
          ]}
        />
      </CardShell>

      {/* District — GSQAC */}
      <CardShell accent="#8E24AA">
        <SectionHeading eyebrow="GSQAC" title="District-wise GSQAC Result Trend" color="#8E24AA" />
        <AnalysisDataTable
          rows={goi.districtGSQAC}
          searchable
          districtFilterKey="District"
          pageSize={15}
          columns={[
            { key: "District", label: "District" },
            { key: "Schools with GSQAC Data", label: "Schools", mono: true },
            { key: "Avg GSQAC% 2022-23", label: "2022-23 %", mono: true },
            { key: "Avg GSQAC% 2023-24", label: "2023-24 %", mono: true },
            { key: "Avg GSQAC% 2024-25", label: "2024-25 %", mono: true, bold: true },
            { key: "Schools Improved (23-24→24-25)", label: "Improved", mono: true },
            { key: "Schools Declined (23-24→24-25)", label: "Declined", mono: true },
            { key: "Overall Trend (latest)", label: "Trend" },
          ]}
        />
      </CardShell>

      {/* District — Grade 10 & 12 */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CardShell accent="#2E7D32">
            <SectionHeading eyebrow="Grade 10" title="District-wise Grade 10 Board Result" color="#2E7D32" />
            <AnalysisDataTable
              rows={goi.districtGrade10}
              searchable
              pageSize={10}
              columns={[
                { key: "District", label: "District" },
                { key: "Schools with Grade10 Data", label: "Schools", mono: true },
                { key: "Avg Result% 2025-26", label: "2025-26 %", mono: true, bold: true },
                { key: "Overall Trend (latest)", label: "Trend" },
              ]}
            />
          </CardShell>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CardShell accent="#F0B429">
            <SectionHeading eyebrow="Grade 12" title="District-wise Grade 12 Board Result" color="#C9971F" />
            <AnalysisDataTable
              rows={goi.districtGrade12}
              searchable
              pageSize={10}
              columns={[
                { key: "District", label: "District" },
                { key: "Schools with Grade12 Data", label: "Schools", mono: true },
                { key: "Avg Overall% 2025-26", label: "2025-26 %", mono: true, bold: true },
                { key: "Overall Trend (latest)", label: "Trend" },
              ]}
            />
          </CardShell>
        </Grid>
      </Grid>

      {/* 100% Result Schools */}
      <CardShell accent="#2E7D32">
        <SectionHeading eyebrow="Top Performers" title="Schools with 100% Board Result (2025-26)" color="#2E7D32" />
        {goi.hundredPctResult.map((sec) => (
          <Accordion key={sec.title} elevation={0} sx={{ border: "1px solid #E4E7F0", mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                {sec.title} — {sec.total} schools
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AnalysisDataTable
                rows={sec.schools}
                searchable
                pageSize={10}
                columns={autoColumns(sec.schools[0])}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </CardShell>

      {/* Result bands 80-90 & below 70 */}
      <CardShell accent="#D32F2F">
        <SectionHeading eyebrow="Needs Attention" title="Schools in 80–90% Band & Below 70% (Std 10 / Std 12, 2025-26)" color="#D32F2F" />
        {goi.resultBands.map((sec) => (
          <Accordion key={sec.title} elevation={0} sx={{ border: "1px solid #E4E7F0", mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                {sec.title} — {sec.total} schools
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {sec.schools.length ? (
                <AnalysisDataTable
                  rows={sec.schools}
                  searchable
                  pageSize={10}
                  columns={autoColumns(sec.schools[0])}
                />
              ) : (
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No schools in this band.</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </CardShell>

      {/* Std 12 stream-wise result bands */}
      <CardShell accent="#1976D2">
        <SectionHeading eyebrow="Std 12 Streams" title="Class 12 Stream-wise Achievement Bands (Arts / Commerce / Science)" color="#1976D2" />
        <Grid container spacing={2}>
          {goi.std12StreamBands.map((stream) => (
            <Grid size={{ xs: 12, md: 4 }} key={stream.title}>
              <Paper elevation={0} sx={{ border: "1px solid #E4E7F0", borderRadius: 2.5, p: 2, height: "100%" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#16233B", mb: 1 }}>{stream.title}</Typography>
                <AnalysisDataTable
                  rows={stream.bands}
                  pageSize={10}
                  columns={[
                    { key: "band", label: "Band" },
                    { key: "2023-24", label: "23-24", mono: true },
                    { key: "2024-25", label: "24-25", mono: true },
                    { key: "2025-26", label: "25-26", mono: true, bold: true },
                  ]}
                />
                <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 1 }}>
                  Total schools: {fmt(stream.totals["2023-24"])} → {fmt(stream.totals["2024-25"])} → {fmt(stream.totals["2025-26"])}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardShell>
    </Box>
  );
};

export default GOIAnalysisPanel;
