import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import StarIcon from "@mui/icons-material/Star";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import DashboardLayout from "../components/DashboardLayout";
import Header from "../components/Header";
import { loadExcel, getDistrictPGIRanking, getSheetData, getSubjectHeatmap, getSATWeakestLOs } from "../services/dataService";
import { isPriorityDistrict, PRIORITY_DISTRICTS } from "../utils/priorityDistricts";
import pgiD202526 from "../data/pgiD202526.json";
import statePgi202526 from "../data/statePgi202526.json";
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

  useEffect(() => {
    (async () => {
      const workbook = await loadExcel();
      setPgiRanking2425(getDistrictPGIRanking(workbook));
      setParakhOverview(getSheetData(workbook, "Dashboard_PARAKH"));
      const hm = getSubjectHeatmap(workbook);
      setWeakParakh(
        hm.columns.filter((c) => !c.endsWith("Average")).map((c) => {
          const v = hm.data.map((r) => r[c]).filter((x) => typeof x === "number");
          return { label: c, pct: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null };
        }).filter((x) => x.pct != null).sort((a, b) => a.pct - b.pct).slice(0, 5)
      );
      setWeakSat(getSATWeakestLOs(workbook, 5).map((x) => ({ label: `${x.subject} · ${x.loCode}`, note: x.indicator, pct: x.PercentAchieved })));
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

      <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#16233B", mb: 1.5 }}>Weakest Indicators — by program</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, mb: 3 }}>
        {weakPanels.map((p) => (
          <Paper key={p.title} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 2.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "#16233B" }}>{p.title}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1.5 }}>{p.sub}</Typography>
            {p.rows.length === 0 && <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Data not available.</Typography>}
            {p.rows.map((r) => (
              <Box key={r.label} sx={{ mb: 1.1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#16233B" }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: p.color }}>{r.pct.toFixed(1)}%</Typography>
                </Box>
                {r.note && <Typography sx={{ fontSize: 11, color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.note}>{r.note}</Typography>}
                <Box sx={{ height: 5, borderRadius: 3, bgcolor: "#EEF0F5", mt: 0.4 }}>
                  <Box sx={{ width: `${Math.min(r.pct, 100)}%`, height: "100%", borderRadius: 3, bgcolor: p.color }} />
                </Box>
              </Box>
            ))}
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {cards.map((c) => (
          <Paper
            key={c.title}
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: 2.25, display: "flex", gap: 2, alignItems: "flex-start" }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${c.color}1A`,
                color: c.color,
                flexShrink: 0,
              }}
            >
              {c.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "#16233B", mb: 0.3 }}>{c.title}</Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{c.body}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </DashboardLayout>
  );
};

export default KeyInsights;
