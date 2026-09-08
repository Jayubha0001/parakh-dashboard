import { useState } from "react";
import { Box, Typography, Grid, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { colors, fontDisplay, fontMono } from "../theme/theme";
import { isPriorityDistrict, PRIORITY_DISTRICTS } from "../utils/priorityDistricts";
import GujaratBubbleMap from "./GujaratBubbleMap";
import goiData from "../data/pmshriGOI.json";

// A dense, single-glance "executive snapshot" for the Dashboard home page.
// The one thing worth showing at a glance here is how the state's 10
// focus districts compare to the other 23 — so every widget below is
// built around that Priority (gold) vs Other (slate) split, not an
// arbitrary performance tier. When the page's "Priority Districts Only"
// toggle is on, the "Other" series drops out everywhere so the panel
// genuinely narrows instead of just being decorative.

const GOLD = colors.gold;
const OTHER = "#8B94A8";

const avgOf = (arr, key) => {
  const vals = arr.map((r) => r[key]).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};

const ExecutiveOverviewPanel = ({
  parakhData = [],
  pgiRanking = [],
  satData = [],
  priorityOnly = false,
  districts = [],
  district = "All",
  setDistrict = () => {},
}) => {
  const priorityParakh = parakhData.filter((d) => isPriorityDistrict(d.District));
  const otherParakh = parakhData.filter((d) => !isPriorityDistrict(d.District));

  const satCombined = satData.map((d) => ({ District: d.District, Combined: d.Sem2Pct ?? d.Sem1Pct }));
  const prioritySat = satCombined.filter((d) => isPriorityDistrict(d.District));
  const otherSat = satCombined.filter((d) => !isPriorityDistrict(d.District));

  const priorityPgi = pgiRanking.filter((d) => isPriorityDistrict(d.District));
  const otherPgi = pgiRanking.filter((d) => !isPriorityDistrict(d.District));

  const donutData = priorityOnly
    ? [{ name: "Priority", value: priorityParakh.length || 10 }]
    : [
        { name: "Priority", value: priorityParakh.length || 10 },
        { name: "Other", value: otherParakh.length || 23 },
      ];

  const compareData = [
    { metric: "PARAKH", Priority: avgOf(priorityParakh, "Score"), Other: avgOf(otherParakh, "Score") },
    { metric: "SAT", Priority: avgOf(prioritySat, "Combined"), Other: avgOf(otherSat, "Combined") },
    { metric: "PGI-D", Priority: avgOf(priorityPgi, "PercentAchieved"), Other: avgOf(otherPgi, "PercentAchieved") },
  ].map((r) => ({
    ...r,
    Priority: r.Priority != null ? Number(r.Priority.toFixed(1)) : null,
    Other: r.Other != null ? Number(r.Other.toFixed(1)) : null,
  }));

  const allGrades = [...new Set(pgiRanking.map((d) => d.Grade).filter(Boolean))];
  const gradeGroups = allGrades
    .map((grade) => ({
      grade,
      Priority: priorityPgi.filter((d) => d.Grade === grade).length,
      Other: otherPgi.filter((d) => d.Grade === grade).length,
    }))
    .filter((g) => g.Priority > 0 || g.Other > 0)
    .sort((a, b) => b.Priority + b.Other - (a.Priority + a.Other));

  const priorityList = [...priorityPgi].sort((a, b) => b.PercentAchieved - a.PercentAchieved);

  // When a single district is picked (map click or the dropdown above),
  // every widget in this panel switches from "Priority vs Other" to that
  // district's own numbers vs the state average — the whole panel follows
  // the one filter instead of only the map reacting to it.
  const isSingleDistrict = district !== "All";
  const selectedPgi = pgiRanking.find((d) => d.District === district);
  const selectedParakh = parakhData.find((d) => d.District === district);
  const selectedSat = satCombined.find((d) => d.District === district);
  const selectedGsqac = goiData.districtGSQAC.find((d) => d.District === district)?.["Avg GSQAC% 2024-25"];
  const pgiRankSorted = [...pgiRanking].sort((a, b) => b.PercentAchieved - a.PercentAchieved);
  const selectedRank = pgiRankSorted.findIndex((d) => d.District === district) + 1;

  // Metric switcher for the bubble map — PARAKH / PGI-D / SAT scores are
  // all already on this page; GSQAC (PM Shri) is a static import since
  // Dashboard doesn't otherwise load it. Each option is a plain
  // { District: value } lookup, same shape the map already expects.
  const [mapMetric, setMapMetric] = useState("pgi");

  const gsqacByDistrict = Object.fromEntries(
    goiData.districtGSQAC.map((d) => [d.District, Math.round(d["Avg GSQAC% 2024-25"])])
  );
  const parakhByDistrict = Object.fromEntries(parakhData.map((d) => [d.District, Math.round(d.Score)]));
  const pgiByDistrict = Object.fromEntries(pgiRanking.map((d) => [d.District, Math.round(d.PercentAchieved)]));
  const satByDistrict = Object.fromEntries(
    satData.map((d) => [d.District, Math.round(d.Sem2Pct ?? d.Sem1Pct ?? 0)])
  );

  const MAP_METRICS = {
    parakh: { label: "PARAKH", data: parakhByDistrict },
    pgi: { label: "PGI-D 2025-26", data: pgiByDistrict },
    sat: { label: "SAT", data: satByDistrict },
    gsqac: { label: "GSQAC (PM Shri)", data: gsqacByDistrict },
  };

  // District-focus versions of the comparison bar + grade split panels.
  const stateAvgParakh = avgOf(parakhData, "Score");
  const stateAvgSat = avgOf(satCombined, "Combined");
  const stateAvgPgi = avgOf(pgiRanking, "PercentAchieved");

  const districtCompareData = [
    { metric: "PARAKH", District: selectedParakh?.Score, "State Avg": stateAvgParakh },
    { metric: "SAT", District: selectedSat?.Combined, "State Avg": stateAvgSat },
    { metric: "PGI-D", District: selectedPgi?.PercentAchieved, "State Avg": stateAvgPgi },
  ].map((r) => ({
    ...r,
    District: r.District != null ? Number(r.District.toFixed(1)) : null,
    "State Avg": r["State Avg"] != null ? Number(r["State Avg"].toFixed(1)) : null,
  }));

  return (
    <Box
      sx={{
        borderRadius: 4,
        background: `linear-gradient(160deg, ${colors.navy}, ${colors.navyLight})`,
        borderTop: `3px solid ${GOLD}`,
        p: { xs: 2, sm: 2.5 },
        mt: { xs: 1.5, md: 2 },
        boxShadow: "0 8px 24px rgba(15,23,42,0.25)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 0.3 }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          Government of Gujarat · School Education Department
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 18, color: "#fff" }}>
          📊 Gujarat Education — Executive Snapshot
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>
          {isSingleDistrict
            ? `📍 Showing: ${district}`
            : priorityOnly
            ? "⭐ Showing the 10 priority districts only"
            : "⭐ Priority (10) vs Other (23) districts, throughout"}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Gujarat bubble map — the easiest thing on the page to explain
            out loud: colour = performance, gold ring = one of our 10,
            click a bubble to drill into that district (same filter as
            the dropdown above). Sits as one column here instead of a
            full-width section, so it doesn't dominate the page. */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ToggleButtonGroup
            value={mapMetric}
            exclusive
            onChange={(_, v) => v && setMapMetric(v)}
            size="small"
            sx={{
              mb: 0.8,
              "& .MuiToggleButton-root": {
                color: "rgba(255,255,255,0.65)",
                borderColor: "rgba(255,255,255,0.18)",
                fontSize: 10.5,
                py: 0.2,
                px: 0.9,
                textTransform: "none",
              },
              "& .Mui-selected": {
                color: "#16233B !important",
                bgcolor: `${GOLD} !important`,
              },
            }}
          >
            {Object.entries(MAP_METRICS).map(([key, m]) => (
              <ToggleButton key={key} value={key}>
                {m.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <GujaratBubbleMap
            district={district}
            setDistrict={setDistrict}
            districts={priorityOnly ? districts.filter((d) => isPriorityDistrict(d)) : districts}
            dataByDistrict={MAP_METRICS[mapMetric].data}
            metricLabel={MAP_METRICS[mapMetric].label}
            valueSuffix="%"
            priorityDistricts={priorityOnly ? [] : PRIORITY_DISTRICTS}
          />
        </Grid>

        {/* Priority vs Other split — or, with one district picked, that
            district's own PGI-D % as a simple gauge ring. */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", mb: 0.5 }}>
            {isSingleDistrict ? "PGI-D 2025-26 Score" : "Districts Covered"}
          </Typography>
          {isSingleDistrict ? (
            <Box sx={{ height: 190, position: "relative" }}>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Score", value: selectedPgi?.PercentAchieved ?? 0 },
                      { name: "Remaining", value: 100 - (selectedPgi?.PercentAchieved ?? 0) },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="85%"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill={GOLD} stroke="none" />
                    <Cell fill="rgba(255,255,255,0.12)" stroke="none" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: "absolute", top: "54%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 20, color: "#fff" }}>
                  {selectedPgi?.PercentAchieved?.toFixed(0) ?? "-"}%
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center", mt: 0.5 }}>
                <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>
                  Grade: {selectedPgi?.Grade || "—"}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ height: 190, position: "relative" }}>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2}>
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={d.name === "Priority" ? GOLD : OTHER} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: "absolute", top: "54%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 20, color: "#fff" }}>33</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1.2, mt: 0.5, flexWrap: "wrap" }}>
                {donutData.map((d) => (
                  <Box key={d.name} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.name === "Priority" ? GOLD : OTHER }} />
                    <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>
                      {d.name} ({d.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        {/* Avg score comparison — Priority vs Other, or this district vs
            the state average once one is picked. */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", mb: 1 }}>
            {isSingleDistrict ? `${district} vs State Average` : "Avg Score — Priority vs Other"}
          </Typography>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={isSingleDistrict ? districtCompareData : compareData} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.8)" }} />
              <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.7)" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => `${v}%`} />
              {isSingleDistrict ? (
                <>
                  <Bar dataKey="District" fill={GOLD} radius={[3, 3, 0, 0]} barSize={16} />
                  <Bar dataKey="State Avg" fill={OTHER} radius={[3, 3, 0, 0]} barSize={16} />
                </>
              ) : (
                <>
                  <Bar dataKey="Priority" fill={GOLD} radius={[3, 3, 0, 0]} barSize={16} />
                  {!priorityOnly && <Bar dataKey="Other" fill={OTHER} radius={[3, 3, 0, 0]} barSize={16} />}
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* PGI-D grade distribution — or, with one district picked, that
            district's profile card (rank, grade, GSQAC, priority status). */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", mb: 1 }}>
            {isSingleDistrict ? `${district} — Profile` : "PGI-D 2025-26 — Grade Split"}
          </Typography>
          {isSingleDistrict ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
              {[
                { label: "PGI-D Rank (of 33)", value: selectedRank > 0 ? `#${selectedRank}` : "—" },
                { label: "PGI-D Grade", value: selectedPgi?.Grade || "—" },
                { label: "GSQAC (PM Shri)", value: selectedGsqac != null ? `${selectedGsqac.toFixed(1)}%` : "—" },
                { label: "Priority District", value: isPriorityDistrict(district) ? "Yes ⭐" : "No" },
              ].map((r) => (
                <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1.5, px: 1, py: 0.7 }}>
                  <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)" }}>{r.label}</Typography>
                  <Typography sx={{ fontFamily: fontMono, fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.value}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={175}>
              <BarChart data={gradeGroups} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.7)" }} allowDecimals={false} />
                <YAxis type="category" dataKey="grade" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.85)" }} width={72} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="Priority" stackId="g" fill={GOLD} radius={[0, 0, 0, 0]} barSize={14} />
                {!priorityOnly && <Bar dataKey="Other" stackId="g" fill={OTHER} radius={[0, 4, 4, 0]} barSize={14} />}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>

        {/* The 10 districts, by name — the selected one (if it's among
            them) gets a brighter highlight so it's easy to spot. */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", mb: 1 }}>
            ⭐ The 10 Priority Districts (PGI-D 25-26)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {priorityList.map((d) => {
              const isSelectedChip = isSingleDistrict && d.District === district;
              return (
                <Box
                  key={d.District}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    bgcolor: isSelectedChip ? "rgba(240,180,41,0.28)" : "rgba(240,180,41,0.12)",
                    border: isSelectedChip ? `1.5px solid ${GOLD}` : "1.5px solid transparent",
                    borderLeft: `3px solid ${GOLD}`,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    minWidth: 140,
                  }}
                >
                  <Typography sx={{ fontSize: 11.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {d.District}
                  </Typography>
                  <Typography sx={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: GOLD }}>
                    {d.PercentAchieved.toFixed(1)}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveOverviewPanel;
