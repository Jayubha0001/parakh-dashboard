import { Grid, Paper, Typography, Box } from "@mui/material";

import goi from "../../data/pmshriGOI.json";
import gog from "../../data/pmshriGOG.json";
import { SectionHeading, CardShell, fmt } from "./shared";

const latest = (arr) => arr[arr.length - 1];

const avg = (arr, key) => {
  const vals = arr.map((r) => r[key]).filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

// Side-by-side snapshot of the two source analyses (GOI Final +
// GOG 426) so the Overview tab isn't just the old GSQAC workbook —
// it now surfaces both new files at a glance too. GOG schools are
// primary-only, so there's no Std 10/12 board result for that column
// — shown as N/A rather than a blank/misleading zero.
const CombinedOverview = () => {
  const goiEnr = latest(goi.stateEnrollment);
  const goiGSQAC = latest(goi.stateGSQAC);
  const goiG1012 = latest(goi.stateGrade1012);

  const gogTotalSchools = gog.stateMetrics.find((m) => m.metric === "Total Schools (PM SHRI)")?.value;
  const gogEnr25 = gog.stateMetrics.find((m) => m.metric === "Total Enrollment 2025-26")?.value;
  const gogAvgGSQAC = avg(gog.schoolGSQACDetail, "% 2024-25");

  const rows = [
    { label: "Schools Covered", goi: `${goi.districtEnrollment.find((d) => d.District?.includes("STATE"))?.["No. of Schools"] ?? "—"}`, gog: gogTotalSchools },
    { label: `Total Enrollment (latest)`, goi: fmt(goiEnr.totalEnrollment), gog: fmt(gogEnr25) },
    { label: "Avg GSQAC %", goi: `${goiGSQAC.avgPct.toFixed(1)}%`, gog: gogAvgGSQAC != null ? `${gogAvgGSQAC.toFixed(1)}%` : "—" },
    { label: "Avg Grade 10 Board %", goi: `${goiG1012.avgGrade10.toFixed(1)}%`, gog: "N/A — primary schools only" },
    { label: "Avg Grade 12 Board %", goi: `${goiG1012.avgGrade12.toFixed(1)}%`, gog: "N/A — primary schools only" },
  ];

  return (
    <CardShell accent="#0F172A">
      <SectionHeading
        eyebrow="Combined Overview"
        title="GOI Analysis vs GOG 426 Analysis — Side by Side"
        subtitle="Quick comparison across both source analyses. Full detail is in the GOI Analysis and GOG 426 Deep-Dive tabs above."
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ border: "1px solid #E4E7F0", borderLeft: "4px solid #1976D2", borderRadius: 2.5, p: 2, height: "100%" }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#1976D2", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>
              GOI Analysis
            </Typography>
            {rows.map((r) => (
              <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.6, borderBottom: "1px solid #F0F1F5" }}>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', color: "#16233B" }}>{r.goi}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ border: "1px solid #E4E7F0", borderLeft: "4px solid #8E24AA", borderRadius: 2.5, p: 2, height: "100%" }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#8E24AA", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>
              GOG 426 Analysis
            </Typography>
            {rows.map((r) => (
              <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.6, borderBottom: "1px solid #F0F1F5" }}>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', color: "#16233B" }}>{r.gog}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </CardShell>
  );
};

export default CombinedOverview;
