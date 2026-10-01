export const BAND_COLORS = ["#178A4B", "#5DBB63", "#F2CC3B", "#F28C28", "#D93A2B"];

// Five equal-count colour bands (best -> lowest) from a { district: value } map.
export const quintileBands = (byDistrict = {}, unit = "%") => {
  const values = Object.values(byDistrict).filter((v) => typeof v === "number");
  if (values.length < 5) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  const cuts = [q(0.8), q(0.6), q(0.4), q(0.2)];
  const label = (i) => (i === 0 ? `≥ ${cuts[0]}${unit}` : i === 4 ? `< ${cuts[3]}${unit}` : `${cuts[i]}${unit} – ${cuts[i - 1]}${unit}`);
  return BAND_COLORS.map((color, i) => ({ color, min: i < 4 ? cuts[i] : -Infinity, label: label(i) }));
};
