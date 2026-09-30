import pgiD202526 from "../data/pgiD202526.json";
import { PARAKH_GRADES } from "./overviewConfig";

const r1 = (n) => Math.round(n * 10) / 10;
const avg = (a) => {
  const v = a.filter((x) => typeof x === "number" && !Number.isNaN(x));
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};
export { avg, r1 };

// One number per district for each program, all on a 0-100 scale.
export const programMaps = ({ pgiRanking2425 = [], parakhData = [], satComparison = [], satGradeWise, satGradeWiseSem1, grade, year }) => {
  const gradeSel = grade && grade !== "All Grades";
  const pgi26 = Object.fromEntries(pgiD202526.ranking.map((r) => [r.District, r.PercentAchieved]));
  const pgi25 = Object.fromEntries(pgiRanking2425.map((r) => [r.District, r.PercentAchieved]));
  const pcol = gradeSel ? PARAKH_GRADES[grade] : "Overall";
  const parakh = Object.fromEntries(parakhData.filter((r) => typeof r[pcol] === "number").map((r) => [r.District, r[pcol] * 100]));
  const sem = year === "Sem 1" ? "S1" : year === "Sem 2" ? "S2" : "ALL";
  const s1 = {}, s2 = {};
  if (gradeSel) {
    (satGradeWiseSem1?.data || []).forEach((r) => typeof r[grade] === "number" && (s1[r.District] = r[grade]));
    (satGradeWise?.data || []).forEach((r) => typeof r[grade] === "number" && (s2[r.District] = r[grade]));
  } else {
    satComparison.forEach((r) => {
      if (typeof r.Sem1Pct === "number") s1[r.District] = r.Sem1Pct;
      if (typeof r.Sem2Pct === "number") s2[r.District] = r.Sem2Pct;
    });
  }
  const sat = {};
  new Set([...Object.keys(s1), ...Object.keys(s2)]).forEach((d) => {
    const v = sem === "S1" ? s1[d] : sem === "S2" ? s2[d] : avg([s1[d], s2[d]]);
    if (v != null) sat[d] = v;
  });
  return { pgi26, pgi25, parakh, sat, s1, s2 };
};

// level = the value plotted for the current filter; delta = 2025-26 minus 2024-25 (PGI-D).
export const levelsByDistrict = (args) => {
  const { assessment, year } = args;
  const m = programMaps(args);
  let level = {};
  if (assessment === "PGI-D") level = year === "2024-25" ? m.pgi25 : m.pgi26;
  else if (assessment === "PARAKH") level = m.parakh;
  else if (assessment === "SAT") level = m.sat;
  else Object.keys(m.pgi26).forEach((d) => {
    const v = avg([m.pgi26[d], m.parakh[d], m.sat[d]]);
    if (v != null) level[d] = v;
  });
  const delta = {};
  Object.keys(m.pgi26).forEach((d) => m.pgi25[d] != null && (delta[d] = m.pgi26[d] - m.pgi25[d]));
  const out = {};
  Object.entries(level).forEach(([k, v]) => (out[k] = r1(v)));
  const dOut = {};
  Object.entries(delta).forEach(([k, v]) => (dOut[k] = r1(v)));
  return { level: out, delta: dOut, maps: m };
};
