import { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip } from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import PGIKPICards from "../components/PGIKPICards";
import PGIDomainCards from "../components/PGIDomainCards";
import HeatMapTable from "../components/HeatMapTable";
import Loading from "../components/Loading";
import DistrictFilterBar from "../components/DistrictFilterBar";
import ActionItemsQueue from "../components/ActionItemsQueue";
import { PGIIndicatorSection } from "../components/DistrictDeepDive";
import { Card, CardContent } from "@mui/material";
import pgiD202526 from "../data/pgiD202526.json";
import PriorityChip from "../components/PriorityChip";
import { isPriorityDistrict } from "../utils/priorityDistricts";

import {
  loadExcel,
  getStatePGISummary,
  getDistrictPGIRanking,
  getPGICategoryHeatmap,
  getPGIActionItems,
  getAllDistrictNames,
  getAllDistrictPGIActionItems,
  getDistrictPGIIndicators,
} from "../services/dataService";

// Max weight for each PGI-D category (used to compute % for colour scaling)
const CATEGORY_MAX = {
  "Outcomes (/290)": 290,
  "Classroom Transaction (/90)": 90,
  "Infrastructure (/51)": 51,
  "Safety & Protection (/35)": 35,
  "Digital Learning (/50)": 50,
  "Governance (/84)": 84,
};

// Same four-tier PGI-D grading brackets the rest of the PGI page uses
// (Akanshi / Prachesta / Utkarsh / Atti-Uttam).
const PGI_BANDS = [
  { min: 71, bg: "#E6F4EA", text: "#1B5E20", bar: "#2E7D32", label: "≥71% Atti-Uttam+" },
  { min: 51, bg: "#EEF7EE", text: "#2E7D32", bar: "#66BB6A", label: "51–70% Utkarsh" },
  { min: 31, bg: "#FFF3E0", text: "#B15C00", bar: "#FB8C00", label: "31–50% Prachesta" },
  { min: -Infinity, bg: "#FDEAEA", text: "#B71C1C", bar: "#D32F2F", label: "<31% Akanshi" },
];

