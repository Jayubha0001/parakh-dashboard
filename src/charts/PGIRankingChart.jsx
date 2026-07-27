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

const PGIRankingChart = ({ data = [] }) => {
  const chartData = [...data]
    .sort((a, b) => b.PercentAchieved - a.PercentAchieved)
    .map((d) => ({
      District: d.District,
      Score: Number(d.PercentAchieved.toFixed(1)),
    }));

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
                <Cell key={index} fill={barColor(entry.Score)} />
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
