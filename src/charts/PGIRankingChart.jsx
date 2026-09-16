import { Card, CardContent, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { colors } from "../theme/theme";

// When `data` has been narrowed to a single district (allData is the full,
// unfiltered ranking and is longer than data), a "Gujarat State Average" bar
// is appended so the one district can actually be compared against
// something — same behaviour the Dashboard page's own PGI chart already
// had, now shared here instead of being a second, inconsistent copy.
//
// `data`/`allData` are the 2024-25 PGI-D ranking; `data2526`/`allData2526`
// are the matching 2025-26 ranking (same shape: District, PercentAchieved).
// Both years are plotted side by side per district so a filtered district
// always shows its progress, not just whichever year happened to be wired
// up first.
const PGIRankingChart = ({ data = [], allData = null, data2526 = [], allData2526 = null }) => {
  const isFiltered = data.length === 1 && Array.isArray(allData) && allData.length > data.length;
  const has2526 = Array.isArray(data2526) && data2526.length > 0;

  const map2526 = Object.fromEntries((data2526 || []).map((d) => [d.District, d.PercentAchieved]));

  const chartData = [...data]
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
    .map((d) => ({
      District: d.District,
      "2024-25": Number(d.PercentAchieved.toFixed(1)),
      "2025-26": map2526[d.District] != null ? Number(map2526[d.District].toFixed(1)) : null,
    }));

  if (isFiltered) {
    const stateAverage2425 = allData.reduce((sum, d) => sum + d.PercentAchieved, 0) / allData.length;
    const stateAverage2526 =
      Array.isArray(allData2526) && allData2526.length > 0
        ? allData2526.reduce((sum, d) => sum + d.PercentAchieved, 0) / allData2526.length
        : null;
    chartData.push({
      District: "Gujarat State Average",
      "2024-25": Number(stateAverage2425.toFixed(1)),
      "2025-26": stateAverage2526 != null ? Number(stateAverage2526.toFixed(1)) : null,
      isAverage: true,
    });
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 2.5 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
          📊 District-wise PGI-D % Achieved (out of 600) — 2024-25 vs 2025-26
        </Typography>

        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="District"
              angle={-45}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 10 }}
            />

            <YAxis domain={[0, 100]} />

            <Tooltip formatter={(value) => (value == null ? "—" : `${value}%`)} />
            <Legend />

            <Bar dataKey="2024-25" barSize={has2526 ? 16 : 20} radius={[6, 6, 0, 0]} fill={colors.navyLight}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.isAverage ? colors.navy : colors.navyLight} />
              ))}
              <LabelList
                dataKey="2024-25"
                position="top"
                formatter={(value) => (value == null ? "" : `${value}%`)}
                style={{ fontSize: 9.5, fontWeight: "bold", fill: "#333" }}
              />
            </Bar>

            {has2526 && (
              <Bar dataKey="2025-26" barSize={16} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.isAverage ? "#8A6200" : colors.gold} />
                ))}
                <LabelList
                  dataKey="2025-26"
                  position="top"
                  formatter={(value) => (value == null ? "" : `${value}%`)}
                  style={{ fontSize: 9.5, fontWeight: "bold", fill: "#333" }}
                />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PGIRankingChart;
