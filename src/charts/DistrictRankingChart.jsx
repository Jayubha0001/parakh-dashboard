import { Card, CardContent, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { bandColor } from "../components/CombinedBandSummary";

const DistrictRankingChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({
    District: d.District,
    x: Number(d.PGIDScore.toFixed(1)),
    y: Number(d.PARAKHScore.toFixed(1)),
    Band: d.Band,
  }));

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
          🎯 PGI-D % vs PARAKH % — District Comparison
        </Typography>

        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey="x"
              name="PGI-D Score"
              unit="%"
              domain={["auto", "auto"]}
              label={{ value: "PGI-D Score (%)", position: "insideBottom", offset: -10 }}
            />

            <YAxis
              type="number"
              dataKey="y"
              name="PARAKH Score"
              unit="%"
              domain={["auto", "auto"]}
              label={{ value: "PARAKH Score (%)", angle: -90, position: "insideLeft" }}
            />

            <ZAxis range={[80, 80]} />

            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={() => ""}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div
                    style={{
                      background: "#fff",
                      padding: 8,
                      borderRadius: 6,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      fontSize: 12,
                    }}
                  >
                    <strong>{p.District}</strong>
                    <div>PGI-D: {p.x}%</div>
                    <div>PARAKH: {p.y}%</div>
                    <div>Band: {p.Band}</div>
                  </div>
                );
              }}
            />

            <Scatter data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={bandColor(entry.Band)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DistrictRankingChart;
