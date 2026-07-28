import * as XLSX from "xlsx";

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

export const getSheetData = (workbook, sheetName) => {

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  return rows
    .slice(6)
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
export const getSubjectHeatmap = (workbook) =>
  getParakhSection(workbook, 41, 74);

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