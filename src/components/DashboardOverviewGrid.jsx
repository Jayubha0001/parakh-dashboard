import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";
import GujaratDistrictMap from "./GujaratDistrictMap";
import pgiD202526 from "../data/pgiD202526.json";
import statePgi202526 from "../data/statePgi202526.json";
import { PRIORITY_DISTRICTS, isPriorityDistrict } from "../utils/priorityDistricts";
import { PARAKH_NATIONAL_BENCHMARKS } from "../constants/parakhNationalBenchmarks";
import { useFeatureFlags } from "../config/FeatureFlagsContext";
import { levelsByDistrict } from "../utils/overviewValues";

// ---------------------------------------------------------------------
// Overview grid — the "first screen" of the Dashboard page:
//   map · state donut · priority-vs-other · grade/domain-wise · top-10
//
// Every figure comes from data the Dashboard page has already loaded
// (PGI-D 2024-25 + 2025-26, PARAKH, SAT). Nothing is hard-coded.
// One filter set (Academic Year / Assessment / Grade / District) drives
// all five panels.
// ---------------------------------------------------------------------

const C = {
  ink: "#16233B",
  slate: "#5B6B85",
  line: "#E4E7F0",
  priority: "#F0B429",
  other: "#3B82F6",
  teal: "#0B7A75",
};

const BAND_COLORS = ["#178A4B", "#5DBB63", "#F2CC3B", "#F28C28", "#D93A2B"];

