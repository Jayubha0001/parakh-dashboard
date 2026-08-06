// utils/satDistrictMap.js
// Several source sheets (SAT, PM-SHRI DATA, PM_SHRI_GSQAC_Result) use
// ALL-CAPS district names — and sometimes inconsistent spelling within
// the SAME sheet — that don't always match the spelling used in the
// PARAKH / PGI sheets (e.g. "KACHCHH" vs "Kutch", "DOHAD" vs "Dahod").
// This map normalizes every variant to the SAME canonical name used
// everywhere else in the app (Dashboard_PARAKH / Combined_Performance_
// Ranking / PRIORITY_DISTRICTS), so the shared District filter dropdown
// and district-linking logic — and district-wise totals — stay correct
// regardless of which sheet a row came from.

const SAT_TO_CANONICAL = {
  AHMEDABAD: "Ahmedabad",
  AHMADABAD: "Ahmedabad", // PM-SHRI DATA sheet spells it "Ahmadabad"
  AMRELI: "Amreli",
  ANAND: "Anand",
  ARAVALLI: "Aravalli",
  BANASKANTHA: "Banaskantha",
  "BANAS KANTHA": "Banaskantha", // GSQAC result sheet has both spacings
  BHARUCH: "Bharuch",
  BHAVNAGAR: "Bhavnagar",
  BOTAD: "Botad",
  CHHOTAUDEPUR: "Chhota Udepur",
  "DEVBHOOMI DWARKA": "Devbhoomi Dwarka",
  "DEVBHUMI DWARKA": "Devbhoomi Dwarka", // GSQAC result sheet spelling
  DOHAD: "Dahod",

  GANDHINAGAR: "Gandhinagar",
  "GIR SOMNATH": "Gir Somnath",
  JAMNAGAR: "Jamnagar",
  JUNAGADH: "Junagadh",
  KACHCHH: "Kutch",
  KHEDA: "Kheda",
  MAHESANA: "Mehsana",
  MAHISAGAR: "Mahisagar",
  MORBI: "Morbi",
  NARMADA: "Narmada",
  NAVSARI: "Navsari",
  "PANCH MAHALS": "Panchmahal",
  PATAN: "Patan",
  PORBANDAR: "Porbandar",
  RAJKOT: "Rajkot",
  "SABAR KANTHA": "Sabarkantha",
  SURAT: "Surat",
  SURENDRANAGAR: "Surendranagar",
  TAPI: "Tapi",
  "THE DANGS": "Dang",
  DANG: "Dang", // GSQAC result sheet spells it "Dang" (no "The")
  VADODARA: "Vadodara",
  VALSAD: "Valsad",
};

export const normalizeSATDistrict = (name) => {
  if (!name || typeof name !== "string") return name;
  const key = name.trim().toUpperCase();
  return SAT_TO_CANONICAL[key] || name.trim();
};

// Same function, exported under a name that makes sense outside the SAT
// context (PM Shri coverage + GSQAC result sheets use it too).
export const normalizeDistrictName = normalizeSATDistrict;

// Rows to always skip — the SAT sheets include a "Grand Total" summary row
// mixed in with the 33 district rows.
export const isSATSummaryRow = (name) =>
  !name || typeof name !== "string" || name.trim().toUpperCase() === "GRAND TOTAL";
