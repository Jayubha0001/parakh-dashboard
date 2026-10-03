import { normalizeDistrictName as nm } from "./satDistrictMap";

// Rule-based "analyst": reads the district numbers of every program and writes findings, each with a
// suggested action. No outside service is called; everything is computed from the dashboard data.
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const sd = (a) => {
  const m = mean(a);
  return a.length > 1 ? Math.sqrt(mean(a.map((x) => (x - m) ** 2))) : 0;
};
const pearson = (xs, ys) => {
  const mx = mean(xs), my = mean(ys);
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) * ys.reduce((s, y) => s + (y - my) ** 2, 0));
  return den ? num / den : null;
};
const f1 = (n) => (n == null ? "—" : n.toFixed(1));
const sg = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}`;
const list = (a) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

export const buildInsights = ({ programs, prevPgi = [], sat1 = [], isPriority, weak = {} }) => {
  const toMap = (rows) => Object.fromEntries(rows.filter((r) => typeof r.v === "number" && !Number.isNaN(r.v)).map((r) => [nm(r.District), r.v]));
  const P = Object.fromEntries(Object.entries(programs).map(([k, rows]) => [k, toMap(rows)]));
  const names = [...new Set(Object.values(P).flatMap((m) => Object.keys(m)))];
  const stat = Object.fromEntries(Object.entries(P).map(([k, m]) => [k, { mean: mean(Object.values(m)), sd: sd(Object.values(m)), n: Object.keys(m).length }]));

  const rows = names.map((d) => {
    const parts = Object.keys(P).filter((k) => P[k][d] != null && stat[k].sd > 0)
      .map((k) => ({ k, v: P[k][d], diff: P[k][d] - stat[k].mean, z: (P[k][d] - stat[k].mean) / stat[k].sd }));
    return { d, parts, comp: parts.length ? mean(parts.map((x) => x.z)) : null, priority: isPriority(d) };
  }).filter((r) => r.parts.length >= 2);
  const byComp = [...rows].sort((a, b) => a.comp - b.comp);

  const out = [];
  const add = (tone, title, detail, action, why = "") => out.push({ tone, title, detail, action, why });
  const trend = [];

  // 1. Below average everywhere / above average everywhere
  const lag = rows.filter((r) => r.parts.length >= 3 && r.parts.every((x) => x.z < 0)).sort((a, b) => a.comp - b.comp);
  if (lag.length) add("alert", `${lag.length} district${lag.length > 1 ? "s are" : " is"} below the state average on every program`,
    `${list(lag.slice(0, 6).map((r) => r.d))}${lag.length > 6 ? ` and ${lag.length - 6} more` : ""}. ${lag.filter((r) => r.priority).length} of them ${lag.filter((r) => r.priority).length === 1 ? "is" : "are"} priority districts.`,
    `Treat these as whole-district problems, not single-program ones: plan one joint review per district, starting with ${lag[0].d}'s weakest program (${[...lag[0].parts].sort((a, b) => a.z - b.z)[0].k}).`,
    "When a district is behind everywhere, fixing one program alone will not lift it.");
  const lead = rows.filter((r) => r.parts.length >= 3 && r.parts.every((x) => x.z > 0)).sort((a, b) => b.comp - a.comp);
  if (lead.length) add("good", `${list(lead.slice(0, 4).map((r) => r.d))} ${lead.length > 1 ? "lead" : "leads"} on every program`,
    `Above the state average on all ${lead[0].parts.length} programs measured.`, "Document what these districts do differently and pair them with the districts above that are lagging.");

  // 2. Districts where programs disagree
  const split = rows.filter((r) => r.parts.length >= 3).map((r) => {
    const s = [...r.parts].sort((a, b) => b.z - a.z);
    return { r, hi: s[0], lo: s[s.length - 1], gap: s[0].z - s[s.length - 1].z };
  }).sort((a, b) => b.gap - a.gap).slice(0, 3);
  split.forEach(({ r, hi, lo }) => add("watch", `${r.d}: strong on ${hi.k}, weak on ${lo.k}`,
    `${hi.k} is ${f1(hi.v)}% (${sg(hi.diff)} points vs state average) while ${lo.k} is ${f1(lo.v)}% (${sg(lo.diff)} points).`,
    hi.k === "PGI-D" || lo.k === "PGI-D"
      ? `Check whether school systems (PGI-D) and classroom results (${hi.k === "PGI-D" ? lo.k : hi.k}) are being managed by different teams; align them.`
      : `Look at what drives ${hi.k} in ${r.d} and whether it can be carried over to ${lo.k}.`));

  // 3. Priority districts clustering at the bottom
  const prog = [];
  Object.entries(P).forEach(([k, m]) => {
    const ranked = Object.entries(m).sort((a, b) => b[1] - a[1]).map(([d]) => d);
    const third = Math.ceil(ranked.length / 3);
    const pr = ranked.filter((d) => isPriority(d));
    const inBottom = pr.filter((d) => ranked.indexOf(d) >= ranked.length - third).length;
    const pAvg = mean(pr.map((d) => m[d])), oAvg = mean(ranked.filter((d) => !isPriority(d)).map((d) => m[d]));
    prog.push({ k, inBottom, total: pr.length, gap: oAvg - pAvg, pAvg, oAvg });
  });
  prog.filter((x) => x.total >= 5 && x.gap > 0).sort((a, b) => b.inBottom - a.inBottom).slice(0, 2).forEach((x) => {
    if (x.inBottom >= 4) add(x.inBottom >= 6 ? "alert" : "watch", `${x.inBottom} of ${x.total} priority districts are in the bottom third on ${x.k}`,
      `Priority districts average ${f1(x.pAvg)}% against ${f1(x.oAvg)}% for the others (${f1(x.gap)} points gap).`,
      `Concentrate ${x.k} support on the priority districts first; they carry most of the state's shortfall.`,
      "These districts were chosen for extra support, and the numbers show they still sit at the bottom.");
  });
  const widest = [...prog].sort((a, b) => b.gap - a.gap)[0];
  if (widest && widest.gap > 0) add("info", `The priority-district gap is widest on ${widest.k}`, `${f1(widest.gap)} points between other and priority districts (${f1(widest.oAvg)}% vs ${f1(widest.pAvg)}%).`, `If only one program can be targeted this cycle, ${widest.k} closes the most ground.`);

  // 4. Momentum
  const prev = toMap(prevPgi);
  const d26 = Object.entries(P["PGI-D"] || {}).filter(([d]) => prev[d] != null).map(([d, v]) => ({ d, delta: v - prev[d] })).sort((a, b) => b.delta - a.delta);
  if (d26.length) {
    const down = d26.filter((x) => x.delta < 0).length, avgD = mean(d26.map((x) => x.delta));
    add(avgD < 0 ? "alert" : "good", `PGI-D ${avgD < 0 ? "fell" : "rose"} in ${avgD < 0 ? down : d26.length - down} of ${d26.length} districts`,
      `District average moved ${sg(avgD)} points since 2024-25. Best: ${d26[0].d} (${sg(d26[0].delta)}). Worst: ${d26[d26.length - 1].d} (${sg(d26[d26.length - 1].delta)}).`,
      avgD < 0 ? `Review ${d26[d26.length - 1].d} first, then the indicators that dropped state-wide.` : `Share what ${d26[0].d} changed with districts that are flat or falling.`,
      avgD < 0 ? "A fall means the state is moving backwards on school inputs, not just standing still." : "Rising scores show the current actions are working.");
    trend.push(`PGI-D ${avgD < 0 ? "went down" : "went up"} by ${Math.abs(avgD).toFixed(1)} points on average since 2024-25.`);
  }
  const s1 = toMap(sat1), s2 = P["SAT"] || {};
  const sd2 = Object.keys(s2).filter((d) => s1[d] != null).map((d) => ({ d, delta: s2[d] - s1[d] })).sort((a, b) => b.delta - a.delta);
  if (sd2.length) {
    const up = sd2.filter((x) => x.delta > 0).length;
    add(up >= sd2.length * 0.75 ? "good" : "info", `SAT improved from Semester 1 to Semester 2 in ${up} of ${sd2.length} districts`,
      `Average change ${sg(mean(sd2.map((x) => x.delta)))} points. Largest gain: ${sd2[0].d} (${sg(sd2[0].delta)}); smallest: ${sd2[sd2.length - 1].d} (${sg(sd2[sd2.length - 1].delta)}).`,
      sd2[sd2.length - 1].delta < 1 ? `Ask ${sd2[sd2.length - 1].d} why Semester 2 did not move; it is the one district that stalled.` : "Keep the Semester 2 revision practice that produced this gain.");
    trend.push(`SAT went ${mean(sd2.map((x) => x.delta)) >= 0 ? "up" : "down"} by ${Math.abs(mean(sd2.map((x) => x.delta))).toFixed(1)} points from Semester 1 to Semester 2.`);
  }

  // 5. Do programs move together?
  const keys = Object.keys(P), pairs = [];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const common = Object.keys(P[keys[i]]).filter((d) => P[keys[j]][d] != null);
    if (common.length >= 15) pairs.push({ a: keys[i], b: keys[j], r: pearson(common.map((d) => P[keys[i]][d]), common.map((d) => P[keys[j]][d])) });
  }
  const pr = pairs.filter((x) => x.r != null).sort((a, b) => b.r - a.r);
  if (pr.length) {
    const hi = pr[0], lo = pr[pr.length - 1];
    if (hi.r > 0.5) add("info", `Districts that do well on ${hi.a} usually also do well on ${hi.b}`,
      "The two move together across districts, so a gain in one is likely to show in the other.", `Track ${hi.a} and ${hi.b} together when reviewing a district.`, "It tells you the two programs are pulling the same districts up or down.");
    if (lo.r < 0.3) add("info", `Doing well on ${lo.a} says little about ${lo.b}`,
      `A district's position on ${lo.a} does not predict its position on ${lo.b}.`, `Look at ${lo.a} and ${lo.b} separately when picking districts for support.`, "A good score on one can hide a weak score on the other.");
  }

  // 6. Biggest single gaps
  const bits = [];
  if (weak.pgi?.[0]) bits.push(`PGI-D indicator "${weak.pgi[0].note || weak.pgi[0].label}" scores ${f1(weak.pgi[0].pct)}%`);
  if (weak.parakh?.[0]) bits.push(`PARAKH ${weak.parakh[0].label} is ${f1(weak.parakh[0].pct)}%`);
  if (weak.sat?.[0]) bits.push(`SAT ${weak.sat[0].label} is ${f1(weak.sat[0].pct)}%`);
  if (bits.length) add("alert", "Where the deepest gaps sit", `${bits.join("; ")}.`, "These three are the lowest-scoring items in their programs; make them the focus of the next training and monitoring cycle.",
    "A single weak indicator or subject can hold the whole district score down.");

  const order = { alert: 0, watch: 1, good: 2, info: 3 };
  out.sort((a, b) => order[a.tone] - order[b.tone]);

  const focus = byComp.slice(0, 5).map((r) => ({
    d: r.d, priority: r.priority, comp: r.comp,
    vals: Object.fromEntries(r.parts.map((x) => [x.k, x])), focusProgram: [...r.parts].sort((a, b) => a.z - b.z)[0].k,
  }));
  const alerts = out.filter((x) => x.tone === "alert").length;
  const summary = `Across ${names.length} districts and ${keys.length} programs, ${alerts} area${alerts === 1 ? "" : "s"} need${alerts === 1 ? "s" : ""} attention. ` +
    `${list(byComp.slice(0, 3).map((r) => r.d))} ${byComp.length ? "rank lowest overall" : ""}, while ${list([...byComp].reverse().slice(0, 3).map((r) => r.d))} rank highest. ` +
    (lag.length ? `${lag.length} district${lag.length > 1 ? "s sit" : " sits"} below the state average on every program.` : "No district is below average on every program.");
  const bullets = [
    `Lowest overall: ${list(byComp.slice(0, 3).map((r) => r.d))}.`,
    `Highest overall: ${list([...byComp].reverse().slice(0, 3).map((r) => r.d))}.`,
    lag.length ? `${lag.length} district${lag.length > 1 ? "s are" : " is"} below the state average on every program.` : "No district is below the state average on every program.",
    ...trend,
  ];
  return { insights: out, focus, summary, bullets, keys, stat };
};
