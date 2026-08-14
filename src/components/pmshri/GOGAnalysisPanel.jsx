import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

import gog from "../../data/pmshriGOG.json";
import { SectionHeading, StatMiniGrid, AnalysisDataTable, CardShell, GradeChip, fmt } from "./shared";

const GRADE_PIE_COLORS = { "A+": "#2E7D32", A: "#66BB6A", B: "#F0B429", C: "#EF6C00", NA: "#B0BEC5" };

const metricValue = (label) => gog.stateMetrics.find((m) => m.metric === label)?.value;

const GOGAnalysisPanel = ({ selectedDistrict = "All" }) => {
  return (
    <Box>
      {/* State overview */}
      <CardShell>
        <SectionHeading
          eyebrow="PM SHRI · GOG 426 Deep-Dive"
          title="State Overview — 426 GOG PM SHRI Schools"
          subtitle="Enrollment, GSQAC grade movement and management-type analysis (source: PM_SHRI_GOG_426_Analysis_Final)"
        />
        <StatMiniGrid
          cols={4}
          items={[
            { label: "Total Schools", value: metricValue("Total Schools (PM SHRI)"), accent: "#0F172A" },
            { label: "Districts Covered", value: metricValue("Total Districts Covered"), accent: "#1976D2" },
            { label: "Enrollment 2025-26", value: metricValue("Total Enrollment 2025-26"), accent: "#2E7D32" },
            { label: "Net Enrollment Change", value: metricValue("Net Enrollment Change (2025-26 vs 2024-25)"), accent: "#D32F2F" },
          ]}
        />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
              GSQAC Grade Distribution — 2024-25
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={gog.gradeDistribution2425.filter((g) => g.schools > 0)}
                  dataKey="schools"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(d) => `${d.grade}: ${d.schools}`}
                >
                  {gog.gradeDistribution2425.filter((g) => g.schools > 0).map((g) => (
                    <Cell key={g.grade} fill={GRADE_PIE_COLORS[g.grade] || "#B0BEC5"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
              GSQAC % Movement (2023-24 → 2024-25)
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gog.gsqacMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="schools" name="Schools" fill="#8E24AA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardShell>

      {/* District Enrollment + school detail */}
      <CardShell accent="#1976D2">
        <SectionHeading eyebrow="Enrollment" title="District-wise Enrollment Result (2025-26 vs 2024-25)" color="#1976D2" />
        <AnalysisDataTable
          rows={gog.districtEnrollResult}
          searchable
          districtFilterKey="District"
                externalDistrict={selectedDistrict}
          pageSize={15}
          columns={[
            { key: "District", label: "District" },
            { key: "Total Schools", label: "Schools", mono: true },
            { key: "Enrollment 2024-25", label: "2024-25", mono: true },
            { key: "Enrollment 2025-26", label: "2025-26", mono: true, bold: true },
            { key: "Net Change", label: "Net Change", mono: true },
            { key: "Schools Increased", label: "↑ Schools", mono: true },
            { key: "Schools Decreased", label: "↓ Schools", mono: true },
          ]}
        />
        <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", mt: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>School-wise Enrollment Detail — all 426 schools</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AnalysisDataTable
              rows={gog.schoolEnrollDetail}
              searchable
              districtFilterKey="District"
                externalDistrict={selectedDistrict}
              pageSize={15}
              columns={[
                { key: "District", label: "District" },
                { key: "Block", label: "Block" },
                { key: "School Name", label: "School" },
                { key: "Mgmt Type", label: "Mgmt" },
                { key: "Enr 2024-25", label: "24-25", mono: true },
                { key: "Enr 2025-26", label: "25-26", mono: true },
                { key: "Change (No.)", label: "Δ", mono: true },
                { key: "Change (%)", label: "Δ%", mono: true },
              ]}
            />
          </AccordionDetails>
        </Accordion>
      </CardShell>

      {/* District GSQAC + school detail */}
      <CardShell accent="#8E24AA">
        <SectionHeading eyebrow="GSQAC" title="District-wise GSQAC Result Summary — 2024-25" color="#8E24AA" />
        <AnalysisDataTable
          rows={gog.districtGSQACResult}
          searchable
          districtFilterKey="District"
                externalDistrict={selectedDistrict}
          pageSize={15}
          columns={[
            { key: "District", label: "District" },
            { key: "Total Schools", label: "Schools", mono: true },
            { key: "A+", label: "A+", mono: true },
            { key: "A", label: "A", mono: true },
            { key: "B", label: "B", mono: true },
            { key: "C", label: "C", mono: true },
            { key: "Avg % (2024-25)", label: "Avg %", mono: true, bold: true },
            { key: "Improved (%)", label: "Improved", mono: true },
            { key: "Declined (%)", label: "Declined", mono: true },
          ]}
        />
        <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", mt: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>School-wise GSQAC Detail — all 426 schools</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AnalysisDataTable
              rows={gog.schoolGSQACDetail}
              searchable
              districtFilterKey="District"
                externalDistrict={selectedDistrict}
              pageSize={15}
              columns={[
                { key: "District", label: "District" },
                { key: "Block", label: "Block" },
                { key: "School Name", label: "School" },
                { key: "Grade 2022-23", label: "22-23", render: (v) => <GradeChip grade={v} /> },
                { key: "Grade 2023-24", label: "23-24", render: (v) => <GradeChip grade={v} /> },
                { key: "Grade 2024-25", label: "24-25", render: (v) => <GradeChip grade={v} /> },
                { key: "% 2024-25", label: "% 24-25", mono: true, bold: true },
                { key: "% Point Change", label: "Δ pp", mono: true },
                { key: "Status", label: "Status" },
              ]}
            />
          </AccordionDetails>
        </Accordion>
      </CardShell>

      {/* Movement lists */}
      <CardShell accent="#2E7D32">
        <SectionHeading eyebrow="Movement" title="Schools by Enrollment & GSQAC Movement" color="#2E7D32" />
        <Grid container spacing={2}>
          {[
            { title: `Enrollment Increased — ${gog.enrollIncreased.length} schools`, rows: gog.enrollIncreased, cols: ["District", "Block", "School Name", "Mgmt Type", "Enrollment 2024-25", "Enrollment 2025-26", "Increase (No.)", "Increase (%)"] },
            { title: `Enrollment Decreased — ${gog.enrollDecreased.length} schools`, rows: gog.enrollDecreased, cols: ["District", "Block", "School Name", "Mgmt Type", "Enrollment 2024-25", "Enrollment 2025-26", "Increase (No.)", "Increase (%)"] },
            { title: `GSQAC Improved — ${gog.gsqacImproved.length} schools`, rows: gog.gsqacImproved, cols: ["District", "Block", "School Name", "Mgmt Type", "Grade 2023-24", "% 2023-24", "Grade 2024-25", "% 2024-25", "% Point Change"] },
            { title: `GSQAC Declined — ${gog.gsqacDeclined.length} schools`, rows: gog.gsqacDeclined, cols: ["District", "Block", "School Name", "Mgmt Type", "Grade 2023-24", "% 2023-24", "Grade 2024-25", "% 2024-25", "% Point Change"] },
          ].map((sec) => (
            <Grid size={{ xs: 12 }} key={sec.title}>
              <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{sec.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AnalysisDataTable
                    rows={sec.rows}
                    searchable
                    districtFilterKey="District"
                externalDistrict={selectedDistrict}
                    pageSize={10}
                    columns={sec.cols.map((k) => ({ key: k, label: k, mono: /%|No\.|Change|Grade|UDISE/.test(k) }))}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>

        <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", mt: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
              Same GSQAC Grade for 3 Years (2022-23 to 2024-25) — {gog.gradeStable3Yr.length} schools
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AnalysisDataTable
              rows={gog.gradeStable3Yr}
              searchable
              districtFilterKey="District"
                externalDistrict={selectedDistrict}
              pageSize={10}
              columns={[
                { key: "District", label: "District" },
                { key: "Block", label: "Block" },
                { key: "School Name", label: "School" },
                { key: "Mgmt Type", label: "Mgmt" },
                { key: "Grade 2022-23", label: "22-23", render: (v) => <GradeChip grade={v} /> },
                { key: "Grade 2023-24", label: "23-24", render: (v) => <GradeChip grade={v} /> },
                { key: "Grade 2024-25", label: "24-25", render: (v) => <GradeChip grade={v} /> },
              ]}
            />
          </AccordionDetails>
        </Accordion>
      </CardShell>

      {/* Management type analysis */}
      <CardShell accent="#F0B429">
        <SectionHeading eyebrow="Management Type" title="School Management Type-wise Analysis (Local Body vs MSB)" color="#C9971F" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>Overall Summary</Typography>
            <AnalysisDataTable
              rows={gog.mgmtOverall}
              pageSize={10}
              columns={[
                { key: "Mgmt Type", label: "Type" },
                { key: "Total Schools", label: "Schools", mono: true },
                { key: "% of Total", label: "% of Total", mono: true },
                { key: "Avg % Score (2024-25)", label: "Avg %", mono: true, bold: true },
                { key: "Improved (%)", label: "Improved", mono: true },
                { key: "Declined (%)", label: "Declined", mono: true },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>GSQAC Grade Distribution by Mgmt Type</Typography>
            <AnalysisDataTable
              rows={gog.mgmtGradeDistribution}
              pageSize={10}
              columns={[
                { key: "Mgmt Type", label: "Type" },
                { key: "Total Schools", label: "Schools", mono: true },
                { key: "A+", label: "A+", mono: true },
                { key: "A", label: "A", mono: true },
                { key: "B", label: "B", mono: true },
                { key: "A+ & A Share (%)", label: "A+/A Share %", mono: true, bold: true },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>Category Mix</Typography>
            <AnalysisDataTable
              rows={gog.mgmtCategory}
              pageSize={10}
              columns={[
                { key: "Mgmt Type", label: "Type" },
                { key: "Primary Only(1-5)", label: "Primary Only", mono: true },
                { key: "Upper Primary Only(1-8)", label: "Upper Pri. Only", mono: true },
                { key: "Upper Primary with grades 1 to 8", label: "UP w/ 1-8", mono: true },
                { key: "Total", label: "Total", mono: true, bold: true },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>Enrollment Movement by Mgmt Type</Typography>
            <AnalysisDataTable
              rows={gog.mgmtEnrollMovement}
              pageSize={10}
              columns={[
                { key: "Mgmt Type", label: "Type" },
                { key: "Total Schools", label: "Schools", mono: true },
                { key: "Increased", label: "↑", mono: true },
                { key: "Decreased", label: "↓", mono: true },
                { key: "Increased (%)", label: "↑ %", mono: true },
                { key: "Decreased (%)", label: "↓ %", mono: true },
              ]}
            />
          </Grid>
        </Grid>
      </CardShell>

      {/* Gender-wise */}
      <CardShell accent="#00897B">
        <SectionHeading eyebrow="Gender" title="Gender-wise Enrollment Analysis" color="#00897B" />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>State-level Trend</Typography>
            <AnalysisDataTable
              rows={gog.genderStateTrend}
              pageSize={10}
              columns={[
                { key: "Year", label: "Year" },
                { key: "Boys", label: "Boys", mono: true },
                { key: "Girls", label: "Girls", mono: true },
                { key: "Total", label: "Total", mono: true, bold: true },
                { key: "Girls Share (%)", label: "Girls %", mono: true },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>By Management Type (2024-25)</Typography>
            <AnalysisDataTable
              rows={gog.genderByMgmt}
              pageSize={10}
              columns={[
                { key: "Mgmt Type", label: "Type" },
                { key: "Boys", label: "Boys", mono: true },
                { key: "Girls", label: "Girls", mono: true },
                { key: "Total", label: "Total", mono: true, bold: true },
                { key: "Girls Share (%)", label: "Girls %", mono: true },
              ]}
            />
          </Grid>
        </Grid>

        <Accordion elevation={0} sx={{ border: "1px solid #E4E7F0", mb: 2, "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>District-wise Gender Breakdown</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AnalysisDataTable
              rows={gog.genderDistrictWise}
              searchable
              pageSize={15}
              columns={[
                { key: "District", label: "District" },
                { key: "Boys 2025-26", label: "Boys 25-26", mono: true },
                { key: "Girls 2025-26", label: "Girls 25-26", mono: true },
                { key: "Girls Share 25-26 (%)", label: "Girls % 25-26", mono: true, bold: true },
                { key: "Girls Share Change (pts)", label: "Δ pts", mono: true },
              ]}
            />
          </AccordionDetails>
        </Accordion>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>Highest Girls Share — Top 10</Typography>
            <AnalysisDataTable
              rows={gog.girlsShareTop10}
              pageSize={10}
              columns={[
                { key: "Rank", label: "#", mono: true },
                { key: "District", label: "District" },
                { key: "School Name", label: "School" },
                { key: "Girls Share (%)", label: "Girls %", mono: true, bold: true },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#16233B", mb: 1 }}>Lowest Girls Share — Bottom 10</Typography>
            <AnalysisDataTable
              rows={gog.girlsShareBottom10}
              pageSize={10}
              columns={[
                { key: "Rank", label: "#", mono: true },
                { key: "District", label: "District" },
                { key: "School Name", label: "School" },
                { key: "Girls Share (%)", label: "Girls %", mono: true, bold: true },
              ]}
            />
          </Grid>
        </Grid>
      </CardShell>

      {/* Top / Bottom GSQAC performers */}
      <CardShell accent="#0F172A">
        <SectionHeading eyebrow="Rankings" title="Top 10 & Bottom 10 Schools by GSQAC % Score — 2024-25" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#2E7D32", mb: 1 }}>Top 10 Performing Schools</Typography>
            <AnalysisDataTable
              rows={gog.gsqacTop10}
              pageSize={10}
              columns={[
                { key: "Rank", label: "#", mono: true },
                { key: "District", label: "District" },
                { key: "School Name", label: "School" },
                { key: "Mgmt Type", label: "Mgmt" },
                { key: "% Score 2024-25", label: "% Score", mono: true, bold: true },
                { key: "Grade 2024-25", label: "Grade", render: (v) => <GradeChip grade={v} /> },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#D32F2F", mb: 1 }}>Bottom 10 Performing Schools</Typography>
            <AnalysisDataTable
              rows={gog.gsqacBottom10}
              pageSize={10}
              columns={[
                { key: "Rank", label: "#", mono: true },
                { key: "District", label: "District" },
                { key: "School Name", label: "School" },
                { key: "Mgmt Type", label: "Mgmt" },
                { key: "% Score 2024-25", label: "% Score", mono: true, bold: true },
                { key: "Grade 2024-25", label: "Grade", render: (v) => <GradeChip grade={v} /> },
              ]}
            />
          </Grid>
        </Grid>
      </CardShell>
    </Box>
  );
};

export default GOGAnalysisPanel;
