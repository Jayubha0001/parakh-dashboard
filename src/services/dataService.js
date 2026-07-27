import * as XLSX from "xlsx";
import { PRIORITY_DISTRICTS } from "../utils/priorityDistricts";
import { normalizeSATDistrict, isSATSummaryRow } from "../utils/satDistrictMap";

// Cache the parsed workbook in memory so navigating between pages
// (Dashboard, PARAKH, PGI, Comparison, Reports) doesn't re-download and
// re-parse the same Excel file every single time.
let cachedWorkbook = null;
let loadingPromise = null;

export const loadExcel = async () => {

  if (cachedWorkbook) {
    return cachedWorkbook;
  }

  // If a load is already in-flight (e.g. two components mounted at once),
  // reuse the same promise instead of fetching twice.
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const response = await fetch("/Gujarat_PARAKH_PGI_Comprehensive_Template.xlsx");
    const data = await response.arrayBuffer();

    const workbook = XLSX.read(data, {
      type: "array",
    });

    cachedWorkbook = workbook;
    loadingPromise = null;

    return workbook;
  })();

  return loadingPromise;

};

// -----------------------------
// SAT Semester 1 workbook — separate file (SAT_Perfomance_sem_1.xlsx),
// loaded and cached independently from the main workbook above so pages
// that don't need it never pay for the extra fetch/parse.
// -----------------------------

let cachedSem1Workbook = null;
let sem1LoadingPromise = null;

export const loadSATSem1Excel = async () => {

  if (cachedSem1Workbook) {
    return cachedSem1Workbook;
  }

  if (sem1LoadingPromise) {
    return sem1LoadingPromise;
  }

  sem1LoadingPromise = (async () => {
    const response = await fetch("/SAT_Perfomance_sem_1.xlsx");
    const data = await response.arrayBuffer();

    const workbook = XLSX.read(data, {
      type: "array",
    });

    cachedSem1Workbook = workbook;
    sem1LoadingPromise = null;

    return workbook;
  })();

  return sem1LoadingPromise;

};

export const getSheetData = (workbook, sheetName) => {

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  return rows
    .slice(5, 38)
    .filter(
  (row) =>
    row[0] &&
    typeof row[0] === "string" &&
    row[0] !== "" &&
    row[1] !== "" &&
    row[0] !== "District" &&
    !String(row[0]).startsWith("2.") &&
    !String(row[0]).startsWith("3.") &&
    !String(row[0]).startsWith("4.")
)
    .map((row) => ({
      District: row[0],
      Foundational: Number(row[1]),
      Preparatory: Number(row[2]),
      Middle: Number(row[3]),
      Overall: Number(row[4]),
    }))
    .slice(0, 33);

};

// -----------------------------
// PGI 2.0 - State-level Domain Summary (from State_PGI_2.0, rows 107-114)
// -----------------------------

export const getStatePGISummary = (workbook) => {

  const worksheet = workbook.Sheets["State_PGI_2.0"];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Excel row 108-113 (0-indexed 107-112) = the 6 domains
  const domains = rows.slice(107, 113).map((r) => ({
    domain: String(r[0] || ""),
    maxWeight: Number(r[1]) || 0,
    score: Number(r[4]) || 0,
    percentAchieved: Number(r[5]) || 0,
    grade: r[6] || "",
  }));

  // Excel row 114 (0-indexed 113) = Gujarat state overall
  const overallRow = rows[113] || [];

  const overall = {
    label: overallRow[0] || "GUJARAT STATE — OVERALL PGI 2.0 SCORE",
    maxWeight: Number(overallRow[1]) || 1000,
    score: Number(overallRow[4]) || 0,
    percentAchieved: Number(overallRow[5]) || 0,
    grade: overallRow[6] || "",
  };

  return { domains, overall };

};

// -----------------------------
// PGI-D 2.0 - District Ranking (from Dashboard_PGI, rows 6-38)
// -----------------------------

export const getDistrictPGIRanking = (workbook) => {

  const worksheet = workbook.Sheets["Dashboard_PGI"];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Excel rows 6-38 (0-indexed 5-37) = 33 districts
  return rows
    .slice(5, 38)
    .filter((r) => r[0] && typeof r[0] === "string")
    .map((r) => ({
      District: r[0],
      Score: Number(r[1]) || 0,
      PercentAchieved: Number(r[2]) || 0,
      Grade: r[3] || "",
    }));

};

// -----------------------------
// PGI-D 2.0 - Category Heat-map (from Dashboard_PGI, rows 41-47)
// One row per district, one column per category
// -----------------------------

export const getPGICategoryHeatmap = (workbook) => {

  const worksheet = workbook.Sheets["Dashboard_PGI"];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Excel row 41 (0-indexed 40) = header: ["Category", District1, District2, ...]
  const header = rows[40] || [];
  const districtNames = header.slice(1).filter((d) => d !== "");

  // Excel rows 42-47 (0-indexed 41-46) = 6 categories
  const categoryRows = rows.slice(41, 47);

  const categories = categoryRows.map((r) => String(r[0] || ""));

  const data = districtNames.map((district, idx) => {

    const entry = { District: district };

    categoryRows.forEach((catRow) => {
      const catName = String(catRow[0] || "");
      entry[catName] = Number(catRow[idx + 1]) || 0;
    });

    return entry;

  });

  return { categories, data };

};

// -----------------------------
// PARAKH - Generic "Dashboard_PARAKH" section reader
// headerRowExcel/lastDataRowExcel are 1-indexed Excel row numbers.
// Returns { columns: [...], data: [{ District, col1, col2, ... }] }
// -----------------------------

const getParakhSection = (workbook, headerRowExcel, lastDataRowExcel) => {

  const worksheet = workbook.Sheets["Dashboard_PARAKH"];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const header = rows[headerRowExcel - 1] || [];

  const columns = header.slice(1).filter((c) => c !== "");

  const data = rows
    .slice(headerRowExcel, lastDataRowExcel)
    .filter((r) => r[0] && typeof r[0] === "string")
    .map((r) => {

      const entry = { District: r[0] };

      columns.forEach((col, i) => {
        entry[col] = Number(r[i + 1]) || 0;
      });

      return entry;

    });

  return { columns, data };

};

// Section 2: Subject-wise Mastery heat-map (rows 41-74)
export const getSubjectHeatmap = (workbook) => {

  const base = getParakhSection(workbook, 41, 74);

  // Merge in each district's Foundational/Preparatory/Middle average
  // (from the main district table, rows 6-38) so the heat-map can show a
  // "Grade X - Average" column right after that grade's subjects.
  const overallByDistrict = Object.fromEntries(
    getSheetData(workbook, "Dashboard_PARAKH").map((d) => [d.District, d])
  );

  const data = base.data.map((row) => {
    const overall = overallByDistrict[row.District] || {};
    return {
      ...row,
      "Grade 3 - Average": overall.Foundational ?? null,
      "Grade 6 - Average": overall.Preparatory ?? null,
      "Grade 9 - Average": overall.Middle ?? null,
    };
  });

  // Reorder columns: subjects for each grade, followed by that grade's
  // Average, in the same grade-by-grade sequence as the original sheet.
  const columns = [
    "Grade 3 - Language",
    "Grade 3 - Mathematics",
    "Grade 3 - Average",
    "Grade 6 - Language",
    "Grade 6 - Mathematics",
    "Grade 6 - The World Around Us",
    "Grade 6 - Average",
    "Grade 9 - Language",
    "Grade 9 - Mathematics",
    "Grade 9 - Science",
    "Grade 9 - Social Science",
    "Grade 9 - Average",
  ].filter((c) => base.columns.includes(c) || c.endsWith("Average"));

  return { columns, data };

};

