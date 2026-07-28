import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// A vertical grouped bar chart — one column-group per district, with a
// separate bar for each of the three indicators (PGI-D / PARAKH / SAT).
// Districts sit along the X-axis (rotated labels) and % runs up the
// Y-axis, so it reads like a normal "standing" bar chart. With up to 33
// districts on screen at once, the chart scrolls horizontally inside a
// fixed-height card rather than squeezing every bar down to nothing.
const WIDTH_PER_DISTRICT = 90;

const DistrictRankingChart = ({ data = [] }) => {
  const chartData = [...data]
    .sort((a, b) => (a.RankWithSAT ?? a.Rank) - (b.RankWithSAT ?? b.Rank))
    .map((d) => ({
      District: d.District,
      "PGI-D %": Number(d.PGIDScore.toFixed(1)),
      "PARAKH %": Number(d.PARAKHScore.toFixed(1)),
      "SAT %": d.SATScore != null ? Number(d.SATScore.toFixed(1)) : null,
      Band: d.BandWithSAT ?? d.Band,
    }));

  const chartWidth = Math.max(700, chartData.length * WIDTH_PER_DISTRICT);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={0.5} sx={{ color: "#1E3A8A" }}>
          📊 PGI-D vs PARAKH vs SAT — District by District
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
          Districts sorted best-to-worst by overall rank, left to right. Each bar is that district's actual % on the
          indicator — hover any bar for the exact number. Scroll sideways to see every district.
        </Typography>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ width: chartWidth, height: 460 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="District"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />

                <YAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />

                <Tooltip
                  formatter={(value, name) => [value != null ? `${value}%` : "No data", name]}
                  labelFormatter={(label) => label}
                />

                <Legend wrapperStyle={{ fontSize: 12.5 }} verticalAlign="top" />

                <Bar dataKey="PGI-D %" fill="#1E3A8A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PARAKH %" fill="#F0B429" radius={[3, 3, 0, 0]} />
                <Bar dataKey="SAT %" fill="#2E7D32" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DistrictRankingChart;
