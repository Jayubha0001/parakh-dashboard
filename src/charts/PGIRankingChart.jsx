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
  LabelList,
} from "recharts";

const barColor = (score) => {
  if (score >= 61) return "#2E7D32";
  if (score >= 31) return "#FB8C00";
  return "#D32F2F";
};

// When `data` has been narrowed to a single district (allData is the full,
// unfiltered ranking and is longer than data), a "Gujarat State Average" bar
// is appended so the one district can actually be compared against
// something — same behaviour the Dashboard page's own PGI chart already
// had, now shared here instead of being a second, inconsistent copy.
const PGIRankingChart = ({ data = [], allData = null }) => {
  const isFiltered = data.length === 1 && Array.isArray(allData) && allData.length > data.length;

  const chartData = [...data]
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
    .map((d) => ({
      District: d.District,
      Score: Number(d.PercentAchieved.toFixed(1)),
    }));

  if (isFiltered) {
    const stateAverage = allData.reduce((sum, d) => sum + d.PercentAchieved, 0) / allData.length;
    chartData.push({
      District: "Gujarat State Average",
      Score: Number(stateAverage.toFixed(1)),
      isAverage: true,
    });
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
          📊 District-wise PGI-D % Achieved (out of 600)
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

            <Tooltip formatter={(value) => `${value}%`} />

            <Bar dataKey="Score" barSize={20} radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.isAverage ? "#0F172A" : barColor(entry.Score)} />
              ))}

              <LabelList
                dataKey="Score"
                position="top"
                formatter={(value) => `${value}%`}
                style={{ fontSize: 10, fontWeight: "bold", fill: "#333" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PGIRankingChart;