const round1 = (n) => Math.round(n * 10) / 10;
const avg = (arr) => {
  const v = arr.filter((x) => typeof x === "number" && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const fmt = (n, d = 1) => (n == null ? "—" : Number(n).toFixed(d));


// ---------------------------------------------------------------------
// Card shell
// ---------------------------------------------------------------------
const Card = ({ title, subtitle, children, sx }) => (
  <Box
    sx={{
      bgcolor: "#fff",
      border: `1px solid ${C.line}`,
      borderRadius: 3,
      p: { xs: 1.25, md: 1.75 },
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      ...sx,
    }}
  >
    <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.ink, lineHeight: 1.25 }}>{title}</Typography>
    {subtitle && <Typography sx={{ fontSize: 11, color: C.slate, mt: 0.25 }}>{subtitle}</Typography>}
    <Box sx={{ mt: 1.25, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>{children}</Box>
  </Box>
);

// ---------------------------------------------------------------------
// Main grid
// ---------------------------------------------------------------------
const DashboardOverviewGrid = ({
  year,
  assessment,
  grade,
  district,
  setDistrict,
  districts = [],
  parakhData = [],
  pgiRanking2425 = [],
  satComparison = [],
  satGradeWise = { grades: [], data: [] }, // Sem 2 grade-wise
  satGradeWiseSem1 = { grades: [], data: [] },
  pgiState2425 = null,
  pgiHeat2425 = null,
}) => {
  const { flags } = useFeatureFlags();
  const show = (k) => flags[k] !== false;
  const isOverall = assessment === "Overall";
  const isPGI = assessment === "PGI-D";
  const isPARAKH = assessment === "PARAKH";
  const isSAT = assessment === "SAT";
  const isBoth = isPGI && year === "Both Years";
  const pgiYear = year === "2024-25" ? "2024-25" : "2025-26";
  const gradeSelected = grade && grade !== "All Grades";
  const sel = district !== "All" ? district : null;
  const unit = isBoth ? " pp" : "%";
  const priorityNames = new Set(PRIORITY_DISTRICTS);
  const pgi2526 = pgiD202526.ranking;

  const { level, delta, maps } = useMemo(
    () => levelsByDistrict({ assessment, year, grade, pgiRanking2425, parakhData, satComparison, satGradeWise, satGradeWiseSem1 }),
    [assessment, year, grade, pgiRanking2425, parakhData, satComparison, satGradeWise, satGradeWiseSem1]
  );
  const valueByDistrict = isBoth ? delta : level;
  const entries = Object.entries(valueByDistrict);
  const values = entries.map(([, v]) => v);

  const stateAvg = avg(Object.values(level));
  const priorityAvg = avg(entries.filter(([n]) => isPriorityDistrict(n)).map(([, v]) => v));
  const otherAvg = avg(entries.filter(([n]) => !isPriorityDistrict(n)).map(([, v]) => v));

  const ranked = [...entries].sort((a, b) => b[1] - a[1]);
  const rankOf = (name) => {
    const i = ranked.findIndex(([n]) => n === name);
    return i < 0 ? null : i + 1;
  };

  const bands = useMemo(() => {
    if (values.length < 5) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
    const cuts = [q(0.8), q(0.6), q(0.4), q(0.2)];
    const u = isBoth ? " pp" : "%";
    const label = (i) => (i === 0 ? `≥ ${cuts[0]}${u}` : i === 4 ? `< ${cuts[3]}${u}` : `${cuts[i]}${u} – ${cuts[i - 1]}${u}`);
    return BAND_COLORS.map((color, i) => ({ color, min: i < 4 ? cuts[i] : -Infinity, label: label(i) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueByDistrict, isBoth]);

  // ---- headline (donut): state, or the selected district ----
  const stateScore = isPGI && !isBoth ? (pgiYear === "2024-25" ? pgiState2425?.score : statePgi202526.overall?.score) : isBoth ? statePgi202526.overall?.score : null;
  const statePct = isPGI
    ? pgiYear === "2024-25" && !isBoth ? pgiState2425?.percentAchieved : statePgi202526.overall?.percentAchieved
    : stateAvg;
  const selLevel = sel ? level[sel] ?? null : null;
  const donutPct = sel ? selLevel : statePct;
  const scoreOutOf1000 = sel ? null : stateScore;
  const yoyPP =
    isPGI && pgiState2425?.percentAchieved != null && statePgi202526.overall?.percentAchieved != null
      ? round1(statePgi202526.overall.percentAchieved - pgiState2425.percentAchieved)
      : null;
  const selYoY = sel && maps.pgi26[sel] != null && maps.pgi25[sel] != null ? round1(maps.pgi26[sel] - maps.pgi25[sel]) : null;

  const groupAvg = (m, isPr) => avg(Object.entries(m).filter(([n]) => isPriorityDistrict(n) === isPr).map(([, v]) => v));
  // National reference exists only for PARAKH (PARAKH Rashtriya Sarvekshan 2024, subject-level).
  const natOf = (g) => avg(Object.values(PARAKH_NATIONAL_BENCHMARKS).filter((b) => !g || b === PARAKH_NATIONAL_BENCHMARKS[g]).flatMap((b) => b.subject.map((x) => x.national)));
  const row = (name, m, nat = null) => ({ name, Priority: groupAvg(m, true), Other: groupAvg(m, false), District: sel ? m[sel] ?? null : null, State: avg(Object.values(m)), National: nat });

  // ---- Priority vs Other (or District vs State when a district is picked) ----
  const priorityVsOther = useMemo(() => {
    const T = "Priority vs Other Districts";
    if (isOverall) return { title: T, subtitle: "Score % by program (latest)", rows: [row("PGI-D", maps.pgi26), row("PARAKH", maps.parakh), row("SAT", maps.sat)] };
    if (isPGI) return { title: T, subtitle: "PGI-D % achieved by academic year", rows: [row("2024-25", maps.pgi25), row("2025-26", maps.pgi26)] };
    if (isPARAKH) {
      const stage = (col) => Object.fromEntries(parakhData.filter((r) => typeof r[col] === "number").map((r) => [r.District, r[col] * 100]));
      return { title: T, subtitle: "PARAKH % by grade band", rows: [["Grade 3", "Foundational", "G3"], ["Grade 6", "Preparatory", "G6"], ["Grade 9", "Middle", "G9"]].map(([l, c, g]) => row(l, stage(c), natOf(g))) };
    }
    return { title: T, subtitle: "SAT % by semester", rows: [row("Sem 1", maps.s1), row("Sem 2", maps.s2), row("Overall", maps.sat)] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverall, isPGI, isPARAKH, maps, parakhData, sel]);

  // ---- Grade-wise (SAT / PARAKH), Domain-wise (PGI-D), Program-wise (Overall) ----
  const breakdown = useMemo(() => {
    const mk = (name, rowsAll) => ({ name, ...rowsAll });
    if (isOverall) return { title: "Program-wise Performance", rows: [row("PGI-D", maps.pgi26), row("PARAKH", maps.parakh), row("SAT", maps.sat)] };
    if (isPGI) {
      const heat = pgiD202526.heatmapData;
      const selRow = sel ? heat.find((r) => r.District === sel) : null;
      const pctFor = (cat, rows) => {
        const max = Number((cat.match(/\/(\d+)/) || [])[1]);
        return max ? avg(rows.map((r) => (typeof r[cat] === "number" ? (r[cat] / max) * 100 : null))) : null;
      };
      return {
        title: "Domain-wise Performance (PGI-D 2025-26)",
        rows: pgiD202526.categories.map((cat) => ({
          name: cat.replace(/\s*\(.*\)/, "").replace("Classroom Transaction", "Classroom").replace("Safety & Protection", "Safety").replace("Digital Learning", "Digital"),
          Priority: pctFor(cat, heat.filter((r) => priorityNames.has(r.District))),
          State: pctFor(cat, heat),
          District: selRow ? pctFor(cat, [selRow]) : null,
          Priority24: pctFor(cat, (pgiHeat2425?.data || []).filter((r) => priorityNames.has(r.District))),
          State24: pctFor(cat, pgiHeat2425?.data || []),
          District24: sel ? pctFor(cat, (pgiHeat2425?.data || []).filter((r) => r.District === sel)) : null,
        })),
      };
    }
    if (isPARAKH) {
      const c = (col) => {
        const m = Object.fromEntries(parakhData.filter((r) => typeof r[col] === "number").map((r) => [r.District, r[col] * 100]));
        return m;
      };
      return { title: "Grade-wise Performance (PARAKH)", rows: [["Grade 3", "Foundational", "G3"], ["Grade 6", "Preparatory", "G6"], ["Grade 9", "Middle", "G9"]].map(([l, col, g]) => row(l, c(col), natOf(g))) };
    }
    const g = (grd) => {
      const m1 = Object.fromEntries(satGradeWiseSem1.data.filter((r) => typeof r[grd] === "number").map((r) => [r.District, r[grd]]));
      const m2 = Object.fromEntries(satGradeWise.data.filter((r) => typeof r[grd] === "number").map((r) => [r.District, r[grd]]));
      const m = year === "Sem 1" ? m1 : year === "Sem 2" ? m2 : Object.fromEntries(Object.keys(m2).map((d) => [d, avg([m1[d], m2[d]])]));
      return row(grd, m);
    };
    return { title: `Grade-wise Performance (SAT ${year})`, rows: satGradeWise.grades.map(g) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverall, isPGI, isPARAKH, maps, parakhData, satGradeWise, satGradeWiseSem1, year, sel]);

  // ---- The 10 priority districts (plus the picked district when it isn't one of them) ----
  const priorityRows = [...PRIORITY_DISTRICTS, ...(sel && !priorityNames.has(sel) ? [sel] : [])]
    .map((name) => ({ name, value: isPGI ? maps.pgi26[name] ?? null : valueByDistrict[name] ?? null, prev: isPGI ? maps.pgi25[name] ?? null : null }))
    .filter((r) => r.value != null)
    .sort((a, b) => b.value - a.value)
    .map((r) => ({ ...r, value: round1(r.value), prev: r.prev == null ? null : round1(r.prev) }));

  const rowsTrim = (rows) => rows.map((r) => ({ ...r, Priority24: r.Priority24 == null ? null : round1(r.Priority24), State24: r.State24 == null ? null : round1(r.State24), District24: r.District24 == null ? null : round1(r.District24), Priority: r.Priority == null ? null : round1(r.Priority), Other: r.Other == null ? null : round1(r.Other), State: r.State == null ? null : round1(r.State), National: r.National == null ? null : round1(r.National), District: r.District == null ? null : round1(r.District) }));
  // Order everywhere: District -> State -> National (National only where a benchmark exists).
  const NAT = ["National", "#2E9E6B", "National (PARAKH 2024)"];
  const seriesKeys = [
    ...(sel ? [["District", C.priority, sel], ["State", C.other, "State Avg"]] : [["Priority", C.priority, "Priority Districts"], ["Other", C.other, "Other Districts"], ["State", "#7A5AF8", "State Avg"]]),
    ...(priorityVsOther.rows.some((r) => r.National != null) ? [NAT] : []),
  ];
  // [key, colour, legend name, dashed?]
  const lineKeys = isPGI
    ? sel
      ? [["District24", "#F6D58A", `${sel} 2024-25`, true], ["District", C.priority, `${sel} 2025-26`], ["State24", "#9EC3F5", "State 2024-25", true], ["State", C.other, "State 2025-26"]]
      : [["Priority24", "#F6D58A", "Priority 2024-25", true], ["Priority", C.priority, "Priority 2025-26"], ["State24", "#9EC3F5", "State 2024-25", true], ["State", C.other, "State 2025-26"]]
    : [
        ...(sel ? [["District", C.priority, sel], ["State", C.other, "State Avg"]] : [["Priority", C.priority, "Priority Districts"], ["State", C.other, "State Avg"]]),
        ...(breakdown.rows.some((r) => r.National != null) ? [NAT] : []),
      ];

  const selectedValue = sel ? valueByDistrict[sel] ?? null : null;
  const selectedPrev = sel && isPGI ? maps.pgi25[sel] ?? null : null;
  const selectedScore = sel && isPGI ? (pgiYear === "2024-25" ? undefined : pgi2526.find((r) => r.District === sel)?.Score ?? null) : null;

  const periodText = isPGI ? year : isSAT ? year : isOverall ? "latest" : "latest";
  const metricLabel = isBoth ? "PGI-D change" : isOverall ? "Overall %" : `${assessment} %`;
  const gradeLabel = gradeSelected ? ` · ${grade}` : "";
  const yearLabel = periodText;
  const selected = sel;

  const chartFont = { fontSize: 10.5, fill: C.slate };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        alignItems: "stretch",
        gridTemplateColumns: { xs: "1fr", md: "repeat(6, 1fr)", xl: "repeat(12, 1fr)" },
        mb: 2.5,
      }}
    >
      {/* MAP */}
      {show("dash_map") && (
      <Card
        title={`Gujarat – ${assessment} ${yearLabel}${gradeLabel} by District`}
        subtitle="Click a district to filter the whole page"
        sx={{ gridColumn: { md: "span 6", xl: "span 5" } }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: { sm: "center" } }}>
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 340, mx: "auto" }}>
            <GujaratDistrictMap
              bare
              compact
                            district={district}
              setDistrict={setDistrict}
              districts={districts}
              dataByDistrict={valueByDistrict}
              metricLabel={metricLabel}
              valueSuffix={unit}
              priorityDistricts={PRIORITY_DISTRICTS}
              bands={bands}
            />
          </Box>

          {selected && (
            <Box
              sx={{
                minWidth: 168,
                border: `1px solid ${C.line}`,
                borderRadius: 2.5,
                p: 1.5,
                boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
                alignSelf: "flex-start",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.ink, mb: 0.75 }}>{selected}</Typography>
              {[
                [metricLabel, selectedValue != null ? `${fmt(selectedValue)}${unit}` : "—"],
                ...(selectedScore != null && selectedScore !== undefined ? [["Score", `${selectedScore}/600`]] : []),
                ["State rank", rankOf(selected) ? `${rankOf(selected)} of ${ranked.length}` : "—"],
                ...(selYoY != null && !isBoth ? [["vs 2024-25", `${selYoY >= 0 ? "+" : ""}${fmt(selYoY)} pp`]] : []),
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", gap: 2, fontSize: 12.5, py: 0.15 }}>
                  <Box sx={{ color: C.slate }}>{k}</Box>
                  <Box sx={{ fontWeight: 700, color: C.ink }}>{v}</Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>
      )}

      {/* DONUT */}
      {show("dash_donut") && (
      <Card
        title={sel ? `${sel} Performance` : "Overall Performance (State Level)"}
        subtitle={`${assessment}${gradeLabel} · ${yearLabel}`}
        sx={{ gridColumn: { md: "span 3", xl: "span 3" } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center" }}>
          <Box sx={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
            <PieChart width={150} height={150}>
              <Pie
                data={[
                  { name: "Achieved", value: donutPct ?? 0 },
                  { name: "Gap", value: Math.max(0, 100 - (donutPct ?? 0)) },
                ]}
                dataKey="value"
                innerRadius={48}
                outerRadius={69}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                <Cell fill={C.teal} />
                <Cell fill="#E6ECF2" />
              </Pie>
            </PieChart>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 21, color: C.ink, lineHeight: 1 }}>
                {scoreOutOf1000 != null ? fmt(scoreOutOf1000) : `${fmt(donutPct)}%`}
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.slate }}>{scoreOutOf1000 != null ? "/ 1000" : sel ? "District" : "State avg"}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, width: "100%" }}>
            {(sel
              ? [
                  [`${sel}`, selLevel, C.teal],
                  ["State average", statePct, C.other],
                  ["Difference vs state", selLevel != null && statePct != null ? selLevel - statePct : null, C.ink, " pp"],
                  ["State rank", rankOf(sel) ? `${rankOf(sel)} of ${ranked.length}` : null, "#B7791F", ""],
                  ...(selYoY != null ? [["Change vs 2024-25", selYoY, selYoY >= 0 ? "#178A4B" : "#D93A2B", " pp"]] : []),
                ]
              : [
                  ["Priority district avg", priorityAvg, "#B7791F", isBoth ? " pp" : "%"],
                  ["Other district avg", otherAvg, C.other, isBoth ? " pp" : "%"],
                  ["Gap (Other − Priority)", priorityAvg != null && otherAvg != null ? otherAvg - priorityAvg : null, C.ink, " pp"],
                  ...(yoyPP != null ? [["Change vs 2024-25", yoyPP, yoyPP >= 0 ? "#178A4B" : "#D93A2B", " pp"]] : []),
                ]
            ).map(([label, val, color, unit = "%"]) => (
              <Box key={label}>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color, lineHeight: 1.1 }}>
                  {label.startsWith("Change") && typeof val === "number" && val >= 0 ? "+" : ""}
                  {typeof val === "string" ? val : fmt(val)}
                  {typeof val === "string" ? "" : unit}
                </Typography>
                <Typography sx={{ fontSize: 12, color: C.slate }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
      )}

      {/* PRIORITY vs OTHER */}
      {show("dash_priorityVsOther") && (
      <Card
        title={priorityVsOther.title}
        subtitle={priorityVsOther.subtitle}
        sx={{ gridColumn: { md: "span 3", xl: "span 4" } }}
      >
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart key={`${sel || "all"}-${assessment}`} data={rowsTrim(priorityVsOther.rows)} margin={{ top: 22, right: 8, left: -18, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF3" />
              <XAxis dataKey="name" tick={chartFont} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={chartFont} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              {seriesKeys.map(([k, col, nm]) => (
                <Bar key={k} dataKey={k} name={nm} fill={col} radius={[5, 5, 0, 0]} maxBarSize={36}>
                  <LabelList dataKey={k} position="top" style={{ fontSize: 10, fontWeight: 700, fill: C.ink }} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
      )}

      {/* GRADE / DOMAIN WISE */}
      {show("dash_breakdown") && (
      <Card
        title={breakdown.title}
        subtitle={sel ? `${sel} vs state average (%)` : "Priority districts vs state average (%)"}
        sx={{ gridColumn: { md: "span 6", xl: "span 5" } }}
      >
        <Box sx={{ height: isPGI ? 215 : 190 }}>
          <ResponsiveContainer width="100%" height="100%">
            {isPGI ? (
              // 4 near-identical lines overlapped, so PGI-D uses side-by-side bars per domain instead.
              <BarChart key={`${sel || "all"}-pgi`} data={rowsTrim(breakdown.rows)} margin={{ top: 16, right: 6, left: -16, bottom: 0 }} barGap={1} barCategoryGap="14%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF3" vertical={false} />
                <XAxis dataKey="name" tick={{ ...chartFont, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis domain={[0, 100]} tick={chartFont} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10.5 }} />
                {lineKeys.map(([k, col, nm, dashed]) => (
                  <Bar key={k} dataKey={k} name={nm} fill={col} radius={[3, 3, 0, 0]} maxBarSize={13}>
                    {!dashed && <LabelList dataKey={k} position="top" formatter={(v) => (v == null ? "" : Math.round(v))} style={{ fontSize: 9, fontWeight: 700, fill: C.ink }} />}
                  </Bar>
                ))}
              </BarChart>
            ) : (
            <LineChart key={`${sel || "all"}-${isPGI}-${assessment}`} data={rowsTrim(breakdown.rows)} margin={{ top: 24, right: 24, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF3" />
              <XAxis dataKey="name" tick={chartFont} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={[0, 100]} tick={chartFont} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              {lineKeys.map(([k, col, nm, dashed], i) => (
                <Line key={k} type="monotone" dataKey={k} name={nm} stroke={col} strokeWidth={dashed ? 2 : 2.5} strokeDasharray={dashed ? "5 4" : undefined} dot={{ r: dashed ? 3 : 4 }} connectNulls>
                  {!dashed && <LabelList dataKey={k} position={i === 1 ? "top" : "bottom"} style={{ fontSize: 10, fontWeight: 700, fill: C.ink }} />}
                </Line>
              ))}
            </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Card>
      )}

      {/* TOP 10 PRIORITY */}
      {show("dash_priorityList") && (
      <Card
        title={`Priority Districts – ${assessment}${gradeLabel}`}
        subtitle={sel && !priorityNames.has(sel) ? `The 10 focus districts + ${sel}, best to lowest` : "The 10 focus districts, best to lowest"}
        sx={{ gridColumn: { md: "span 6", xl: "span 7" } }}
      >
        <Box sx={{ height: 190 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart key={`${isPGI}-${assessment}`} data={priorityRows} margin={{ top: 22, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF3" />
              <XAxis dataKey="name" tick={{ ...chartFont, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={isBoth && !isPGI ? ["auto", "auto"] : [0, 100]} tick={chartFont} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}${isPGI ? "%" : unit}`} />
              {isPGI && (
                <Bar dataKey="prev" name="2024-25" fill="#C9D3E6" radius={[5, 5, 0, 0]} maxBarSize={22}>
                  <LabelList dataKey="prev" position="top" formatter={(v) => `${v}`} style={{ fontSize: 9, fontWeight: 600, fill: "#5B6B85" }} />
                </Bar>
              )}
              <Bar dataKey="value" name={isPGI ? "2025-26" : metricLabel} radius={[5, 5, 0, 0]} maxBarSize={isPGI ? 22 : 44}>
                {priorityRows.map((r, i) => (
                  <Cell key={r.name} fill={r.name === sel ? C.ink : BAND_COLORS[Math.min(4, Math.floor((i / Math.max(1, priorityRows.length)) * 5))]} />
                ))}
                <LabelList dataKey="value" position="top" formatter={(v) => `${v}${isBoth && !isPGI ? "" : "%"}`} style={{ fontSize: 10, fontWeight: 700, fill: C.ink }} />
              </Bar>
              {isPGI && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
      )}
    </Box>
  );
};

export default DashboardOverviewGrid;
