import { fmt1 } from "./fmt";

// Value label drawn above each bar. Narrow bars (e.g. 33 districts x 2 semesters) get a rotated label so
// the numbers never overlap; wide bars get a normal horizontal one.
export const barLabel = (vertical = false) => {
  const BarLabel = ({ x, y, width, height, value }) => {
    if (value == null || value === "" || Number.isNaN(Number(value))) return null;
    const t = fmt1(value);
    if (vertical) return <text x={x + width + 4} y={y + height / 2} dy={3} fontSize={10} fontWeight={700} fill="#16233B">{t}</text>;
    const cx = x + width / 2;
    if (width < 17) return <text x={cx} y={y - 4} fontSize={8.5} fontWeight={700} fill="#16233B" textAnchor="start" transform={`rotate(-90 ${cx} ${y - 4})`}>{t}</text>;
    return <text x={cx} y={y - 4} fontSize={width < 28 ? 9 : 10.5} fontWeight={700} fill="#16233B" textAnchor="middle">{t}</text>;
  };
  return BarLabel;
};

export const pointLabel = ({ x, y, value }) =>
  value == null || Number.isNaN(Number(value)) ? null : (
    <text x={x} y={y - 8} fontSize={10} fontWeight={700} fill="#16233B" textAnchor="middle">{fmt1(value)}</text>
  );
