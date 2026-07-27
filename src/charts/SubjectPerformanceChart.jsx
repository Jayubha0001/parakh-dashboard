import { Card, CardContent, Typography, Box } from "@mui/material";

const cellColor = (pct) => {
  if (pct >= 45) return "#2E7D32"; // Green - High
  if (pct >= 40) return "#FB8C00"; // Orange - Medium
  return "#D32F2F"; // Red - Low
};

const SubjectPerformanceChart = ({ columns = [], data = [] }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={1} sx={{ color: "#1E3A8A" }}>
          📚 Subject-wise Mastery Heat-map (% students at mastery, by District)
        </Typography>

        <Typography fontSize={12} color="text.secondary" mb={2}>
          🟢 High (≥45%) · 🟠 Medium (40–44.99%) · 🔴 Low (&lt;40%)
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#1565C0",
                    color: "#fff",
                    padding: "8px",
                    textAlign: "left",
                    minWidth: 140,
                    zIndex: 1,
                  }}
                >
                  District
                </th>
                {columns.map((col) => {
                  const isAverage = col.endsWith("Average");
                  return (
                    <th
                      key={col}
                      style={{
                        background: isAverage ? "#0F172A" : "#1565C0",
                        color: "#fff",
                        padding: "8px",
                        minWidth: isAverage ? 90 : 100,
                        whiteSpace: "nowrap",
                        borderLeft: isAverage ? "2px solid #F0B429" : "none",
                      }}
                    >
                      {isAverage ? "⭐ " + col : col}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={row.District}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "#fff",
                      padding: "6px 8px",
                      fontWeight: 600,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {row.District}
                  </td>

                  {columns.map((col) => {
                    const pct = (row[col] ?? 0) * 100;
                    const isAverage = col.endsWith("Average");
                    return (
                      <td
                        key={col}
                        style={{
                          textAlign: "center",
                          padding: "6px 4px",
                          color: "#fff",
                          fontWeight: isAverage ? 800 : 600,
                          background: cellColor(pct),
                          borderBottom: "1px solid #fff",
                          borderLeft: isAverage ? "2px solid #F0B429" : "none",
                        }}
                      >
                        {pct.toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubjectPerformanceChart;
