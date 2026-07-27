// The 11 priority (Aspirational) districts the state is focusing extra
// attention on. Spelling matches the canonical district names used
// throughout this app (Dashboard_PARAKH / Combined_Performance_Ranking),
// which differ slightly from the ALL-CAPS PM-SHRI sheet in a couple of
// cases: "KACHCHH" -> "Kutch" and "DOHAD" -> "Dahod" are the same
// district under a different spelling.
export const PRIORITY_DISTRICTS = [
  "Chhota Udepur",
  "Kheda",
  "Gir Somnath",
  "Aravalli",
  "Porbandar",
  "Jamnagar",
  "Amreli",
  "Kutch",
  "Dahod",
  "Mahisagar",
  "Patan",
];

const NORMALIZED = new Set(PRIORITY_DISTRICTS.map((d) => d.toLowerCase()));

// Known spelling/spacing variants seen across different source sheets
// (e.g. the PM-SHRI DATA sheet uses ALL-CAPS names that don't always
// match the canonical spelling used elsewhere in the app).
const ALIASES = {
  chhotaudepur: "chhota udepur",
  kachchh: "kutch",
  dohad: "dahod",
};

export const isPriorityDistrict = (name = "") => {
  const key = String(name).trim().toLowerCase();
  return NORMALIZED.has(ALIASES[key] || key);
};