// Section 3: Boys vs Girls (rows 77-110)
export const getGenderComparison = (workbook) =>
  getParakhSection(workbook, 77, 110);

// Section 4: Rural vs Urban (rows 113-146)
export const getLocationComparison = (workbook) =>
  getParakhSection(workbook, 113, 146);

// Section 5: School Management Type (rows 149-182)
export const getManagementComparison = (workbook) =>
  getParakhSection(workbook, 149, 182);

// Section 6: Social Group (rows 185-218)
export const getSocialGroupComparison = (workbook) =>
  getParakhSection(workbook, 185, 218);

// Section 7: Contextual Variables Summary (rows 221-226)
export const getContextualSummary = (workbook) =>
  getParakhSection(workbook, 221, 226);

// -----------------------------
// District Deep-Dive: builds a { districtName -> columnIndex } map from a
// sheet's header row, skipping summary/instruction columns.
// -----------------------------

const buildDistrictColumnMap = (headerRow = [], startCol = 0) => {

  const map = {};

  for (let c = startCol; c < headerRow.length; c++) {
    const name = headerRow[c];

    if (
      name &&
      typeof name === "string" &&
      name !== "State Avg (33 Districts)" &&
      name !== "District Avg" &&
      !name.startsWith("How to")
    ) {
      map[name] = c;
    }
  }

  return map;

};

// -----------------------------
// District Deep-Dive: Full PGI-D 2.0 indicator breakdown (69 raw
// indicators + domain/category subtotals + overall score) for ONE district,
// straight from "District_PGI-D_600".
// -----------------------------

export const getDistrictPGIIndicators = (workbook, districtName) => {

  const worksheet = workbook.Sheets["District_PGI-D_600"];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const header = rows[2] || []; // Excel row 3
  const colMap = buildDistrictColumnMap(header, 6);
  const col = colMap[districtName];

  if (col === undefined) {
    return { indicators: [], domainSummary: [], overall: null };
  }

  // Excel rows 4-73 (0-indexed 3-72): the 69 raw indicators
  const indicators = rows
    .slice(3, 73)
    .filter((r) => r[3] && typeof r[3] === "string")
    .map((r) => ({
      category: String(r[0] || "").trim(),
      domain: String(r[1] || "").trim(),
      indNo: String(r[2] || "").trim(),
      indicator: String(r[3] || "").replace(/\s+/g, " ").trim(),
      weight: Number(r[5]) || 0,
      score: Number(r[col]) || 0,
    }));

  // Excel rows 77-91 (0-indexed 76-90): domain + category subtotals
  const domainSummary = rows
    .slice(76, 91)
    .filter((r) => r[0])
    .map((r) => ({
      label: String(r[0]).trim(),
      isCategoryTotal: String(r[0]).includes("TOTAL"),
      maxWeight: Number(r[5]) || 0,
      score: Number(r[col]) || 0,
    }));

  // Excel rows 92-94 (0-indexed 91-93): overall score / % achieved / grade
  const overallRow = rows[91] || [];
  const percentRow = rows[92] || [];
  const gradeRow = rows[93] || [];

  const overall = {
    score: Number(overallRow[col]) || 0,
    maxWeight: Number(overallRow[5]) || 600,
    percentAchieved: Number(percentRow[col]) || 0,
    grade: gradeRow[col] || "",
  };

  return { indicators, domainSummary, overall };

};

// -----------------------------
// District Deep-Dive: Competency-level PARAKH mastery for ONE district,
// from any of the 3 stage sheets ("PARAKH_Foundational_G3",
// "PARAKH_Preparatory_G6", "PARAKH_Middle_G9").
// -----------------------------

export const getDistrictCompetencies = (workbook, sheetName, districtName) => {

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const header = rows[2] || []; // Excel row 3
  const colMap = buildDistrictColumnMap(header, 4);
  const col = colMap[districtName];

  if (col === undefined) {
    return [];
  }

  let lastSubject = "";

  // Excel row 4 onward (0-indexed 3+): one row per competency
  return rows
    .slice(3)
    .filter((r) => r[2] && typeof r[2] === "string")
    .map((r) => {
      const subject = r[0] || lastSubject;
      if (r[0]) lastSubject = r[0];

      return {
        subject,
        code: String(r[1] || "").trim(),
        description: String(r[2] || "").replace(/\s+/g, " ").trim(),
        national: Number(r[3]) || 0,
        district: Number(r[col]) || 0,
      };
    });

};

// -----------------------------
// PM Shri Schools Data (GOI + GOG schools, enrolment, teachers by district)
// -----------------------------

export const getPMShriData = (workbook) => {

  const worksheet = workbook.Sheets["PM-SHRI DATA"];

  if (!worksheet) {
    return { districts: [], stateTotal: null };
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Detect rows by content rather than a fixed row/column offset: this
  // sheet's used range starts at column B, row 2 (not A1 like most other
  // sheets), so a hardcoded slice()/column-index here previously read the
  // wrong cells entirely and returned an empty district list. A real
  // district row always has a numeric Sr No in the first column and the
  // district name (a string) in the second.
  const districts = rows
    .filter((r) => typeof r[0] === "number" && r[1] && typeof r[1] === "string")
    .map((r) => ({
      srNo: r[0],
      district: String(r[1]).trim(),
      goiSchools: Number(r[2]) || 0,
      goiEnrollment: Number(r[3]) || 0,
      goiTeachers: Number(r[4]) || 0,
      gogSchools: Number(r[5]) || 0,
      gogEnrollment: Number(r[6]) || 0,
      gogTeachers: Number(r[7]) || 0,
      totalSchools: Number(r[8]) || 0,
      totalEnrollment: Number(r[9]) || 0,
      totalTeachers: Number(r[10]) || 0,
    }));

  // The State Total row has "State" (a string) in the same first column
  // that holds a number for every district row.
  const stateRow = rows.find(
    (r) => typeof r[0] === "string" && r[0].trim().toLowerCase() === "state"
  );

  const stateTotal = stateRow
    ? {
        goiSchools: Number(stateRow[2]) || 0,
        goiEnrollment: Number(stateRow[3]) || 0,
        goiTeachers: Number(stateRow[4]) || 0,
        gogSchools: Number(stateRow[5]) || 0,
        gogEnrollment: Number(stateRow[6]) || 0,
        gogTeachers: Number(stateRow[7]) || 0,
        totalSchools: Number(stateRow[8]) || 0,
        totalEnrollment: Number(stateRow[9]) || 0,
        totalTeachers: Number(stateRow[10]) || 0,
      }
    : null;

  return { districts, stateTotal };

};

// -----------------------------
// PGI-focused Action Queue (weakest PGI-D category per priority district)
// — used on the PGI 2.0 page.
// -----------------------------

const buildPGIDistrictAction = (districtName, combined, heatmap) => {
  return buildDistrictAction(districtName, combined, heatmap);
};

export const getPGIActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);
  const heatmap = getPGICategoryHeatmap(workbook);

  const items = PRIORITY_DISTRICTS
    .map((districtName) => {
      const item = buildPGIDistrictAction(districtName, combined, heatmap);
      if (!item) return null;
      return {
        ...item,
        icon: "🏛️",
        title: `${districtName} — PGI-D 2.0 Focus`,
      };
    })
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

