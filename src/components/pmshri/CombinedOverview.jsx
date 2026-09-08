import { Grid, Paper, Typography, Box } from "@mui/material";
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

import goi from "../../data/pmshriGOI.json";
import gog from "../../data/pmshriGOG.json";
import { SectionHeading, CardShell, AnalysisDataTable, fmt } from "./shared";

const latest = (arr) => arr[arr.length - 1];

const avg = (arr, key) => {
  const vals = arr.map((r) => r[key]).filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

// Both JSON files' "District" fields are pre-canonicalized (see
// parse/canonicalize.py) to the same spelling the rest of the app uses
// (satDistrictMap.js), so merging here is a direct key match — no more
// separate ad-hoc normalization needed.
const buildDistrictComparison = () => {
  const goiEnrByD = new Map(goi.districtEnrollment.filter((d) => !d.District?.includes("STATE")).map((d) => [d.District, d]));
  const goiGSQACByD = new Map(goi.districtGSQAC.filter((d) => !d.District?.includes("STATE")).map((d) => [d.District, d]));
  const gogEnrByD = new Map(gog.districtEnrollResult.map((d) => [d.District, d]));
  const gogGSQACByD = new Map(gog.districtGSQACResult.map((d) => [d.District, d]));

  const allKeys = new Set([...goiEnrByD.keys(), ...gogEnrByD.keys()]);
  return Array.from(allKeys)
    .map((key) => {
      const gEnr = goiEnrByD.get(key);
      const gGsqac = goiGSQACByD.get(key);
      const ogEnr = gogEnrByD.get(key);
      const ogGsqac = gogGSQACByD.get(key);
      return {
        District: key,
        "GOI Schools": gEnr?.["No. of Schools"] ?? "—",
        "GOI Enrollment 2025-26": gEnr?.["Enrollment 2025-26"] ?? "—",
        "GOI Avg GSQAC % 24-25": gGsqac?.["Avg GSQAC% 2024-25"] ?? "—",
        "GOG Schools": ogEnr?.["Total Schools"] ?? "—",
        "GOG Enrollment 2025-26": ogEnr?.["Enrollment 2025-26"] ?? "—",
        "GOG Avg GSQAC % 24-25": ogGsqac?.["Avg % (2024-25)"] ?? "—",
      };
    })
    .sort((a, b) => (a.District > b.District ? 1 : -1));
};

const CompareRow = ({ label, district, state }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.6, borderBottom: "1px solid #F0F1F5" }}>
    <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{label}</Typography>
    <Box sx={{ textAlign: "right" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', color: "#16233B" }}>{district}</Typography>
      <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>State: {state}</Typography>
    </Box>
  </Box>
);

// Side-by-side snapshot of the two source analyses (GOI Final +
// GOG 426) so the Overview tab isn't just the old GSQAC workbook —
// it now surfaces both new files at a glance too. GOG schools are
// primary-only, so there's no Std 10/12 board result for that column
// — shown as N/A rather than a blank/misleading zero.
// `selectedDistrict` is passed down from the ONE district filter at the
// top of the page — this card no longer keeps its own separate filter.
const CombinedOverview = ({ selectedDistrict = "All", priorityOnly = false, priorityDistricts = [] }) => {
  const goiEnr = latest(goi.stateEnrollment);
  const goiGSQAC = latest(goi.stateGSQAC);
  const goiG1012 = latest(goi.stateGrade1012);

  const goiTotalSchools = goi.districtEnrollment.find((d) => d.District?.includes("STATE"))?.["No. of Schools"] ?? "—";
  const gogTotalSchools = gog.stateMetrics.find((m) => m.metric === "Total Schools (PM SHRI)")?.value;
  const gogEnr24 = gog.stateMetrics.find((m) => m.metric === "Total Enrollment 2024-25")?.value;
  const gogEnr25 = gog.stateMetrics.find((m) => m.metric === "Total Enrollment 2025-26")?.value;
  const gogAvgGSQAC = avg(gog.schoolGSQACDetail, "% 2024-25");

  const rows = [
    { label: "Schools Covered", goi: `${goiTotalSchools}`, gog: gogTotalSchools },
    { label: `Total Enrollment (latest)`, goi: fmt(goiEnr.totalEnrollment), gog: fmt(gogEnr25) },
    { label: "Avg GSQAC %", goi: `${goiGSQAC.avgPct.toFixed(1)}%`, gog: gogAvgGSQAC != null ? `${gogAvgGSQAC.toFixed(1)}%` : "—" },
    { label: "Avg Grade 10 Board %", goi: `${goiG1012.avgGrade10.toFixed(1)}%`, gog: "N/A — primary schools only" },
    { label: "Avg Grade 12 Board %", goi: `${goiG1012.avgGrade12.toFixed(1)}%`, gog: "N/A — primary schools only" },
  ];

  // Priority-districts-only aggregates — computed straight from the raw
  // per-district arrays (not the state-wide summaries above), so toggling
  // "Priority Districts Only" actually narrows these numbers down to the
  // 10 focus districts instead of leaving the state totals unchanged.
  const inPriority = (d) => priorityDistricts.includes(d);

  const goiPriorityEnrRows = goi.districtEnrollment.filter((d) => !d.District?.includes("STATE") && inPriority(d.District));
  const goiPrioritySchools = goiPriorityEnrRows.reduce((s, d) => s + (Number(d["No. of Schools"]) || 0), 0);
  const goiPriorityEnr = goiPriorityEnrRows.reduce((s, d) => s + (Number(d["Enrollment 2025-26"]) || 0), 0);
  const goiPriorityGSQAC = avg(goi.districtGSQAC.filter((d) => inPriority(d.District)), "Avg GSQAC% 2024-25");
  const goiPriorityGrade10 = avg(goi.districtGrade10.filter((d) => inPriority(d.District)), "Avg Result% 2025-26");
  const goiPriorityGrade12 = avg(goi.districtGrade12.filter((d) => inPriority(d.District)), "Avg Overall% 2025-26");

  const gogPriorityEnrRows = gog.districtEnrollResult.filter((d) => inPriority(d.District));
  const gogPrioritySchools = gogPriorityEnrRows.reduce((s, d) => s + (Number(d["Total Schools"]) || 0), 0);
  const gogPriorityEnr = gogPriorityEnrRows.reduce((s, d) => s + (Number(d["Enrollment 2025-26"]) || 0), 0);
  const gogPriorityGSQAC = avg(gog.districtGSQACResult.filter((d) => inPriority(d.District)), "Avg % (2024-25)");

  const priorityRows = [
    { label: "Schools Covered", goi: `${goiPrioritySchools}`, gog: `${gogPrioritySchools}` },
    { label: "Total Enrollment (latest)", goi: fmt(goiPriorityEnr), gog: fmt(gogPriorityEnr) },
    { label: "Avg GSQAC %", goi: goiPriorityGSQAC != null ? `${goiPriorityGSQAC.toFixed(1)}%` : "—", gog: gogPriorityGSQAC != null ? `${gogPriorityGSQAC.toFixed(1)}%` : "—" },
    { label: "Avg Grade 10 Board %", goi: goiPriorityGrade10 != null ? `${goiPriorityGrade10.toFixed(1)}%` : "—", gog: "N/A — primary schools only" },
    { label: "Avg Grade 12 Board %", goi: goiPriorityGrade12 != null ? `${goiPriorityGrade12.toFixed(1)}%` : "—", gog: "N/A — primary schools only" },
  ];

  const usePriorityView = selectedDistrict === "All" && priorityOnly && priorityDistricts.length > 0;
  const overviewRows = usePriorityView ? priorityRows : rows;

  const enrollmentChartData = usePriorityView
    ? [{ year: "2025-26", GOI: goiPriorityEnr, GOG: gogPriorityEnr }]
    : [
        { year: "2024-25", GOI: goi.stateEnrollment.find((r) => r.year === "2024-25")?.totalEnrollment, GOG: gogEnr24 },
        { year: "2025-26", GOI: goiEnr.totalEnrollment, GOG: gogEnr25 },
      ];

  const gsqacChartData = usePriorityView
    ? [{ year: "2024-25", GOI: goiPriorityGSQAC != null ? Number(goiPriorityGSQAC.toFixed(1)) : null, GOG: gogPriorityGSQAC != null ? Number(gogPriorityGSQAC.toFixed(1)) : null }]
    : [{ year: "2024-25", GOI: Number(goi.stateGSQAC.find((r) => r.year === "2024-25")?.avgPct?.toFixed(1)), GOG: gogAvgGSQAC != null ? Number(gogAvgGSQAC.toFixed(1)) : null }];

  const districtComparisonAll = buildDistrictComparison();
  const districtComparison = priorityOnly ? districtComparisonAll.filter((d) => inPriority(d.District)) : districtComparisonAll;
  const selectedRow = selectedDistrict === "All" ? null : districtComparisonAll.find((d) => d.District === selectedDistrict);

  return (
    <CardShell accent="#0F172A">
      <SectionHeading
        eyebrow="Combined Overview"
        title="GOI Analysis vs GOG 426 Analysis — Side by Side"
        subtitle={
          usePriorityView
            ? "⭐ Priority Districts Only — totals below are the sum/average across the 10 focus districts, not the full state."
            : "Merged view across both source analyses. Use the District filter above to drill into one district — it applies here too."
        }
      />

      {selectedDistrict === "All" ? (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ border: "1px solid #E4E7F0", borderLeft: "4px solid #1976D2", borderRadius: 2.5, p: 2, height: "100%" }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#1976D2", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>
                  GOI Analysis — {usePriorityView ? "Priority Districts (10)" : "State"}
                </Typography>
                {overviewRows.map((r) => (
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
                  GOG 426 Analysis — {usePriorityView ? "Priority Districts (10)" : "State"}
                </Typography>
                {overviewRows.map((r) => (
                  <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.6, borderBottom: "1px solid #F0F1F5" }}>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{r.label}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', color: "#16233B" }}>{r.gog}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
                Enrollment — GOI vs GOG{usePriorityView ? " (Priority Districts)" : ""}
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enrollmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="GOI" fill="#1976D2" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="GOG" fill="#8E24AA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
                Avg GSQAC % (2024-25) — GOI vs GOG{usePriorityView ? " (Priority Districts)" : ""}
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gsqacChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="GOI" fill="#1976D2" radius={[6, 6, 0, 0]} barSize={60} />
                  <Bar dataKey="GOG" fill="#8E24AA" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#16233B", mb: 1 }}>
            District-wise: GOI vs GOG, Enrollment & GSQAC Merged{priorityOnly ? ` — ⭐ Priority Districts Only (${districtComparison.length})` : ""}
          </Typography>
          <AnalysisDataTable
            rows={districtComparison}
            pageSize={15}
            columns={[
              { key: "District", label: "District" },
              { key: "GOI Schools", label: "GOI Schools", mono: true },
              { key: "GOI Enrollment 2025-26", label: "GOI Enr. 25-26", mono: true },
              { key: "GOI Avg GSQAC % 24-25", label: "GOI GSQAC %", mono: true },
              { key: "GOG Schools", label: "GOG Schools", mono: true },
              { key: "GOG Enrollment 2025-26", label: "GOG Enr. 25-26", mono: true },
              { key: "GOG Avg GSQAC % 24-25", label: "GOG GSQAC %", mono: true },
            ]}
          />
        </>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ border: "1px solid #E4E7F0", borderLeft: "4px solid #1976D2", borderRadius: 2.5, p: 2, height: "100%" }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#1976D2", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>
                GOI — {selectedDistrict}
              </Typography>
              <CompareRow label="Schools" district={fmt(selectedRow?.["GOI Schools"])} state={fmt(goiTotalSchools)} />
              <CompareRow label="Enrollment 2025-26" district={fmt(selectedRow?.["GOI Enrollment 2025-26"])} state={fmt(goiEnr.totalEnrollment)} />
              <CompareRow label="Avg GSQAC % 24-25" district={typeof selectedRow?.["GOI Avg GSQAC % 24-25"] === "number" ? `${selectedRow["GOI Avg GSQAC % 24-25"].toFixed(1)}%` : "—"} state={`${goiGSQAC.avgPct.toFixed(1)}%`} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ border: "1px solid #E4E7F0", borderLeft: "4px solid #8E24AA", borderRadius: 2.5, p: 2, height: "100%" }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#8E24AA", textTransform: "uppercase", letterSpacing: 0.4, mb: 1 }}>
                GOG — {selectedDistrict}
              </Typography>
              <CompareRow label="Schools" district={fmt(selectedRow?.["GOG Schools"])} state={fmt(gogTotalSchools)} />
              <CompareRow label="Enrollment 2025-26" district={fmt(selectedRow?.["GOG Enrollment 2025-26"])} state={fmt(gogEnr25)} />
              <CompareRow
                label="Avg GSQAC % 24-25"
                district={typeof selectedRow?.["GOG Avg GSQAC % 24-25"] === "number" ? `${selectedRow["GOG Avg GSQAC % 24-25"].toFixed(1)}%` : "—"}
                state={gogAvgGSQAC != null ? `${gogAvgGSQAC.toFixed(1)}%` : "—"}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </CardShell>
  );
};

export default CombinedOverview;