const PGI = () => {
  const [loading, setLoading] = useState(true);
  const [stateSummary, setStateSummary] = useState({ domains: [], overall: {} });
  const [districtRanking2425, setDistrictRanking2425] = useState([]);
  const [heatmap2425, setHeatmap2425] = useState({ categories: [], data: [] });
  const [district, setDistrict] = useState("All");
  const [actionItems, setActionItems] = useState([]);
  const [allDistrictNames, setAllDistrictNames] = useState([]);
  const [allDistrictItems, setAllDistrictItems] = useState([]);
  const [districtIndicators, setDistrictIndicators] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const workbook = await loadExcel();

      setStateSummary(getStatePGISummary(workbook));
      setDistrictRanking2425(getDistrictPGIRanking(workbook));
      setHeatmap2425(getPGICategoryHeatmap(workbook));
      setActionItems(getPGIActionItems(workbook));
      setAllDistrictNames(getAllDistrictNames(workbook));
      setAllDistrictItems(getAllDistrictPGIActionItems(workbook));

      setLoading(false);
    }

    fetchData();
  }, []);

  // Full 70-indicator breakdown for whichever district is picked in the
  // filter bar above — loadExcel() is cached, so this is cheap even though
  // it looks like a second load.
  useEffect(() => {
    if (district === "All") {
      setDistrictIndicators(null);
      return;
    }
    let cancelled = false;
    loadExcel().then((workbook) => {
      if (!cancelled) setDistrictIndicators(getDistrictPGIIndicators(workbook, district));
    });
    return () => {
      cancelled = true;
    };
  }, [district]);

  // Both years have district-level ranking + category scores, so those
  // sections show a 2024-25 vs 2025-26 comparison directly (no year
  // toggle). The 70-indicator breakdown, state KPI cards, and action
  // items only exist for 2024-25, so those stay single-year as before.
  const ranking2526ByDistrict = new Map(pgiD202526.ranking.map((d) => [d.District, d]));

  const mergedRanking = districtRanking2425.map((d24) => {
    const d26 = ranking2526ByDistrict.get(d24.District);
    return {
      District: d24.District,
      score2425: d24.Score,
      pct2425: d24.PercentAchieved,
      grade2425: d24.Grade,
      score2526: d26?.Score ?? null,
      pct2526: d26?.PercentAchieved ?? null,
      grade2526: d26?.Grade ?? null,
      deltaPct: d26 ? Math.round((d26.PercentAchieved - d24.PercentAchieved) * 10) / 10 : null,
    };
  });

  const sortedByScore = [...mergedRanking].sort(
    (a, b) => (b.pct2526 ?? b.pct2425) - (a.pct2526 ?? a.pct2425)
  );

  const topDistrict = sortedByScore[0];
  const lowestDistrict = sortedByScore[sortedByScore.length - 1];

  const districts = ["All", ...new Set(mergedRanking.map((d) => d.District))];

  const filteredMergedRanking =
    district === "All" ? mergedRanking : mergedRanking.filter((d) => d.District === district);
  const filteredSortedRanking = [...filteredMergedRanking].sort(
    (a, b) => (b.pct2526 ?? b.pct2425) - (a.pct2526 ?? a.pct2425)
  );

  const rankingChartData = filteredSortedRanking.map((d) => ({
    District: d.District,
    "2024-25": d.pct2425,
    "2025-26": d.pct2526,
  }));

  // Always add the state average as a reference bar — most useful when a
  // single district is filtered (so it's not standing alone with nothing
  // to compare against), but included in the "All" view too for consistency.
  const stateAvg2425 = mergedRanking.reduce((s, d) => s + d.pct2425, 0) / mergedRanking.length;
  const stateAvgScore2425 = mergedRanking.reduce((s, d) => s + d.score2425, 0) / mergedRanking.length;
  const withPct2526 = mergedRanking.filter((d) => d.pct2526 != null);
  const stateAvg2526 = withPct2526.length ? withPct2526.reduce((s, d) => s + d.pct2526, 0) / withPct2526.length : null;
  const stateAvgScore2526 = withPct2526.length ? withPct2526.reduce((s, d) => s + d.score2526, 0) / withPct2526.length : null;
  rankingChartData.push({
    District: "State Average",
    "2024-25": Math.round(stateAvg2425 * 10) / 10,
    "2025-26": stateAvg2526 != null ? Math.round(stateAvg2526 * 10) / 10 : null,
  });

  // Percent-of-max rows for each year, in the plain { District, [category]: pct }
  // shape HeatMapTable's built-in dual mode (data / data2) expects — same
  // pattern already used for Sem1-vs-Sem2 elsewhere on the site.
  const toPctRows = (rows) =>
    rows.map((r) => {
      const entry = { District: r.District };
      heatmap2425.categories.forEach((cat) => {
        const max = CATEGORY_MAX[cat] || 100;
        entry[cat] = max ? ((r[cat] ?? 0) / max) * 100 : 0;
      });
      return entry;
    });

  const heatmapPct2425 = toPctRows(heatmap2425.data);
  const heatmapPct2526 = toPctRows(pgiD202526.heatmapData);

  const filteredHeatmap2425 = district === "All" ? heatmapPct2425 : heatmapPct2425.filter((d) => d.District === district);
  const filteredHeatmap2526 = district === "All" ? heatmapPct2526 : heatmapPct2526.filter((d) => d.District === district);

  // 2025-26 has no separate state-level summary sheet (unlike 2024-25's
  // stateSummary.domains, which comes straight from the workbook) — so
  // this is the average of all 33 districts' category scores, computed
  // here, not a figure pulled from a source file.
  const gradeFromPct = (pct) => (pct >= 71 ? "Atti-Uttam" : pct >= 51 ? "Utkarsh" : pct >= 31 ? "Prachesta" : "Akanshi");
  const stateCategoryAvg2526 = heatmap2425.categories.map((cat) => {
    const max = CATEGORY_MAX[cat] || 100;
    const vals = pgiD202526.heatmapData.map((r) => r[cat]).filter((v) => typeof v === "number");
    const avgScore = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const pct = max ? (avgScore / max) * 100 : 0;
    return { domain: cat, score: avgScore, maxWeight: max, percentAchieved: pct, grade: gradeFromPct(pct) };
  });

  // State-level (33-district average) view of the 6 PGI-D *categories* for
  // 2025-26 — note this is the District-level category framework
  // (Outcomes/ECT/IF&SE/SS&CP/DL/GP, out of 600), not the same taxonomy as
  // the 2024-25 state Domain cards above (D1-D6, out of 1000) — that
  // Domain-level breakdown isn't in the 2025-26 file, only category scores.
  const bandForPct = (pct) => (pct >= 71 ? "Atti-Uttam+" : pct >= 51 ? "Utkarsh" : pct >= 31 ? "Prachesta" : "Akanshi");
  const stateCategory2526 = heatmap2425.categories.map((cat) => {
    const max = CATEGORY_MAX[cat] || 100;
    const avgScore = pgiD202526.heatmapData.reduce((s, r) => s + (r[cat] ?? 0), 0) / pgiD202526.heatmapData.length;
    const percentAchieved = max ? (avgScore / max) * 100 : 0;
    return { domain: cat, score: avgScore, maxWeight: max, percentAchieved, grade: bandForPct(percentAchieved) };
  });


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
        pageIcon="🏛️"
        pageEyebrow="Performance Grading Index — State & District"
        pageTitle="Gujarat PGI 2.0 Dashboard"
        pageSubtitle="6 Domains · 33 Districts · Scored out of 1000 (State) / 600 (District)"
        statChip={{
          label: "Gujarat State Overall Score",
          value: stateSummary.overall?.score?.toFixed(1) ?? "-",
          suffix: `/ ${stateSummary.overall?.maxWeight ?? 1000}`,
          badge: `${stateSummary.overall?.grade || "-"} · ${stateSummary.overall?.percentAchieved?.toFixed(1) ?? 0}%`,
        }}
      />

      <PGIKPICards
        overall={stateSummary.overall}
        totalDistricts={districtRanking2425.length}
        topDistrict={{ District: topDistrict.District, PercentAchieved: topDistrict.pct2526 ?? topDistrict.pct2425 }}
        lowestDistrict={{ District: lowestDistrict.District, PercentAchieved: lowestDistrict.pct2526 ?? lowestDistrict.pct2425 }}
      />

      <PGIDomainCards domains={stateSummary.domains} />

      <PGIDomainCards
        domains={stateCategoryAvg2526}
        title="📚 Category-wise Score — Gujarat State (2025-26 · Average of 33 Districts)"
      />

      <Box mt={2.5}>
        <DistrictFilterBar
          district={district}
          setDistrict={setDistrict}
          districts={districts}
        />
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2, border: "1px solid #E4E7F0" }} elevation={0}>
        <CardContent>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
            📊 District-wise PGI-D % Achieved — 2024-25 vs 2025-26
          </Typography>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={rankingChartData} margin={{ top: 10, right: 20, bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="District" tick={{ fontSize: 10.5 }} interval={0} angle={-45} textAnchor="end" height={90} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => (v == null ? "—" : `${v}%`)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="2024-25" fill="#8B94A8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="2025-26" fill="#F0B429" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2, border: "1px solid #E4E7F0" }} elevation={0}>
        <CardContent>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
            📋 District-wise PGI-D 2.0 Ranking (out of 600) — 2024-25 vs 2025-26
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E4E7F0", maxHeight: 560 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>District</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>2024-25 Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>2024-25 %</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>2025-26 Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>2025-26 %</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>Δ (pp)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#5B2E91", color: "#fff" }}>Grade (25-26)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSortedRanking.map((d) => (
                  <TableRow key={d.District} hover sx={isPriorityDistrict(d.District) ? { bgcolor: "#FFFBEF" } : undefined}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {d.District}
                      <PriorityChip district={d.District} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.score2425.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.pct2425.toFixed(1)}%</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.score2526 != null ? d.score2526.toFixed(2) : "—"}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{d.pct2526 != null ? `${d.pct2526.toFixed(1)}%` : "—"}</TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: d.deltaPct == null ? "inherit" : d.deltaPct >= 0 ? "#2E7D32" : "#D32F2F" }}
                    >
                      {d.deltaPct == null ? "—" : `${d.deltaPct >= 0 ? "+" : ""}${d.deltaPct}%`}
                    </TableCell>
                    <TableCell align="center">
                      {d.grade2526 ? <Chip label={d.grade2526} size="small" sx={{ bgcolor: "#F0B429", color: "#fff", fontWeight: 700 }} /> : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* State Average — always shown at the bottom, even when
                    filtered to one district, so there's always something
                    to compare that district's numbers against. */}
                <TableRow sx={{ bgcolor: "#F5F6FA" }}>
                  <TableCell sx={{ fontWeight: 700 }}>⭐ State Average</TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{stateAvgScore2425.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{stateAvg2425.toFixed(1)}%</TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{stateAvgScore2526 != null ? stateAvgScore2526.toFixed(2) : "—"}</TableCell>
                  <TableCell align="center" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{stateAvg2526 != null ? `${stateAvg2526.toFixed(1)}%` : "—"}</TableCell>
                  <TableCell align="center">—</TableCell>
                  <TableCell align="center">—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <HeatMapTable
        icon="🌡️"
        title="Category-wise Score Heat-map (% of max, by District) — 2024-25 vs 2025-26"
        bands={PGI_BANDS}
        columns={heatmap2425.categories}
        data={filteredHeatmap2425}
        allData={heatmapPct2425}
        data2={filteredHeatmap2526}
        allData2={heatmapPct2526}
        label="24-25"
        label2="25-26"
      />

      {district !== "All" && districtIndicators?.overall && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2.5, border: "1px solid #E4E7F0" }} elevation={0}>
          <CardContent>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 18, mb: 2, color: "#16233B" }}>
              🔎 {district} — Full Indicator Breakdown (70 Indicators) — 2024-25
            </Typography>
            <PGIIndicatorSection
              indicators={districtIndicators.indicators}
              domainSummary={districtIndicators.domainSummary}
              overall={districtIndicators.overall}
            />
          </CardContent>
        </Card>
      )}

      <ActionItemsQueue
        items={actionItems}
        allDistricts={allDistrictNames}
        allItems={allDistrictItems}
        syncDistrict={district}
      />
    </DashboardLayout>
  );
};

export default PGI;