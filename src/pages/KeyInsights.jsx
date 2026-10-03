import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import StarIcon from "@mui/icons-material/Star";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import { loadExcel, getDistrictPGIRanking, getSheetData, getSubjectHeatmap, getSATWeakestLOs, getSATDistrictRanking, getSATSem1DistrictRanking } from "../services/dataService";
import { isPriorityDistrict, PRIORITY_DISTRICTS } from "../utils/priorityDistricts";
import pgiD202526 from "../data/pgiD202526.json";
import statePgi202526 from "../data/statePgi202526.json";
import { buildInsights } from "../utils/insightEngine";
import goiData from "../data/pmshriGOI.json";
import gogData from "../data/pmshriGOG.json";
import pgiIndicators from "../data/districtPgiIndicators202526.json";

const avg = (rows, field) => {
  const vals = rows.map((r) => r[field]).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};

// Every card here is a plain, checkable computation over the same data
// the rest of the dashboard uses — sorting, filtering, averaging. There
// is no AI model or external call behind this page; it's labelled "Key
// Insights", not "AI-powered", on purpose, so it doesn't claim more than
// it does.
const KeyInsights = () => {
  const [loading, setLoading] = useState(true);
  const [pgiRanking2425, setPgiRanking2425] = useState([]);
  const [parakhOverview, setParakhOverview] = useState([]);
  const [weakParakh, setWeakParakh] = useState([]);
  const [weakSat, setWeakSat] = useState([]);
  const [satRank1, setSatRank1] = useState([]);
  const [satRank2, setSatRank2] = useState([]);

  useEffect(() => {
    (async () => {
      const workbook = await loadExcel();
      setPgiRanking2425(getDistrictPGIRanking(workbook));
      setParakhOverview(getSheetData(workbook, "Dashboard_PARAKH"));
      const hm = getSubjectHeatmap(workbook);
      setWeakParakh(
        hm.columns.filter((c) => !c.endsWith("Average")).map((c) => {
          const v = hm.data.map((r) => r[c]).filter((x) => typeof x === "number");
          const m = v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
          return { label: c, pct: m == null ? null : m <= 1.5 ? m * 100 : m };
        }).filter((x) => x.pct != null).sort((a, b) => a.pct - b.pct).slice(0, 5)
      );
      setWeakSat(getSATWeakestLOs(workbook, 5).map((x) => ({ label: `${x.grade ? x.grade + " · " : ""}${x.subject} · ${x.loCode}`, note: x.indicator, pct: x.PercentAchieved })));
      setSatRank1(getSATSem1DistrictRanking(workbook));
      setSatRank2(getSATDistrictRanking(workbook));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const pgiRanking2526 = pgiD202526.ranking;
  const prevByDistrict = Object.fromEntries(pgiRanking2425.map((d) => [d.District, d.PercentAchieved]));
  const deltas = pgiRanking2526
    .map((d) => ({ District: d.District, delta: prevByDistrict[d.District] != null ? d.PercentAchieved - prevByDistrict[d.District] : null }))
    .filter((d) => d.delta != null)
    .sort((a, b) => b.delta - a.delta);

  const mostImproved = deltas[0];
  const mostDeclined = deltas[deltas.length - 1];

  const priorityPgi = pgiRanking2526.filter((d) => isPriorityDistrict(d.District));
  const otherPgi = pgiRanking2526.filter((d) => !isPriorityDistrict(d.District));
  const priorityAvg = avg(priorityPgi, "PercentAchieved");
  const otherAvg = avg(otherPgi, "PercentAchieved");

  const parakhByOverall = [...parakhOverview].sort((a, b) => (b.Overall ?? 0) - (a.Overall ?? 0));
  const topParakh = parakhByOverall[0];
  const lowestParakh = parakhByOverall[parakhByOverall.length - 1];

  const gsqacDistricts = goiData.districtGSQAC || [];
  const gsqacPriority = gsqacDistricts.filter((d) => isPriorityDistrict(d.District));
  const gsqacPriorityAvg = avg(gsqacPriority, "Avg GSQAC% 2024-25");

  // "Weakest indicator" here means the weakest of the 6 PGI-D domains
  // state-wide (2025-26) — the finest-grained indicator-level PGI data
  // isn't loaded on this page (it's per-district, not a state summary),
  // so the domain is the most specific real number available here
  // without pulling in a much bigger dataset just for one card.
  const weakestDomain = [...(statePgi202526.domains || [])].sort(
    (a, b) => a.percentAchieved - b.percentAchieved
  )[0];

  // State-wide weakest PGI-D indicators: score / weight summed over all districts.
  const agg = {};
  Object.values(pgiIndicators).forEach((d) => (d.indicators || []).forEach((i) => {
    const a = (agg[i.indNo] ||= { label: i.indNo, note: i.indicator, score: 0, weight: 0 });
    a.score += Number(i.score) || 0; a.weight += Number(i.weight) || 0;
  }));
  const weakPgi = Object.values(agg).filter((a) => a.weight > 0)
    .map((a) => ({ ...a, pct: (a.score / a.weight) * 100 })).sort((a, b) => a.pct - b.pct).slice(0, 5);
  const weakGsqac = [...(gogData.districtGSQACResult || [])]
    .filter((d) => typeof d["Avg % (2024-25)"] === "number")
    .sort((a, b) => a["Avg % (2024-25)"] - b["Avg % (2024-25)"]).slice(0, 5)
    .map((d) => ({ label: d.District, note: `${d["Total Schools"]} schools`, pct: d["Avg % (2024-25)"] }));
  const weakPanels = [
    { title: "PGI-D — weakest indicators", sub: "State-wide, 2025-26 (score ÷ weight)", color: "#D32F2F", rows: weakPgi },
    { title: "PARAKH — weakest subjects", sub: "Lowest state-average grade·subject", color: "#1976D2", rows: weakParakh },
    { title: "SAT — weakest learning outcomes", sub: "Lowest % marks achieved", color: "#F0B429", rows: weakSat },
    { title: "PM SHRI (GSQAC) — weakest districts", sub: "Lowest avg GSQAC % 2024-25", color: "#6A1B9A", rows: weakGsqac },
  ];
  const avg25 = avg(pgiRanking2425, "PercentAchieved");
  const avg26 = avg(pgiRanking2526, "PercentAchieved");
  const gs = goiData.stateGSQAC || [];
  const gsFirst = gs[0], gsLast = gs[gs.length - 1];

  const pctOf = (v) => (typeof v === "number" ? (v <= 1.5 ? v * 100 : v) : null);
  const mk = (rows) => rows.filter((r) => r.pct != null).sort((a, b) => b.pct - a.pct);
  const sgn = (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} pp`;
  const grpAvg = (rows, pr) => avg(rows.filter((r) => isPriorityDistrict(r.label) === pr), "pct");
  const lowSchools = [...(gogData.schoolGSQACDetail || [])].filter((x) => typeof x["% 2024-25"] === "number")
    .sort((a, b) => a["% 2024-25"] - b["% 2024-25"]).slice(0, 5)
    .map((x) => ({ label: x["School Name"], note: `${x.District} · ${x.Block}`, pct: x["% 2024-25"] }));
  const progRows = {
    pgi: mk(pgiRanking2526.map((d) => ({ label: d.District, pct: d.PercentAchieved }))),
    parakh: mk(parakhOverview.map((d) => ({ label: d.District, pct: pctOf(d.Overall) }))),
    sat: mk(satRank2.map((d) => ({ label: d.District, pct: d.PercentAchieved }))),
    gsqac: mk((gogData.districtGSQACResult || []).map((d) => ({ label: d.District, pct: d["Avg % (2024-25)"] }))),
  };
  const sat1Avg = avg(satRank1, "PercentAchieved"), sat2Avg = avg(satRank2, "PercentAchieved");
  const programs = [
    { title: "PGI-D 2.0", sub: "District score, 2025-26", color: "#D32F2F", rows: progRows.pgi, weak: weakPgi, weakTitle: "Weakest indicators",
      chips: [["State avg", `${avg26?.toFixed(1)}%`], ["Priority", `${priorityAvg?.toFixed(1)}%`], ["Other", `${otherAvg?.toFixed(1)}%`], ["vs 2024-25", avg25 != null ? sgn(avg26 - avg25) : "—"]] },
    { title: "PARAKH 2024", sub: "District overall score", color: "#1976D2", rows: progRows.parakh, weak: weakParakh, weakTitle: "Weakest subjects (grade · subject)",
      chips: [["State avg", `${avg(progRows.parakh, "pct")?.toFixed(1)}%`], ["Priority", `${grpAvg(progRows.parakh, true)?.toFixed(1)}%`], ["Other", `${grpAvg(progRows.parakh, false)?.toFixed(1)}%`]] },
    { title: "SAT", sub: "District average, Semester 2", color: "#B7791F", rows: progRows.sat, weak: weakSat, weakTitle: "Weakest learning outcomes (class · subject)",
      chips: [["Sem 1 avg", `${sat1Avg?.toFixed(1)}%`], ["Sem 2 avg", `${sat2Avg?.toFixed(1)}%`], ["Change", sat1Avg != null && sat2Avg != null ? sgn(sat2Avg - sat1Avg) : "—"], ["Priority (Sem 2)", `${grpAvg(progRows.sat, true)?.toFixed(1)}%`]] },
    { title: "PM SHRI — GSQAC", sub: "District average GSQAC %, 2024-25", color: "#6A1B9A", rows: progRows.gsqac, weak: lowSchools, weakTitle: "Lowest-scoring schools",
      chips: [["State avg", `${avg(progRows.gsqac, "pct")?.toFixed(1)}%`], ["Priority", `${grpAvg(progRows.gsqac, true)?.toFixed(1)}%`], ...(gsFirst && gsLast && gsFirst !== gsLast ? [[`${gsFirst.year} → ${gsLast.year}`, sgn(gsLast.avgPct - gsFirst.avgPct)]] : [])] },
  ];

  const engine = buildInsights({
    programs: {
      "PGI-D": pgiRanking2526.map((d) => ({ District: d.District, v: d.PercentAchieved })),
      PARAKH: parakhOverview.map((d) => ({ District: d.District, v: pctOf(d.Overall) })),
      SAT: satRank2.map((d) => ({ District: d.District, v: d.PercentAchieved })),
      GSQAC: (gogData.districtGSQACResult || []).map((d) => ({ District: d.District, v: d["Avg % (2024-25)"] })),
    },
    prevPgi: pgiRanking2425.map((d) => ({ District: d.District, v: d.PercentAchieved })),
    sat1: satRank1.map((d) => ({ District: d.District, v: d.PercentAchieved })),
    isPriority: isPriorityDistrict,
    weak: { pgi: weakPgi, parakh: weakParakh, sat: weakSat },
  });
  const TONE = { alert: ["#D93A2B", "#FDEAEA", "Act now"], watch: ["#B7791F", "#FFF4D6", "Keep an eye on this"], good: ["#178A4B", "#E6F4EA", "Doing well"], info: ["#3B82F6", "#EEF3FF", "Good to know"] };

  const List = ({ title, rows, color }) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: "#16233B", mb: 0.8 }}>{title}</Typography>
      {rows.length === 0 && <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Data not available.</Typography>}
      {rows.map((r, i) => (
        <Box key={`${r.label}${i}`} sx={{ mb: 0.8 }} title={r.note || r.label}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "#16233B", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.note && title !== "Top 5 districts" ? r.note : r.label}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{r.pct.toFixed(1)}%</Typography>
          </Box>
          {r.note && r.label && title !== "Top 5 districts" && <Typography noWrap sx={{ fontSize: 10, color: "#7A869A" }}>{r.label}</Typography>}
          <Box sx={{ height: 4, borderRadius: 2, bgcolor: "#EEF0F5" }}>
            <Box sx={{ width: `${Math.min(r.pct, 100)}%`, height: "100%", borderRadius: 2, bgcolor: color }} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  const cards = [
    avg25 != null && avg26 != null && {
      icon: <TrendingUpIcon />, color: "#1F8A70", title: "PGI-D — 2024-25 vs 2025-26",
      body: `District-average PGI-D moved from ${avg25.toFixed(1)}% to ${avg26.toFixed(1)}% (${avg26 - avg25 >= 0 ? "+" : ""}${(avg26 - avg25).toFixed(1)} pp).`,
    },
    gsFirst && gsLast && gsFirst !== gsLast && {
      icon: <StarIcon />, color: "#B18CE8", title: `GSQAC — ${gsFirst.year} vs ${gsLast.year}`,
      body: `State GSQAC average moved from ${gsFirst.avgPct.toFixed(1)}% to ${gsLast.avgPct.toFixed(1)}% (${gsLast.avgPct - gsFirst.avgPct >= 0 ? "+" : ""}${(gsLast.avgPct - gsFirst.avgPct).toFixed(1)} pp).`,
    },
    {
      icon: <EmojiEventsIcon />,
      color: "#F0B429",
      title: "Most improved district (PGI-D)",
      body: mostImproved
        ? `${mostImproved.District} gained ${mostImproved.delta.toFixed(1)} percentage points on PGI-D between 2024-25 and 2025-26 — the largest year-over-year jump of any district.`
        : "No two-year PGI-D comparison available.",
    },
    {
      icon: <PriorityHighIcon />,
      color: "#D32F2F",
      title: "Steepest PGI-D decline",
      body: mostDeclined
        ? `${mostDeclined.District} fell ${Math.abs(mostDeclined.delta).toFixed(1)} points on PGI-D over the same period — worth a closer look.`
        : "No two-year PGI-D comparison available.",
    },
    {
      icon: <StarIcon />,
      color: "#1F8A70",
      title: "Priority vs Other districts — PGI-D",
      body:
        priorityAvg != null && otherAvg != null
          ? `The state's ${PRIORITY_DISTRICTS.length} priority districts average ${priorityAvg.toFixed(1)}% on PGI-D 2025-26, against ${otherAvg.toFixed(1)}% for the other 23 — a gap of ${(otherAvg - priorityAvg).toFixed(1)} points.`
          : "PGI-D data not available.",
    },
    {
      icon: <TrendingUpIcon />,
      color: "#4C8BF5",
      title: "PARAKH — top & lowest district",
      body:
        topParakh && lowestParakh
          ? `${topParakh.District} leads PARAKH's overall score; ${lowestParakh.District} is currently lowest — the two ends of the same distribution.`
          : "PARAKH overview not available.",
    },
    {
      icon: <StarIcon />,
      color: "#B18CE8",
      title: "GSQAC — priority districts",
      body:
        gsqacPriorityAvg != null
          ? `Priority districts average ${gsqacPriorityAvg.toFixed(1)}% on GSQAC (PM Shri) — a useful cross-check against how the same 10 districts do on PGI-D and PARAKH.`
          : "GSQAC data not available.",
    },
    {
      icon: <LightbulbIcon />,
      color: "#D32F2F",
      title: "Weakest PGI-D Indicator (Domain)",
      body: weakestDomain
        ? `${weakestDomain.domain.split(" - ")[0]} is the weakest-performing PGI-D domain state-wide in 2025-26, at ${weakestDomain.percentAchieved.toFixed(1)}% — the clearest single lever for improving the overall PGI-D score.`
        : "PGI-D domain data not available.",
    },
].filter(Boolean);

  return (
    <DashboardLayout>
      <Header
        pageIcon="🔎"
        pageEyebrow="Computed from this dashboard's own data — not AI-generated"
        pageTitle="Key Insights"
        pageSubtitle="A few specific, checkable findings pulled from the PARAKH / PGI-D / GSQAC data already on this dashboard"
      />

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 1.75, mb: 2, bgcolor: "#F7FAFC" }}>
        <Typography sx={{ fontSize: 12, color: "#5B6B85" }}>
          <b style={{ color: "#16233B" }}>How to read this page: </b>every line below is worked out automatically from the latest PGI-D, PARAKH, SAT and PM SHRI (GSQAC) numbers.
          Red means act now, yellow means keep an eye on it, green means a strength. "Points" means percentage points (a move from 50% to 53% is 3 points).
          "State average" is the average of all 33 districts. Priority districts are the 10 districts chosen for extra support.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, p: 2.25, mb: 2, color: "#fff", background: "linear-gradient(120deg, #0B4F6C 0%, #146E8C 55%, #2FA8C8 100%)" }}>
        <Typography sx={{ fontSize: 11, letterSpacing: 1, fontWeight: 700, opacity: 0.85, mb: 0.75 }}>THE SHORT VERSION</Typography>
        {engine.bullets.map((t) => (
          <Typography key={t} sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.6 }}>• {t}</Typography>
        ))}
      </Paper>

      <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B", mb: 1 }}>What the numbers show, and what to do about it</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 1.25, mb: 2.5 }}>
        {engine.insights.map((it) => {
          const [c, bg, label] = TONE[it.tone];
          return (
            <Paper key={it.title} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", borderLeft: `4px solid ${c}`, p: 1.75 }}>
              <Box sx={{ display: "inline-block", px: 1, py: 0.1, borderRadius: 1, bgcolor: bg, color: c, fontSize: 10.5, fontWeight: 700, mb: 0.6 }}>{label}</Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#16233B", lineHeight: 1.35, mb: 0.6 }}>{it.title}</Typography>
              <Typography sx={{ fontSize: 12, color: "#16233B", mb: 0.5 }}><b style={{ color: "#5B6B85" }}>What we see: </b>{it.detail}</Typography>
              {it.why && <Typography sx={{ fontSize: 12, color: "#16233B", mb: 0.5 }}><b style={{ color: "#5B6B85" }}>Why it matters: </b>{it.why}</Typography>}
              <Typography sx={{ fontSize: 12, color: "#16233B" }}><b style={{ color: c }}>What to do: </b>{it.action}</Typography>
            </Paper>
          );
        })}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 2, mb: 2.5, overflowX: "auto" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B" }}>Districts that need the most support</Typography>
        <Typography sx={{ fontSize: 11, color: "#5B6B85", mb: 1 }}>Districts are ranked by how they do across all programs together. Red number = below the state average, green = above. "Weakest program" is where that district is furthest behind.</Typography>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#5B6B85" }}>
              <th style={{ padding: "4px 8px" }}>#</th><th style={{ padding: "4px 8px" }}>District</th>
              {engine.keys.map((k) => <th key={k} style={{ padding: "4px 8px" }}>{k}</th>)}
              <th style={{ padding: "4px 8px" }}>Weakest program</th>
            </tr>
          </thead>
          <tbody>
            {engine.focus.map((r, i) => (
              <tr key={r.d} style={{ borderTop: "1px solid #EEF0F5" }}>
                <td style={{ padding: "6px 8px" }}>{i + 1}</td>
                <td style={{ padding: "6px 8px", fontWeight: 700 }}>{r.d}{r.priority ? " ⭐" : ""}</td>
                {engine.keys.map((k) => (
                  <td key={k} style={{ padding: "6px 8px", color: r.vals[k] ? (r.vals[k].diff < 0 ? "#D93A2B" : "#178A4B") : "#9AA5B1", fontWeight: 600 }}>
                    {r.vals[k] ? `${r.vals[k].v.toFixed(1)}%` : "—"}
                  </td>
                ))}
                <td style={{ padding: "6px 8px", fontWeight: 700 }}>{r.focusProgram}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Paper>

      <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#16233B", mb: 1 }}>The detail behind it: best and weakest districts in each program</Typography>
      {programs.map((p) => (
        <Paper key={p.title} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 2, mb: 1.5 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: "#16233B" }}>{p.title}</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{p.sub}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {p.chips.map(([k, v]) => (
                <Box key={k} sx={{ px: 1.25, py: 0.4, borderRadius: 2, bgcolor: `${p.color}12`, border: `1px solid ${p.color}33` }}>
                  <Typography sx={{ fontSize: 10.5, color: "text.secondary", lineHeight: 1.2 }}>{k}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: p.color, lineHeight: 1.3 }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
            <List title="Top 5 districts" rows={p.rows.slice(0, 5)} color="#178A4B" />
            <List title="Bottom 5 districts" rows={p.rows.slice(-5).reverse()} color="#D93A2B" />
            <List title={p.weakTitle} rows={p.weak} color={p.color} />
          </Box>
        </Paper>
      ))}
    </DashboardLayout>
  );
};

export default KeyInsights;
