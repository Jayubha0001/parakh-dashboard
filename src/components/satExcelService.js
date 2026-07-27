// satExcelService.js
// Loads SAT (Sem 2) data DIRECTLY from the Excel workbook sitting in /public
// at runtime — no pre-converted JSON. Uses SheetJS (xlsx), same library the
// rest of the PGI dashboard already depends on.
//
// npm install xlsx   (skip if the project already has it for the PGI pages)

import * as XLSX from 'xlsx';

// ---------------------------------------------------------------------------
// ⚠️ CONFIRM THIS PATH — it must match the exact filename sitting in your
// project's /public folder (Vite serves everything in /public from "/").
// ---------------------------------------------------------------------------
const EXCEL_PATH = '/Gujarat_PARAKH_PGI_Comprehensive_Template.xlsx';

// Sheet names are looked up with these candidates, in order, so this works
// whether your workbook has the "SAT " prefix or not.
const SHEET_CANDIDATES = {
  districtWise: ['SAT District Wise', 'District Wise'],
  gradeWise: ['SAT District Grade wise', 'District Grade wise'],
  subjectWise: ['SAT District Grade Subject wise', 'District Grade Subject wise'],
  loWise: ['SAT District Grade Sub Lo Wise', 'District Grade Sub Lo Wise'],
  gradingScale: ['Grading_Scale'],
};

// Fallback bands, used only if the workbook has no Grading_Scale sheet.
const DEFAULT_BANDS = [
  { min: 91, label: 'Daksh', color: '#0B6E4F' },
  { min: 81, label: 'Utkarsh', color: '#2E9E5B' },
  { min: 71, label: 'Atti-Uttam', color: '#6BAF3F' },
  { min: 61, label: 'Uttam', color: '#A9C93B' },
  { min: 51, label: 'Prachesta-1', color: '#D9C93B' },
  { min: 41, label: 'Prachesta-2', color: '#E8A33B' },
  { min: 31, label: 'Prachesta-3', color: '#E8823B' },
  { min: 21, label: 'Akanshi-1', color: '#E0603B' },
  { min: 11, label: 'Akanshi-2', color: '#D1403B' },
  { min: 0, label: 'Akanshi-3', color: '#B3242F' },
];

const GRADE_ORDER = ['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];

let cachedPromise = null;

/** Loads + parses the workbook once, then serves every caller the same cached result. */
export function loadSATData() {
  if (!cachedPromise) {
    cachedPromise = fetchAndParse().catch((err) => {
      cachedPromise = null; // allow retry on next call if it failed
      throw err;
    });
  }
  return cachedPromise;
}

async function fetchAndParse() {
  const res = await fetch(EXCEL_PATH);
  if (!res.ok) {
    throw new Error(
      `SAT Excel file load na thayu (${EXCEL_PATH}). Public folder ma file nu naam check karo — SATExcelService.js ni upar EXCEL_PATH update karo.`
    );
  }
  const buf = await res.arrayBuffer();
  const workbook = XLSX.read(buf, { type: 'array' });

  const districtRows = readSheet(workbook, SHEET_CANDIDATES.districtWise);
  const gradeRows = readSheet(workbook, SHEET_CANDIDATES.gradeWise);
  const subjectRows = readSheet(workbook, SHEET_CANDIDATES.subjectWise);
  const loRows = readSheet(workbook, SHEET_CANDIDATES.loWise);
  const bands = readGradingScale(workbook);

  return buildNestedData(districtRows, gradeRows, subjectRows, loRows, bands);
}

// ---------------------------------------------------------------------------
// Sheet reading helpers
// ---------------------------------------------------------------------------

function findSheetName(workbook, candidates) {
  for (const name of candidates) {
    if (workbook.Sheets[name]) return name;
  }
  // fuzzy fallback: case-insensitive substring match
  const target = candidates[0].toLowerCase().replace('sat ', '');
  return workbook.SheetNames.find((n) => n.toLowerCase().replace('sat ', '').includes(target));
}

/** Reads a sheet into an array of plain objects, auto-detecting the header row and trimming header whitespace. */
function readSheet(workbook, candidates) {
  const sheetName = findSheetName(workbook, candidates);
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

  const headerIdx = rows.findIndex((r) => r[0] && String(r[0]).trim() === 'District');
  if (headerIdx === -1) return [];

  const headers = rows[headerIdx].map((h) => (h == null ? '' : String(h).trim()));
  return rows
    .slice(headerIdx + 1)
    .filter((r) => r[0] != null && String(r[0]).trim() !== '')
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = typeof r[i] === 'string' ? r[i].trim() : r[i];
      });
      return obj;
    });
}

