// One number format for every chart label: 95.444444 -> "95.4"; whole numbers stay whole.
export const fmt1 = (v) => {
  const n = Number(v);
  if (v == null || v === "" || Number.isNaN(n)) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};
