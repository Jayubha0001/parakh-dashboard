// utils/satDistrictMap.js
// The SAT sheets ("SAT District Wise", "SAT District Grade wise", ...) use
// ALL-CAPS district names that don't always match the spelling used in the
// PARAKH / PGI sheets (e.g. "KACHCHH" vs "Kutch", "DOHAD" vs "Dahod").
// This map normalizes every SAT district name to the SAME canonical name
// used everywhere else in the app, so the shared District filter dropdown
// and district-linking logic keep working for the SAT section too.

const SAT_TO_CANONICAL = {
  AHMEDABAD: "Ahmedabad",
  AMRELI: "Amreli",
  ANAND: "Anand",
  ARAVALLI: "Aravalli",
  BANASKANTHA: "Banaskantha",
  BHARUCH: "Bharuch",
  BHAVNAGAR: "Bhavnagar",
  BOTAD: "Botad",
  CHHOTAUDEPUR: "Chhota Udepur",
  "DEVBHOOMI DWARKA": "Devbhoomi Dwarka",
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
  VADODARA: "Vadodara",
  VALSAD: "Valsad",
};

export const normalizeSATDistrict = (name) => {
  if (!name || typeof name !== "string") return name;
  const key = name.trim().toUpperCase();
  return SAT_TO_CANONICAL[key] || name.trim();
};

// Rows to always skip — the SAT sheets include a "Grand Total" summary row
// mixed in with the 33 district rows.
export const isSATSummaryRow = (name) =>
  !name || typeof name !== "string" || name.trim().toUpperCase() === "GRAND TOTAL";
