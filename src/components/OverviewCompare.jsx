import { barLabel } from "../utils/chartLabels";
import { fmt1 } from "../utils/fmt";
import { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LabelList,
} from "recharts";
import pgiD202526 from "../data/pgiD202526.json";
import { useFeatureFlags } from "../config/FeatureFlagsContext";
import { normalizeDistrictName } from "../utils/satDistrictMap";
import statePgi202526 from "../data/statePgi202526.json";
import pgiIndicators from "../data/districtPgiIndicators202526.json";
import gog from "../data/pmshriGOG.json";
import goi from "../data/pmshriGOI.json";

const C1 = "#F0B429", C2 = "#3B82F6";
const avg2 = (a, b) => (typeof a === "number" && typeof b === "number" ? (a + b) / 2 : typeof a === "number" ? a : typeof b === "number" ? b : null);
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);
const domKey = (s) => (String(s).match(/Domain\s*\d+|Category\s*\d+/i) || [String(s)])[0];
const domShort = (s) => String(s).replace(/^Domain\s*\d+:\s*/i, "").replace(/\s*-\s*\d+\s*$/, "").replace(/\(.*?\)/, "").trim();

const Card = ({ title, sub, children }) => (
  <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #E4E7F0", p: { xs: 1.25, md: 1.5 }, minWidth: 0, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#16233B", lineHeight: 1.25 }}>{title}</Typography>
    <Typography sx={{ fontSize: 11, color: "#5B6B85", mb: 0.25 }}>{sub}</Typography>
    {children}
  </Paper>
);

const Compare = ({ data, k1, k2, k3, h = 150, fmt = (v) => `${v}%` }) => (
  <ResponsiveContainer width="100%" height={h}>
    <BarChart key={`${k1}-${k2}-${k3 || ""}`} data={data} margin={{ top: 34, right: 8, left: -12, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 10.5 }} interval={0} />
      <YAxis tick={{ fontSize: 10.5 }} domain={[0, "auto"]} />
      <Tooltip formatter={(v) => (v == null ? "—" : fmt(v))} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      <Bar dataKey={k1} fill={C1} radius={[3, 3, 0, 0]}>
<LabelList dataKey={k1} content={barLabel(false)} />
</Bar>
      <Bar dataKey={k2} fill={C2} radius={[3, 3, 0, 0]}>
<LabelList dataKey={k2} content={barLabel(false)} />
</Bar>
      {k3 && <Bar dataKey={k3} fill="#2E9E6B" radius={[3, 3, 0, 0]}>
<LabelList dataKey={k3} content={barLabel(false)} />
</Bar>}
    </BarChart>
  </ResponsiveContainer>
);