// -----------------------------
// PARAKH-focused Action Queue (weakest grade-band + weakest subject per
// priority district) — used on the PARAKH page and Dashboard.
// -----------------------------

const PARAKH_SUBJECT_RECOMMENDATIONS = {
  Language: "Run structured reading-comprehension drills three times a week and set up a library reading-hour programme so every child reads independently, not just aloud in class. Track individual reading levels each month and regroup students by level rather than by grade alone for remedial sessions.",
  Mathematics: "Focus on foundational numeracy first — daily math-lab practice with concrete manipulatives, followed by peer tutoring for students still struggling with basic operations. Diagnose exactly which foundational skill (number sense, place value, operations) is missing before assigning grade-level worksheets.",
  "The World Around Us": "Use activity-based EVS teaching — local field visits, simple demonstrations, and hands-on observation — instead of textbook reading alone. Link every unit to something students can see or do in their own village or neighbourhood to make the concepts stick.",
  Science: "Strengthen lab-based experiential learning and run concept-clarity remedial sessions for topics with the lowest scores. Prioritize hands-on experiments over rote definitions, and re-test the same concept a few weeks later to confirm the gap has actually closed.",
  "Social Science": "Use map-work, project-based learning, and current-affairs discussion circles to make the subject less textbook-dependent. Assign small group projects tied to local history or geography so students engage with the content actively rather than memorizing it.",
};

const buildPARAKHDistrictAction = (districtName, parakhData, subjectHeatmap) => {

  const row = parakhData.find((d) => d.District === districtName);
  if (!row) return null;

  const stages = [
    { label: "Foundational (G3)", value: row.Foundational },
    { label: "Preparatory (G6)", value: row.Preparatory },
    { label: "Middle (G9)", value: row.Middle },
  ];
  const weakestStage = [...stages].sort((a, b) => a.value - b.value)[0];

  const subjRow = subjectHeatmap.data.find((d) => d.District === districtName);
  let weakestSubjectCol = null;
  let weakestSubjectPct = 101;

  if (subjRow) {
    subjectHeatmap.columns
      .filter((c) => !c.endsWith("Average"))
      .forEach((col) => {
        const pct = (subjRow[col] || 0) * 100;
        if (pct < weakestSubjectPct) {
          weakestSubjectPct = pct;
          weakestSubjectCol = col;
        }
      });
  }

  const subjectName = weakestSubjectCol ? weakestSubjectCol.split(" - ")[1] : null;

  const priority =
    row.Overall < 0.4 ? "CRITICAL" : row.Overall < 0.46 ? "HIGH" : "MEDIUM";

  return {
    priority,
    icon: "📚",
    title: `${districtName} — PARAKH Focus`,
    description: `Overall PARAKH Mastery ${(row.Overall * 100).toFixed(1)}% · Weakest stage: ${weakestStage.label} (${(weakestStage.value * 100).toFixed(1)}%)${
      weakestSubjectCol ? ` · Weakest subject: ${weakestSubjectCol} (${weakestSubjectPct.toFixed(0)}%)` : ""
    }`,
    recommendation: subjectName ? PARAKH_SUBJECT_RECOMMENDATIONS[subjectName] : null,
    district: districtName,
  };

};

export const getPARAKHActionItems = (workbook) => {

  const parakhData = getSheetData(workbook, "Dashboard_PARAKH");
  const subjectHeatmap = getSubjectHeatmap(workbook);

  const items = PRIORITY_DISTRICTS
    .map((districtName) => buildPARAKHDistrictAction(districtName, parakhData, subjectHeatmap))
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

// -----------------------------
// Comparison-focused Action Queue (which lever — PGI-D governance or
// PARAKH learning outcomes — is the weaker one per priority district) —
// used on the Comparison page.
// -----------------------------

const buildComparisonDistrictAction = (districtName, combined) => {
  const row = combined.districts.find((d) => d.District === districtName);
  if (!row) return null;

  const gap = row.PGIDScore - row.PARAKHScore;
  const weakerSide = gap >= 0 ? "PARAKH Learning Outcomes" : "PGI-D Governance";

  const priority = row.Band?.startsWith("Low")
    ? "CRITICAL"
    : row.Band?.startsWith("Needs")
    ? "HIGH"
    : "MEDIUM";

  return {
    priority,
    icon: "⚖️",
    title: `${districtName} — Composite Priority`,
    description: `Composite ${row.CompositeScore.toFixed(1)}% (Rank ${row.Rank}/33) · PGI-D ${row.PGIDScore.toFixed(1)}% vs PARAKH ${row.PARAKHScore.toFixed(1)}% · Gap: ${Math.abs(gap).toFixed(1)} pts`,
    recommendation: `${weakerSide} is the weaker lever here — prioritize resources toward closing that gap before the other, since pushing further on the already-stronger side gives diminishing returns. Re-check this comparison after the next assessment cycle to confirm the gap is actually narrowing, not just shifting.`,
    district: districtName,
  };
};

export const getComparisonActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);

  const items = PRIORITY_DISTRICTS
    .map((districtName) => buildComparisonDistrictAction(districtName, combined))
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

// -----------------------------
// PM Shri-focused Action Queue (lowest PM Shri school/enrolment coverage
// among priority districts) — used on the PM Shri page.
// -----------------------------

const buildPMShriDistrictAction = (canonicalName, byDistrict) => {

  const upper = canonicalName.toUpperCase();
  const row =
    byDistrict[canonicalName] ||
    Object.values(byDistrict).find((d) => d.district.toUpperCase() === upper.replace(/\s+/g, ""));

  if (!row) return null;

  const priority = row.totalSchools <= 5 ? "CRITICAL" : row.totalSchools <= 10 ? "HIGH" : "MEDIUM";

  return {
    priority,
    icon: "🏫",
    title: `${canonicalName} — PM Shri Coverage`,
    description: `${row.totalSchools} PM Shri schools (${row.goiSchools} GOI + ${row.gogSchools} GOG) · ${row.totalEnrollment.toLocaleString()} students enrolled`,
    recommendation: "Assess eligibility for additional PM Shri school upgrades to expand model-school coverage in this district, prioritizing clusters that currently have zero or only one PM Shri school nearby. Cross-check enrolment trends before proposing new sites, so upgrades go where student demand actually supports them.",
    district: canonicalName,
  };

};

