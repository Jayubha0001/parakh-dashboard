// satDataService.js
// Data access layer for SAT (Sem 2) results.
// Mirrors the same pattern as PGI's dataService: pure functions that read the
// pre-built JSON and return ready-to-render arrays/objects. Nothing here
// touches the DOM — keep it that way so it can be unit-tested / reused.

import satData from '../../data/satSem2Data.json';

// ---------------------------------------------------------------------------
// Performance bands — EDIT THESE to match the exact PGI grade thresholds
// used elsewhere in the app, so SAT and PGI read consistently side by side.
// ---------------------------------------------------------------------------
export const PERFORMANCE_BANDS = [
  { min: 70, label: 'ઉત્તમ (A+)', color: '#1B7A43' },
  { min: 60, label: 'સારું (A)', color: '#4CA64C' },
  { min: 50, label: 'સંતોષકારક (B)', color: '#D9A441' },
  { min: 40, label: 'સુધારો જરૂરી (C)', color: '#E07B39' },
  { min: 0, label: 'નબળું (D)', color: '#C0392B' },
];

export function getBand(pct) {
  if (pct === null || pct === undefined) return PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
  return PERFORMANCE_BANDS.find((b) => pct >= b.min) || PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
}

// ---------------------------------------------------------------------------
// State level
// ---------------------------------------------------------------------------
export function getStateTotal() {
  return satData.stateTotal;
}

// ---------------------------------------------------------------------------
// District level
// ---------------------------------------------------------------------------
export function getDistrictList() {
  return Object.keys(satData.districts).sort();
}

/** All districts with totals, ranked highest % first. rank is 1-indexed. */
export function getDistrictsRanked() {
  const rows = Object.entries(satData.districts).map(([district, d]) => ({
    district,
    ...d.total,
  }));
  rows.sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

export function getDistrictTotal(district) {
  return satData.districts[district]?.total ?? null;
}

// ---------------------------------------------------------------------------
// Grade level (within a district)
// ---------------------------------------------------------------------------
const GRADE_ORDER = ['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];

export function getGradesForDistrict(district) {
  const grades = satData.districts[district]?.grades ?? {};
  return Object.entries(grades)
    .map(([grade, g]) => ({ grade, ...g.total }))
    .sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade));
}

// ---------------------------------------------------------------------------
// Subject level (within a district + grade)
// ---------------------------------------------------------------------------
export function getSubjectsForGrade(district, grade) {
  const subjects = satData.districts[district]?.grades?.[grade]?.subjects ?? {};
  return Object.entries(subjects)
    .map(([subject, s]) => ({ subject, marks: s.marks, score: s.score, pct: s.pct }))
    .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
}

// ---------------------------------------------------------------------------
// Learning-Outcome (LO) level (within district + grade + subject)
// ---------------------------------------------------------------------------
/** Sorted weakest-first by default — the most actionable view for a LO list. */
export function getLOsForSubject(district, grade, subject, order = 'asc') {
  const los = satData.districts[district]?.grades?.[grade]?.subjects?.[subject]?.los ?? [];
  const sorted = [...los].sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0));
  return order === 'asc' ? sorted : sorted.reverse();
}

// ---------------------------------------------------------------------------
// Convenience: state-level grade-wise / subject-wise roll-ups, computed on
// the fly by aggregating district figures (kept out of the JSON to avoid
// duplicating numbers that could drift out of sync with the source sheets).
// ---------------------------------------------------------------------------
export function getStateGradeWise() {
  const totals = {};
  Object.values(satData.districts).forEach((d) => {
    Object.entries(d.grades).forEach(([grade, g]) => {
      if (!totals[grade]) totals[grade] = { marks: 0, score: 0 };
      totals[grade].marks += g.total.marks;
      totals[grade].score += g.total.score;
    });
  });
  return Object.entries(totals)
    .map(([grade, t]) => ({ grade, marks: t.marks, score: t.score, pct: round2((t.score / t.marks) * 100) }))
    .sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