const Weak = ({ title, hint, color, rows }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontWeight: 700, fontSize: 12, color, lineHeight: 1.2 }}>{title}</Typography>
    <Typography sx={{ fontSize: 10, color: "#7A869A", mb: 0.6 }}>{hint}</Typography>
    {rows.length === 0 && <Typography sx={{ fontSize: 12, color: "text.secondary" }}>—</Typography>}
    {rows.map((r, i) => (
      <Box key={`${r.label}${i}`} sx={{ mb: 0.9 }} title={`${r.label}${r.note ? " — " + r.note : ""}`}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Typography sx={{ fontSize: 10.5, color: "#16233B", fontWeight: 600, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {r.note || r.label}
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{r1(r.pct)}%</Typography>
        </Box>
        {r.note && <Typography noWrap sx={{ fontSize: 10, color: "#7A869A" }}>{r.label}</Typography>}
        <Box sx={{ height: 4, borderRadius: 2, bgcolor: "#EEF0F5", mt: 0.3 }}>
          <Box sx={{ width: `${Math.min(r.pct, 100)}%`, height: "100%", borderRadius: 2, bgcolor: color }} />
        </Box>
      </Box>
    ))}
  </Box>
);

const same = (a, b) => String(normalizeDistrictName(a)).toLowerCase() === String(normalizeDistrictName(b)).toLowerCase();
const ci = (list, name) => (list || []).find((d) => same(d.District, name));
const fix = (v) => (typeof v === "number" ? (v <= 1.5 ? v * 100 : v) : null);
const lowN = (rows, n) => rows.filter((r) => r.pct != null).map((r) => ({ ...r, pct: fix(r.pct) })).sort((a, b) => a.pct - b.pct).slice(0, n);

const OverviewCompare = ({ pgi2425, pgiRanking2425 = [], sat1, sat2, satGw1, satGw2, subjectHeatmap, district = "All", assessment = "Overall", parakhSubjects = [], satWeak = [] }) => {
  const { flags } = useFeatureFlags();
  const on = (k) => flags[k] !== false;
  const sel = district !== "All" ? district : null;
  const showPGI = on("cmp_pgi") && (assessment === "Overall" || assessment === "PGI-D");
  const showSAT = on("cmp_sat") && (assessment === "Overall" || assessment === "SAT");
  const showPM = on("cmp_pmshri") && assessment === "Overall";
  const N = assessment === "Overall" ? 4 : 6;
  const pgiDomains = useMemo(() => {
    if (sel) {
      const a = ci(pgiRanking2425, sel)?.PercentAchieved;
      const b = ci(pgiD202526.ranking, sel)?.PercentAchieved;
      return [{ name: "2024-25", District: r1(a), State: r1(pgi2425?.overall?.percentAchieved) }, { name: "2025-26", District: r1(b), State: r1(statePgi202526.overall?.percentAchieved) }];
    }
    const prev = Object.fromEntries((pgi2425?.domains || []).map((d) => [domKey(d.domain), d]));
    return (statePgi202526.domains || []).map((d) => ({
      name: domKey(d.domain).replace("Domain ", "D"),
      full: domShort(d.domain),
      "2024-25": r1(prev[domKey(d.domain)]?.percentAchieved),
      "2025-26": r1(d.percentAchieved),
    }));
  }, [pgi2425, sel, pgiRanking2425]);

  const satGrades = useMemo(() => {
    if (sel) {
      const a = ci(satGw1?.data, sel), b = ci(satGw2?.data, sel);
      return (satGw2?.grades || []).map((g) => ({ name: g, "Sem 1": r1(a?.[g]), "Sem 2": r1(b?.[g]), Overall: r1(avg2(a?.[g], b?.[g])) }));
    }
    const g2 = Object.fromEntries((sat2?.gradeAverages || []).map((g) => [g.grade, g.average]));
    return (sat1?.gradeAverages || []).map((g) => ({ name: g.grade, "Sem 1": r1(g.average), "Sem 2": r1(g2[g.grade]), Overall: r1(avg2(g.average, g2[g.grade])) }));
  }, [sat1, sat2, sel, satGw1, satGw2]);

  const de = sel ? ci(goi.districtEnrollment, sel) : null;
  const dg = sel ? ci(goi.districtGSQAC, sel) : null;
  const enroll = sel
    ? ["2022-23", "2023-24", "2024-25", "2025-26"].filter((y) => de?.[`Enrollment ${y}`] != null).map((y) => ({ name: y, Enrollment: de[`Enrollment ${y}`] }))
    : (goi.stateEnrollment || []).map((e) => ({ name: e.year, Enrollment: e.totalEnrollment }));
  const gsqac = sel
    ? ["2022-23", "2023-24", "2024-25"].filter((y) => dg?.[`Avg GSQAC% ${y}`] != null).map((y) => ({ name: y, "GSQAC %": r1(dg[`Avg GSQAC% ${y}`]) }))
    : (goi.stateGSQAC || []).map((e) => ({ name: e.year, "GSQAC %": r1(e.avgPct) }));

  const weak = useMemo(() => {
    if (sel) {
      const d = pgiIndicators[Object.keys(pgiIndicators).find((k) => same(k, sel))];
      const pgi = lowN((d?.indicators || []).filter((i) => i.weight > 0).map((i) => ({ label: i.indNo, note: i.indicator, pct: (i.score / i.weight) * 100 })), N);
      const g = lowN(gog.schoolGSQACDetail.filter((x) => same(x.District, sel)).map((x) => ({ label: x["School Name"], note: x["School Name"], pct: x["% 2024-25"] })), N);
      const parakh = subjectHeatmap?.data ? (() => {
        const row = ci(subjectHeatmap.data, sel);
        return row ? lowN(subjectHeatmap.columns.filter((c) => !c.endsWith("Average")).map((c) => ({ label: c, pct: typeof row[c] === "number" ? row[c] : null })), N) : [];
      })() : [];
      return { pgi, g, parakh };
    }
    const agg = {};
    Object.values(pgiIndicators).forEach((d) => (d.indicators || []).forEach((i) => {
      const a = (agg[i.indNo] ||= { label: i.indNo, note: i.indicator, s: 0, w: 0 });
      a.s += Number(i.score) || 0; a.w += Number(i.weight) || 0;
    }));
    const pgi = Object.values(agg).filter((a) => a.w > 0).map((a) => ({ ...a, pct: (a.s / a.w) * 100 })).sort((a, b) => a.pct - b.pct).slice(0, N);
    const g = [...(gog.districtGSQACResult || [])].filter((d) => typeof d["Avg % (2024-25)"] === "number")
      .sort((a, b) => a["Avg % (2024-25)"] - b["Avg % (2024-25)"]).slice(0, N)
      .map((d) => ({ label: d.District, pct: d["Avg % (2024-25)"] }));
    return { pgi, g, parakh: null };
  }, [sel, N, subjectHeatmap]);

  const cmpCards = [showPGI, showSAT, showPM].filter(Boolean).length;
  const who = sel ? `${sel}` : "State";
  const k1 = sel ? "District" : null;
  const wk = [
    showPGI && ["PGI-D indicators", "#D32F2F", weak.pgi, "% of indicator marks scored"],
    (assessment === "Overall" || assessment === "PARAKH") && ["PARAKH subjects", "#1976D2", sel ? weak.parakh : lowN(parakhSubjects, N), "% of students at proficiency, grade · subject"],
    showSAT && ["SAT learning outcomes", "#B7791F", satWeak.slice(0, N), "% of marks scored, class · subject · LO code"],
    showPM && [sel ? "GSQAC schools (2024-25)" : "GSQAC districts", "#6A1B9A", weak.g, sel ? "GSQAC % per school" : "Avg GSQAC % per district"],
  ].filter(Boolean);
  const dual = (d, a, b) => (sel ? <Compare data={d} k1="District" k2="State" h={150} /> : <Compare data={d} k1={a} k2={b} />);
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))", lg: cmpCards === 1 ? "repeat(2, minmax(0,1fr))" : `repeat(${Math.min(3, cmpCards)}, minmax(0,1fr))` }, gap: 1.25, mt: 1.25 }}>
      {showPGI && (
        <Card title="PGI-D — 2024-25 vs 2025-26" sub={sel ? `${sel} vs state — % achieved` : "Domain-wise % achieved (state)"}>
          {sel ? <Compare data={pgiDomains} k1="District" k2="State" /> : <Compare data={pgiDomains} k1="2024-25" k2="2025-26" />}
        </Card>
      )}
      {showSAT && (
        <Card title="SAT — Semester 1 vs Semester 2" sub={`Grade-wise ${who.toLowerCase() === "state" ? "state average" : sel} (%)`}>
          <Compare data={satGrades} k1="Sem 1" k2="Sem 2" k3="Overall" />
        </Card>
      )}
      {showPM && (
        <Card title="PM SHRI — Enrolment & GSQAC by year" sub={`${who} totals, year-wise`}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={enroll} margin={{ top: 34, right: 4, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? fmt1(v) : v)} /><Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Enrollment" name="Enrolment" fill={C2} radius={[3, 3, 0, 0]}>
<LabelList dataKey="Enrollment" content={barLabel(false)} />
</Bar>
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={gsqac} margin={{ top: 34, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => `${fmt1(v)}%`} /><Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="GSQAC %" fill={C1} radius={[3, 3, 0, 0]}>
<LabelList dataKey="GSQAC %" content={barLabel(false)} />
</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      )}
      {on("dash_weakest") && !(sel && on("dash_deepDive")) && <Box sx={{ gridColumn: cmpCards === 1 ? { xs: "1 / -1", lg: "span 1" } : "1 / -1", minWidth: 0 }}>
        <Card title={sel ? `${sel} — Weakest Indicators` : "Weakest Indicators — by program"} sub={assessment === "Overall" ? "Lowest-scoring items in each program" : `Lowest-scoring ${assessment} items`}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: `repeat(${cmpCards === 1 ? 1 : Math.min(4, wk.length)}, 1fr)` }, gap: 1.25 }}>
            {wk.map(([t, c, r, h]) => <Weak key={t} title={t} hint={h} color={c} rows={r || []} />)}
          </Box>
        </Card>
      </Box>}
    </Box>
  );
};

export default OverviewCompare;