export const getPMShriActionItems = (workbook) => {

  const { districts } = getPMShriData(workbook);
  const byDistrict = Object.fromEntries(districts.map((d) => [d.district, d]));

  const items = PRIORITY_DISTRICTS
    .map((canonicalName) => buildPMShriDistrictAction(canonicalName, byDistrict))
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

export const getAllDistrictPMShriActionItems = (workbook) => {

  const { districts } = getPMShriData(workbook);
  const byDistrict = Object.fromEntries(districts.map((d) => [d.district, d]));
  const allNames = getCombinedRanking(workbook).districts.map((d) => d.District);

  return allNames
    .map((canonicalName) => buildPMShriDistrictAction(canonicalName, byDistrict))
    .filter(Boolean);

};

// -----------------------------
// Priority District Action Queue — one action item PER priority district
// (the 11 Aspirational Districts), showing its Composite Score/Rank/Band
// plus its single weakest PGI-D category, so each card tells you exactly
// where to focus for that district. getActionItemForDistrict works the
// same way for ANY of the 33 districts (used by the district dropdown in
// the Action Items detail view). This general version is used on
// Dashboard and Reports, which show both PARAKH and PGI content.
// -----------------------------

const PGI_CATEGORY_MAX = {
  "Outcomes (/290)": 290,
  "Classroom Transaction (/90)": 90,
  "Infrastructure (/51)": 51,
  "Safety & Protection (/35)": 35,
  "Digital Learning (/50)": 50,
  "Governance (/84)": 84,
};

const PGI_CATEGORY_RECOMMENDATIONS = {
  "Outcomes (/290)": "Strengthen remedial teaching for students below grade-level, and set up monthly learning-outcome monitoring linked directly to PARAKH indicators. Pair the weakest schools with a subject-specific coaching cycle and track FLN progress every term rather than only at the annual assessment.",
  "Classroom Transaction (/90)": "Run structured classroom-observation audits at least once a term, followed by targeted teacher-coaching cycles on the gaps found. Share observation feedback within a week so teachers can adjust lesson delivery before the next cycle, and track repeat-visit improvement.",
  "Infrastructure (/51)": "Prioritize infrastructure grants for the most basic gaps first — functional drinking water, separate toilets, boundary walls, and ramps for accessibility. Audit every school in the district against these four essentials and fast-track funding for schools missing more than one.",
  "Safety & Protection (/35)": "Review child-safety protocols school-by-school and strengthen the grievance-redressal mechanism so complaints are logged, tracked, and closed within a fixed timeline. Run refresher training for staff on POCSO compliance and safe-school committee functioning.",
  "Digital Learning (/50)": "Expand digital-device access in phases, starting with schools that currently have zero working devices, and pair every device rollout with mandatory teacher ICT training. Track actual classroom usage, not just device counts, to confirm the investment is translating into learning.",
  "Governance (/84)": "Improve data-reporting timelines by setting a fixed monthly submission deadline and following up directly with schools that consistently miss it. Increase school-monitoring visit frequency for the lowest-reporting clusters and use the visit findings to course-correct before the next cycle.",
};

const levelForBand = (band = "") => {
  if (band.startsWith("Low")) return "CRITICAL";
  if (band.startsWith("Needs")) return "HIGH";
  return "MEDIUM";
};

const buildDistrictAction = (districtName, combined, heatmap) => {

  const row = combined.districts.find((d) => d.District === districtName);
  if (!row) return null;

  const heatRow = heatmap.data.find((d) => d.District === districtName);

  let weakestCategory = null;
  let weakestPct = 101;

  if (heatRow) {
    heatmap.categories.forEach((cat) => {
      const max = PGI_CATEGORY_MAX[cat] || 100;
      const pct = max ? ((heatRow[cat] || 0) / max) * 100 : 0;
      if (pct < weakestPct) {
        weakestPct = pct;
        weakestCategory = cat;
      }
    });
  }

  return {
    priority: levelForBand(row.Band),
    icon: "📍",
    title: `${districtName} — Priority District Action Plan`,
    description: `Composite Score ${row.CompositeScore.toFixed(1)}% · Rank ${row.Rank}/33 · ${row.Band}${
      weakestCategory ? ` · Weakest area: ${weakestCategory} (${weakestPct.toFixed(0)}%)` : ""
    }`,
    recommendation: weakestCategory ? PGI_CATEGORY_RECOMMENDATIONS[weakestCategory] : null,
    district: districtName,
    compositeScore: row.CompositeScore,
    rank: row.Rank,
    band: row.Band,
    weakestCategory,
    weakestPct,
  };

};

export const getPriorityActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);
  const heatmap = getPGICategoryHeatmap(workbook);

  const items = PRIORITY_DISTRICTS
    .map((districtName) => buildDistrictAction(districtName, combined, heatmap))
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };

  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

// Works for ANY of the 33 districts (not just the 11 priority ones) —
// used when someone picks a specific district from the Action Items
// detail dropdown.
export const getActionItemForDistrict = (workbook, districtName) => {

  const combined = getCombinedRanking(workbook);
  const heatmap = getPGICategoryHeatmap(workbook);

  return buildDistrictAction(districtName, combined, heatmap);

};

export const getAllDistrictNames = (workbook) => {

  const combined = getCombinedRanking(workbook);

  return combined.districts.map((d) => d.District).sort();

};

// All 33 districts (not just the 11 priority ones) — used to populate the
// "View detail for..." dropdown in the Action Items Queue, and to look up
// a specific district's recommendation without a separate Excel read.
export const getAllDistrictActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);
  const heatmap = getPGICategoryHeatmap(workbook);

  return combined.districts
    .map((d) => buildDistrictAction(d.District, combined, heatmap))
    .filter(Boolean);

};

// Topic-specific "all 33 districts" variants, so the district dropdown on
// the PARAKH / PGI / Comparison pages shows a recommendation matching
// that page's own subject matter, not the generic PGI-category one above.

export const getAllDistrictPARAKHActionItems = (workbook) => {

  const parakhData = getSheetData(workbook, "Dashboard_PARAKH");
  const subjectHeatmap = getSubjectHeatmap(workbook);

  return parakhData
    .map((d) => buildPARAKHDistrictAction(d.District, parakhData, subjectHeatmap))
    .filter(Boolean);

};

export const getAllDistrictPGIActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);
  const heatmap = getPGICategoryHeatmap(workbook);

  return combined.districts
    .map((d) => {
      const item = buildPGIDistrictAction(d.District, combined, heatmap);
      if (!item) return null;
      return { ...item, icon: "🏛️", title: `${d.District} — PGI-D 2.0 Focus` };
    })
    .filter(Boolean);

};