function readGradingScale(workbook) {
  const sheetName = findSheetName(workbook, SHEET_CANDIDATES.gradingScale);
  if (!sheetName) return DEFAULT_BANDS;
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

  const headerIdx = rows.findIndex((r) => r[0] === 'Min % Achieved');
  if (headerIdx === -1) return DEFAULT_BANDS;

  const parsed = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (r[0] == null || r[1] == null) break;
    parsed.push({ min: Number(r[0]), label: String(r[1]).trim() });
  }
  if (parsed.length === 0) return DEFAULT_BANDS;

  parsed.sort((a, b) => b.min - a.min); // best first
  const colorScale = DEFAULT_BANDS.map((b) => b.color);
  return parsed.map((b, i) => ({ ...b, color: colorScale[i] || '#888' }));
}

// ---------------------------------------------------------------------------
// Build the nested District -> Grade -> Subject -> LO structure the page uses
// ---------------------------------------------------------------------------

function pct(v) {
  return v == null ? null : round2(v * 100);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildNestedData(districtRows, gradeRows, subjectRows, loRows, bands) {
  const isTotalRow = (name) => /total/i.test(name || '');

  const stateRow = districtRows.find((r) => isTotalRow(r.District));
  const stateTotal = stateRow
    ? {
        marks: stateRow['  TOTAL_QUESTION_MARKS'] ?? stateRow['TOTAL_QUESTION_MARKS'],
        score: stateRow['  TOTAL_OBTAINED_SCORE'] ?? stateRow['TOTAL_OBTAINED_SCORE'],
        pct: pct(stateRow['%']),
      }
    : null;

  const nested = {};
  districtRows
    .filter((r) => !isTotalRow(r.District))
    .forEach((r) => {
      nested[r.District] = {
        total: {
          marks: r['  TOTAL_QUESTION_MARKS'] ?? r['TOTAL_QUESTION_MARKS'],
          score: r['  TOTAL_OBTAINED_SCORE'] ?? r['TOTAL_OBTAINED_SCORE'],
          pct: pct(r['%']),
        },
        grades: {},
      };
    });

  gradeRows.forEach((r) => {
    const d = nested[r.District];
    if (!d) return;
    d.grades[r.GRADE] = {
      total: {
        marks: r['  TOTAL_QUESTION_MARKS'] ?? r['TOTAL_QUESTION_MARKS'],
        score: r['  TOTAL_OBTAINED_SCORE'] ?? r['TOTAL_OBTAINED_SCORE'],
        pct: pct(r['%']),
      },
      subjects: {},
    };
  });

  subjectRows.forEach((r) => {
    const subject = r.SUBJECT_ENG;
    if (!subject) return; // skip "Class X Total" subtotal rows
    const g = nested[r.District]?.grades?.[r.GRADE];
    if (!g) return;
    g.subjects[subject] = {
      marks: r['  TOTAL_QUESTION_MARKS'] ?? r['TOTAL_QUESTION_MARKS'],
      score: r['  TOTAL_OBTAINED_SCORE'] ?? r['TOTAL_OBTAINED_SCORE'],
      pct: pct(r['%']),
      los: [],
    };
  });

  loRows.forEach((r) => {
    const s = nested[r.District]?.grades?.[r.GRADE]?.subjects?.[r.SUBJECT_ENG];
    if (!s) return;
    s.los.push({
      lo: r.LO,
      indicator: r.Indicator,
      marks: r[' TOTAL_QUESTION_MARKS'] ?? r['TOTAL_QUESTION_MARKS'],
      score: r[' TOTAL_OBTAINED_SCORE'] ?? r['TOTAL_OBTAINED_SCORE'],
      pct: pct(r['%']),
    });
  });

  return { stateTotal, districts: nested, bands };
}

// ---------------------------------------------------------------------------
// Getters — every function takes the object returned by loadSATData()
// ---------------------------------------------------------------------------

export function getBand(bands, pctValue) {
  if (pctValue === null || pctValue === undefined) return bands[bands.length - 1];
  return bands.find((b) => pctValue >= b.min) || bands[bands.length - 1];
}

export function getDistrictsRanked(data) {
  const rows = Object.entries(data.districts).map(([district, d]) => ({ district, ...d.total }));
  rows.sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

export function getGradesForDistrict(data, district) {
  const grades = data.districts[district]?.grades ?? {};
  return Object.entries(grades)
    .map(([grade, g]) => ({ grade, ...g.total }))
    .sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade));
}

export function getSubjectsForGrade(data, district, grade) {
  const subjects = data.districts[district]?.grades?.[grade]?.subjects ?? {};
  return Object.entries(subjects)
    .map(([subject, s]) => ({ subject, marks: s.marks, score: s.score, pct: s.pct }))
    .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
}

export function getLOsForSubject(data, district, grade, subject, order = 'asc') {
  const los = data.districts[district]?.grades?.[grade]?.subjects?.[subject]?.los ?? [];
  const sorted = [...los].sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0));
  return order === 'asc' ? sorted : sorted.reverse();
}