export const getAllDistrictComparisonActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);

  return combined.districts
    .map((d) => buildComparisonDistrictAction(d.District, combined))
    .filter(Boolean);

};

export const getActionItems = (workbook) => {

  const combined = getCombinedRanking(workbook);
  const pgiSummary = getStatePGISummary(workbook);
  const parakhData = getSheetData(workbook, "Dashboard_PARAKH");
  const gender = getGenderComparison(workbook);
  const location = getLocationComparison(workbook);

  const items = [];

  // 1) The 2 lowest Composite-Score districts -> Critical
  const byComposite = [...combined.districts].sort(
    (a, b) => a.CompositeScore - b.CompositeScore
  );

  byComposite.slice(0, 2).forEach((d) => {
    items.push({
      priority: "CRITICAL",
      icon: "🚨",
      title: `${d.District} — Urgent Intervention Needed`,
      description: `Composite Score ${d.CompositeScore.toFixed(1)}% · ${d.Band} · Ranked ${d.Rank} of 33 districts`,
      owner: "DPEO + SPD",
    });
  });

  // 2) Weakest PGI 2.0 domain statewide -> High
  const weakestDomain = [...pgiSummary.domains].sort(
    (a, b) => a.percentAchieved - b.percentAchieved
  )[0];

  if (weakestDomain) {
    items.push({
      priority: "HIGH",
      icon: "🏛️",
      title: `Strengthen "${weakestDomain.domain}" Statewide`,
      description: `State average is only ${weakestDomain.percentAchieved.toFixed(1)}% achieved — the weakest of all 6 PGI 2.0 domains`,
      owner: "State Education Department",
    });
  }

  // 3) Weakest PARAKH grade-band statewide -> High
  const stageAverages = ["Foundational", "Preparatory", "Middle"].map((stage) => {
    const vals = parakhData.map((d) => d[stage]).filter((v) => !isNaN(v));
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { stage, avg };
  });

  const weakestStage = [...stageAverages].sort((a, b) => a.avg - b.avg)[0];

  if (weakestStage) {
    items.push({
      priority: "HIGH",
      icon: "📖",
      title: `${weakestStage.stage} Learning Outcomes Need Focus`,
      description: `State average of ${(weakestStage.avg * 100).toFixed(1)}% is the weakest of the three grade bands`,
      owner: "DIET + DPEO",
    });
  }

  // 4) Widest Boys-Girls gap district -> Medium
  const genderGapCol = gender.columns.find((c) => c.toLowerCase().includes("gap"));

  if (genderGapCol) {
    const widestGenderGap = [...gender.data].sort(
      (a, b) => Math.abs(b[genderGapCol]) - Math.abs(a[genderGapCol])
    )[0];

    if (widestGenderGap) {
      items.push({
        priority: "MEDIUM",
        icon: "🚻",
        title: `Address Gender Gap in ${widestGenderGap.District}`,
        description: `Boys-Girls performance gap of ${(widestGenderGap[genderGapCol] * 100).toFixed(1)} percentage points — the widest in the state`,
        owner: "DPEO + BRCs",
      });
    }
  }

  // 5) Widest Rural-Urban gap district -> Medium
  const locationGapCol = location.columns.find((c) => c.toLowerCase().includes("gap"));

  if (locationGapCol) {
    const widestLocationGap = [...location.data].sort(
      (a, b) => Math.abs(b[locationGapCol]) - Math.abs(a[locationGapCol])
    )[0];

    if (widestLocationGap) {
      items.push({
        priority: "MEDIUM",
        icon: "🏘️",
        title: `Bridge Rural-Urban Gap in ${widestLocationGap.District}`,
        description: `Rural-Urban performance gap of ${(widestLocationGap[locationGapCol] * 100).toFixed(1)} percentage points`,
        owner: "DPEO + DEO",
      });
    }
  }

  // 6) Next 2 lowest Composite-Score districts -> Medium (rounds out the queue)
  byComposite.slice(2, 4).forEach((d) => {
    items.push({
      priority: "MEDIUM",
      icon: "📉",
      title: `${d.District} — Monitor & Support`,
      description: `Composite Score ${d.CompositeScore.toFixed(1)}% · ${d.Band} · Ranked ${d.Rank} of 33 districts`,
      owner: "DPEO",
    });
  });

  return items;

};

// -----------------------------
// Combined Performance Ranking (PGI-D + PARAKH Composite Score)
// -----------------------------

export const getCombinedRanking = (workbook) => {

  const worksheet = workbook.Sheets["Combined_Performance_Ranking"];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Row 3: Weight: PGI-D | value | Weight: PARAKH | value
  const weightRow = rows[2] || [];

  const weights = {
    pgid: Number(weightRow[1]) || 0.5,
    parakh: Number(weightRow[3]) || 0.5,
  };

  // Rows 6-38: District, PGI-D Score(%), PGI-D Grade, PARAKH Overall Mastery(%),
  // Composite Score(%), Performance Band, Rank, Priority Note
  const districts = rows
    .slice(5, 38)
    .filter((r) => r[0] && typeof r[0] === "string")
    .map((r) => ({
      District: r[0],
      PGIDScore: Number(r[1]) || 0,
      PGIDGrade: r[2] || "",
      PARAKHScore: Number(r[3]) || 0,
      CompositeScore: Number(r[4]) || 0,
      Band: r[5] || "",
      Rank: Number(r[6]) || 0,
      PriorityNote: r[7] || "",
    }))
    .sort((a, b) => a.Rank - b.Rank);

  // Rows 41-45: Performance Band summary counts
  const bandSummary = rows
    .slice(40, 45)
    .filter((r) => r[0])
    .map((r) => ({
      band: r[0],
      count: Number(r[1]) || 0,
    }));

  return { weights, districts, bandSummary };

};

// -----------------------------
// SAT (Student Assessment Test) — District-wise Ranking
// (from "SAT District Wise": District | Total Marks | Obtained Marks | %)
// -----------------------------

export const getSATDistrictRanking = (workbook) => {

  const worksheet = workbook.Sheets["SAT District Wise"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Filter by content rather than a fixed row offset: this sheet's used
  // range starts at row 2 (no leading blank title row like most of the
  // other sheets), so a hardcoded slice() here previously dropped the
  // first district (Ahmedabad) — 33 came out as 32.
  return rows
    .filter(
      (r) =>
        r[0] &&
        typeof r[0] === "string" &&
        r[0].trim() !== "District" &&
        !isSATSummaryRow(r[0])
    )
    .map((r) => ({
      District: normalizeSATDistrict(r[0]),
      TotalMarks: Number(r[1]) || 0,
      ObtainedMarks: Number(r[2]) || 0,
      PercentAchieved: (Number(r[3]) || 0) * 100,
    }))
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
    .map((d, index) => ({ ...d, Rank: index + 1 }));

};

// -----------------------------
// SAT — Grade-wise breakdown per district
// (from "SAT District Grade wise": District | GRADE | Total | Obtained | %)
// Returns { grades: [...], data: [{ District, "Class 3": pct, ... }] }
// -----------------------------

const SAT_GRADE_ORDER = [
  "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
];

export const getSATGradeWise = (workbook) => {

  const worksheet = workbook.Sheets["SAT District Grade wise"];
  if (!worksheet) return { grades: [], data: [] };

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const byDistrict = {};
  const gradesSeen = new Set();

  rows.slice(1).forEach((r) => {
    if (!r[0] || typeof r[0] !== "string" || isSATSummaryRow(r[0])) return;

    const district = normalizeSATDistrict(r[0]);
    const grade = r[1];
    const pct = (Number(r[4]) || 0) * 100;

    if (!grade || typeof grade !== "string") return;

    gradesSeen.add(grade);

    if (!byDistrict[district]) byDistrict[district] = { District: district };
    byDistrict[district][grade] = pct;
  });

  const grades = SAT_GRADE_ORDER.filter((g) => gradesSeen.has(g));

  return { grades, data: Object.values(byDistrict) };

};

// -----------------------------
// SAT — Subject-wise performance, aggregated state-wide across all
// districts & grades (from "SAT District Grade Subject wise")
// -----------------------------

export const getSATSubjectWise = (workbook) => {

  const worksheet = workbook.Sheets["SAT District Grade Subject wise"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const totals = {};

  rows.slice(1).forEach((r) => {
    const district = r[0];
    const subject = r[2];
    const totalMarks = Number(r[3]) || 0;
    const obtainedMarks = Number(r[4]) || 0;

    // Skip blank rows, the Grand Total row, and the per-grade subtotal
    // rows (these have an empty SUBJECT_ENG column, e.g. "Class 3 Total").
    if (!district || isSATSummaryRow(district)) return;
    if (!subject || typeof subject !== "string") return;

    if (!totals[subject]) totals[subject] = { totalMarks: 0, obtainedMarks: 0 };
    totals[subject].totalMarks += totalMarks;
    totals[subject].obtainedMarks += obtainedMarks;
  });

  return Object.entries(totals)
    .map(([subject, t]) => ({
      subject,
      PercentAchieved: t.totalMarks ? (t.obtainedMarks / t.totalMarks) * 100 : 0,
    }))
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved);

};

// -----------------------------
// SAT — State-level summary (overall average, grade-wise averages,
// weakest Learning Outcomes) — used for the SAT overview card on
// the Dashboard.
// -----------------------------

export const getSATStateSummary = (workbook) => {

  const ranking = getSATDistrictRanking(workbook);
  const gradeWise = getSATGradeWise(workbook);

  const stateAverage = ranking.length
    ? ranking.reduce((sum, d) => sum + d.PercentAchieved, 0) / ranking.length
    : 0;

  const totalObtained = ranking.reduce((sum, d) => sum + d.ObtainedMarks, 0);
  const totalMarks = ranking.reduce((sum, d) => sum + d.TotalMarks, 0);

  const gradeAverages = gradeWise.grades.map((grade) => {
    const values = gradeWise.data
      .map((d) => d[grade])
      .filter((v) => typeof v === "number");
    const average = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    return { grade, average };
  });

  return {
    stateAverage,
    totalDistricts: ranking.length,
    totalMarks,
    totalObtained,
    gradeAverages,
  };

};

// -----------------------------
// SAT — weakest Learning Outcomes state-wide (from
// "SAT District Grade Sub Lo Wise"), used to power a SAT-focused
// action-item view. Aggregates every LO across all districts & grades,
// then returns the lowest-scoring ones.
// -----------------------------

export const getSATWeakestLOs = (workbook, limit = 10) => {

  const worksheet = workbook.Sheets["SAT District Grade Sub Lo Wise"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const totals = {};

  rows.slice(1).forEach((r) => {
    const district = r[0];
    const subject = r[2];
    const loCode = r[3];
    const indicator = r[4];
    const totalMarks = Number(r[5]) || 0;
    const obtainedMarks = Number(r[6]) || 0;

    if (!district || isSATSummaryRow(district)) return;
    if (!loCode || typeof loCode !== "string") return;

    const key = `${subject}__${loCode}`;

    if (!totals[key]) {
      totals[key] = { subject, loCode, indicator, totalMarks: 0, obtainedMarks: 0 };
    }
    totals[key].totalMarks += totalMarks;
    totals[key].obtainedMarks += obtainedMarks;
  });

  return Object.values(totals)
    .map((t) => ({
      ...t,
      PercentAchieved: t.totalMarks ? (t.obtainedMarks / t.totalMarks) * 100 : 0,
    }))
    .sort((a, b) => a.PercentAchieved - b.PercentAchieved)
    .slice(0, limit);

};

// -----------------------------
// SAT — Subject-wise performance PER DISTRICT (aggregated across all
// grades for that district) — used to find each district's weakest
// subject for the SAT Action Items.
// -----------------------------

export const getSATDistrictSubjectWise = (workbook) => {

  const worksheet = workbook.Sheets["SAT District Grade Subject wise"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const totals = {};

  rows.slice(1).forEach((r) => {
    const district = r[0];
    const subject = r[2];
    const totalMarks = Number(r[3]) || 0;
    const obtainedMarks = Number(r[4]) || 0;

    if (!district || isSATSummaryRow(district)) return;
    if (!subject || typeof subject !== "string") return;

    const normalizedDistrict = normalizeSATDistrict(district);
    const key = `${normalizedDistrict}__${subject}`;

    if (!totals[key]) {
      totals[key] = { District: normalizedDistrict, subject, totalMarks: 0, obtainedMarks: 0 };
    }
    totals[key].totalMarks += totalMarks;
    totals[key].obtainedMarks += obtainedMarks;
  });

  return Object.values(totals).map((t) => ({
    District: t.District,
    subject: t.subject,
    PercentAchieved: t.totalMarks ? (t.obtainedMarks / t.totalMarks) * 100 : 0,
  }));

};

// -----------------------------
// SAT — District x Subject heat-map (wide format), built on top of
// getSATDistrictSubjectWise. Returns { subjects: [...], data: [{
// District, [subject]: pct, ... }] } — same shape pattern as
// getSATGradeWise, ready for a heat-map table.
// -----------------------------

const SAT_SUBJECT_ORDER = [
  "GUJARATI 1st lng (Gujarati Medium)",
  "HINDI 2nd lng (Gujarati Medium)",
  "ENGLISH 2nd lng (Gujarati Medium)",
  "MATHS",
  "EVS",
  "SCIENCE",
  "SOCIAL SCIENCE",
  "Sanskrit",
];

export const getSATSubjectHeatmap = (workbook) => {

  const rows = getSATDistrictSubjectWise(workbook);

  const byDistrict = {};
  const subjectsSeen = new Set();

  rows.forEach((r) => {
    subjectsSeen.add(r.subject);
    if (!byDistrict[r.District]) byDistrict[r.District] = { District: r.District };
    byDistrict[r.District][r.subject] = r.PercentAchieved;
  });

  const subjects = [
    ...SAT_SUBJECT_ORDER.filter((s) => subjectsSeen.has(s)),
    ...[...subjectsSeen].filter((s) => !SAT_SUBJECT_ORDER.includes(s)),
  ];

  return { subjects, data: Object.values(byDistrict) };

};

// -----------------------------
// SAT Action Items — priority queue (11 priority districts) + full
// 33-district detail view, mirroring the PGI / PARAKH Action Items
// pattern. Flags each district's overall SAT score band and its
// single weakest subject, with a matching remedial recommendation.
// -----------------------------

const SAT_SUBJECT_RECOMMENDATIONS = {
  "GUJARATI 1st lng (Gujarati Medium)": "Run structured reading-comprehension drills and daily guided reading practice, grouping students by current reading level rather than grade. Revisit the specific Learning Outcomes where SAT scores were lowest and re-test after 4-6 weeks of focused practice.",
  "ENGLISH 2nd lng (Gujarati Medium)": "Introduce daily vocabulary-building activities and simple spoken-English practice sessions, starting with words students already encounter around them. Keep grammar drills short and frequent rather than long and infrequent — little and often builds retention faster.",
  "HINDI 2nd lng (Gujarati Medium)": "Use reading-aloud and dictation practice to strengthen Hindi language basics, and set aside 10-15 minutes daily purely for oral practice before moving to writing. Focus first on the Learning Outcomes with the lowest SAT scores rather than spreading effort evenly.",
  MATHS: "Focus on foundational numeracy first — daily math-lab practice with concrete materials, followed by peer tutoring on the specific weak Learning Outcomes flagged in the SAT data. Diagnose whether the gap is conceptual or procedural before assigning more worksheets.",
  EVS: "Use activity-based EVS teaching — local field visits and hands-on demonstrations — rather than textbook-only instruction. Tie each topic to something observable in the student's own surroundings so the concept is easier to recall during assessment.",
  SCIENCE: "Strengthen lab-based experiential learning and run concept-clarity remedial sessions targeted at the specific topics where SAT scores were weakest. Re-test the same concept a few weeks later to confirm the remedial session actually closed the gap.",
  "SOCIAL SCIENCE": "Use map-work, project-based learning, and current-affairs discussion circles to make the subject more engaging and less rote. Assign small local-history or civics projects so students apply the concepts instead of just memorizing them for the test.",
  Sanskrit: "Add daily shloka recitation and basic-grammar practice sessions to build fluency gradually. Keep sessions short and consistent — 10 minutes a day outperforms one long weekly session for language retention.",
};

const buildSATDistrictAction = (districtName, satRanking, satDistrictSubject) => {

  const row = satRanking.find((d) => d.District === districtName);
  if (!row) return null;

  const subjectRows = satDistrictSubject.filter((s) => s.District === districtName);
  const weakestSubject = subjectRows.length
    ? [...subjectRows].sort((a, b) => a.PercentAchieved - b.PercentAchieved)[0]
    : null;

  const priority =
    row.PercentAchieved < 45 ? "CRITICAL" : row.PercentAchieved < 55 ? "HIGH" : "MEDIUM";

  return {
    priority,
    icon: "📝",
    title: `${districtName} — SAT Focus`,
    description: `SAT Overall Score ${row.PercentAchieved.toFixed(1)}% (Rank ${row.Rank}/${satRanking.length})${
      weakestSubject
        ? ` · Weakest subject: ${weakestSubject.subject} (${weakestSubject.PercentAchieved.toFixed(0)}%)`
        : ""
    }`,
    recommendation: weakestSubject
      ? SAT_SUBJECT_RECOMMENDATIONS[weakestSubject.subject] ||
        "Run targeted remedial sessions focused on this district's weakest Learning Outcomes."
      : null,
    district: districtName,
  };

};

export const getSATActionItems = (workbook) => {

  const satRanking = getSATDistrictRanking(workbook);
  const satDistrictSubject = getSATDistrictSubjectWise(workbook);

  const items = PRIORITY_DISTRICTS
    .map((districtName) => buildSATDistrictAction(districtName, satRanking, satDistrictSubject))
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

// All 33 districts — used to populate the "View detail for..." dropdown
// in the SAT page's Action Items Queue.
export const getAllDistrictSATActionItems = (workbook) => {

  const satRanking = getSATDistrictRanking(workbook);
  const satDistrictSubject = getSATDistrictSubjectWise(workbook);

  return satRanking
    .map((d) => buildSATDistrictAction(d.District, satRanking, satDistrictSubject))
    .filter(Boolean);

};

// -----------------------------
// SAT Semester 1 — District-wise Ranking (from the separate Semester 1
// workbook, sheet "District Wise": District | TotalMarks | ObtainedMarks | %)
// -----------------------------

export const getSATSem1DistrictRanking = (sem1Workbook) => {

  const worksheet = sem1Workbook?.Sheets?.["District Wise"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  return rows
    .filter(
      (r) =>
        r[0] &&
        typeof r[0] === "string" &&
        r[0].trim() !== "District" &&
        !isSATSummaryRow(r[0])
    )
    .map((r) => ({
      District: normalizeSATDistrict(r[0]),
      TotalMarks: Number(r[1]) || 0,
      ObtainedMarks: Number(r[2]) || 0,
      PercentAchieved: (Number(r[3]) || 0) * 100,
    }))
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
    .map((d, index) => ({ ...d, Rank: index + 1 }));

};

// -----------------------------
// SAT Semester 1 — Grade-wise breakdown per district (from sheet
// "District class": district | Class | TotalMarks | ObtainedMarks | %).
// Same shape as getSATGradeWise so the SAT page can swap between
// semesters without branching on shape.
// -----------------------------

export const getSATSem1GradeWise = (sem1Workbook) => {

  const worksheet = sem1Workbook?.Sheets?.["District class"];
  if (!worksheet) return { grades: [], data: [] };

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const byDistrict = {};
  const gradesSeen = new Set();

  rows.slice(1).forEach((r) => {
    const districtRaw = r[0];
    const classNum = r[1];

    if (!districtRaw || typeof districtRaw !== "string") return;
    if (isSATSummaryRow(districtRaw)) return;
    if (typeof classNum !== "number") return; // skips "<District> Total" rows

    const district = normalizeSATDistrict(districtRaw);
    const grade = `Class ${classNum}`;
    const pct = (Number(r[4]) || 0) * 100;

    gradesSeen.add(grade);

    if (!byDistrict[district]) byDistrict[district] = { District: district };
    byDistrict[district][grade] = pct;
  });

  const grades = SAT_GRADE_ORDER.filter((g) => gradesSeen.has(g));

  return { grades, data: Object.values(byDistrict) };

};

// -----------------------------
// SAT Semester 1 — Subject-wise performance PER DISTRICT (from sheet
// "District Class Sub": district | Class | Subject_Eng | TotalMarks |
// ObtainedMarks | %), aggregated across all grades for that district.
// Same shape as getSATDistrictSubjectWise.
// -----------------------------

export const getSATSem1DistrictSubjectWise = (sem1Workbook) => {

  const worksheet = sem1Workbook?.Sheets?.["District Class Sub"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const totals = {};

  rows.slice(1).forEach((r) => {
    const districtRaw = r[0];
    const classNum = r[1];
    const subject = r[2];
    const totalMarks = Number(r[3]) || 0;
    const obtainedMarks = Number(r[4]) || 0;

    if (!districtRaw || typeof districtRaw !== "string") return;
    if (isSATSummaryRow(districtRaw)) return;
    if (typeof classNum !== "number") return; // skips "<Class> Total" / "<District> Total" rows
    if (!subject || typeof subject !== "string") return;

    const district = normalizeSATDistrict(districtRaw);
    const key = `${district}__${subject}`;

    if (!totals[key]) {
      totals[key] = { District: district, subject, totalMarks: 0, obtainedMarks: 0 };
    }
    totals[key].totalMarks += totalMarks;
    totals[key].obtainedMarks += obtainedMarks;
  });

  return Object.values(totals).map((t) => ({
    District: t.District,
    subject: t.subject,
    PercentAchieved: t.totalMarks ? (t.obtainedMarks / t.totalMarks) * 100 : 0,
  }));

};

// -----------------------------
// SAT Semester 1 — Subject-wise performance, aggregated state-wide
// across all districts & grades. Same shape as getSATSubjectWise.
// -----------------------------

export const getSATSem1SubjectWise = (sem1Workbook) => {

  // Aggregate directly from the sheet for accurate state-wide totals
  // (summing marks, not averaging percentages).
  const worksheet = sem1Workbook?.Sheets?.["District Class Sub"];
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const subjectTotals = {};

  rows.slice(1).forEach((r) => {
    const districtRaw = r[0];
    const classNum = r[1];
    const subject = r[2];
    const totalMarks = Number(r[3]) || 0;
    const obtainedMarks = Number(r[4]) || 0;

    if (!districtRaw || typeof districtRaw !== "string") return;
    if (isSATSummaryRow(districtRaw)) return;
    if (typeof classNum !== "number") return;
    if (!subject || typeof subject !== "string") return;

    if (!subjectTotals[subject]) subjectTotals[subject] = { totalMarks: 0, obtainedMarks: 0 };
    subjectTotals[subject].totalMarks += totalMarks;
    subjectTotals[subject].obtainedMarks += obtainedMarks;
  });

  return Object.entries(subjectTotals)
    .map(([subject, t]) => ({
      subject,
      PercentAchieved: t.totalMarks ? (t.obtainedMarks / t.totalMarks) * 100 : 0,
    }))
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved);

};

// -----------------------------
// SAT Semester 1 — District x Subject heat-map (wide format). Same
// shape as getSATSubjectHeatmap.
// -----------------------------

export const getSATSem1SubjectHeatmap = (sem1Workbook) => {

  const rows = getSATSem1DistrictSubjectWise(sem1Workbook);

  const byDistrict = {};
  const subjectsSeen = new Set();

  rows.forEach((r) => {
    subjectsSeen.add(r.subject);
    if (!byDistrict[r.District]) byDistrict[r.District] = { District: r.District };
    byDistrict[r.District][r.subject] = r.PercentAchieved;
  });

  const subjects = [
    ...SAT_SUBJECT_ORDER.filter((s) => subjectsSeen.has(s)),
    ...[...subjectsSeen].filter((s) => !SAT_SUBJECT_ORDER.includes(s)),
  ];

  return { subjects, data: Object.values(byDistrict) };

};

// -----------------------------
// SAT Semester 1 — State-level summary (overall average, grade-wise
// averages). Same shape as getSATStateSummary.
// -----------------------------

export const getSATSem1StateSummary = (sem1Workbook) => {

  const ranking = getSATSem1DistrictRanking(sem1Workbook);
  const gradeWise = getSATSem1GradeWise(sem1Workbook);

  const stateAverage = ranking.length
    ? ranking.reduce((sum, d) => sum + d.PercentAchieved, 0) / ranking.length
    : 0;

  const totalObtained = ranking.reduce((sum, d) => sum + d.ObtainedMarks, 0);
  const totalMarks = ranking.reduce((sum, d) => sum + d.TotalMarks, 0);

  const gradeAverages = gradeWise.grades.map((grade) => {
    const values = gradeWise.data
      .map((d) => d[grade])
      .filter((v) => typeof v === "number");
    const average = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    return { grade, average };
  });

  return {
    stateAverage,
    totalDistricts: ranking.length,
    totalMarks,
    totalObtained,
    gradeAverages,
  };

};

// -----------------------------
// SAT Semester 1 — Action Items, reusing the same priority-queue
// builder as Semester 2 (buildSATDistrictAction is generic over
// whichever ranking/subject-wise data you pass it).
// -----------------------------

export const getSATSem1ActionItems = (sem1Workbook) => {

  const satRanking = getSATSem1DistrictRanking(sem1Workbook);
  const satDistrictSubject = getSATSem1DistrictSubjectWise(sem1Workbook);

  const items = PRIORITY_DISTRICTS
    .map((districtName) => buildSATDistrictAction(districtName, satRanking, satDistrictSubject))
    .filter(Boolean);

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);

};

export const getAllDistrictSATSem1ActionItems = (sem1Workbook) => {

  const satRanking = getSATSem1DistrictRanking(sem1Workbook);
  const satDistrictSubject = getSATSem1DistrictSubjectWise(sem1Workbook);

  return satRanking
    .map((d) => buildSATDistrictAction(d.District, satRanking, satDistrictSubject))
    .filter(Boolean);

};

export const getSATSemesterComparison = (sem2Workbook, sem1Workbook) => {

  const sem2 = getSATDistrictRanking(sem2Workbook);
  const sem1 = getSATSem1DistrictRanking(sem1Workbook);

  const byDistrict = {};

  sem1.forEach((d) => {
    byDistrict[d.District] = { District: d.District, sem1: d, sem2: null };
  });

  sem2.forEach((d) => {
    if (!byDistrict[d.District]) byDistrict[d.District] = { District: d.District, sem1: null, sem2: null };
    byDistrict[d.District].sem2 = d;
  });

  return Object.values(byDistrict)
    .map(({ District, sem1: s1, sem2: s2 }) => {
      const totalMarks = (s1?.TotalMarks || 0) + (s2?.TotalMarks || 0);
      const totalObtained = (s1?.ObtainedMarks || 0) + (s2?.ObtainedMarks || 0);

      return {
        District,
        Sem1Pct: s1 ? s1.PercentAchieved : null,
        Sem2Pct: s2 ? s2.PercentAchieved : null,
        TotalPct: totalMarks ? (totalObtained / totalMarks) * 100 : null,
        Change: s1 && s2 ? s2.PercentAchieved - s1.PercentAchieved : null,
      };
    })
    .sort((a, b) => (b.TotalPct ?? -1) - (a.TotalPct ?? -1))
    .map((d, index) => ({ ...d, Rank: index + 1 }));

};