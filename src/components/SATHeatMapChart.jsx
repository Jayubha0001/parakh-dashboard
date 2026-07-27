import { Card, CardContent, Typography, Box } from "@mui/material";

const cellColor = (pct) => {
  if (pct >= 60) return "#2E7D32";
  if (pct >= 45) return "#FB8C00";
  return "#D32F2F";
};

// Generic District x Column percentage heat-map. `data` rows look like
// { District, [column]: percentValue, ... } — used for both the SAT
// Grade-wise and Subject-wise breakdowns.
const SATHeatMapChart = ({ title, icon = "🌡️", columns = [], data = [] }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {icon} {title}
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#6A1B9A",
                    color: "#fff",
                    padding: "8px",
                    textAlign: "left",
                    minWidth: 140,
                    zIndex: 1,
                  }}
                >
                  District
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      background: "#6A1B9A",
                      color: "#fff",
                      padding: "8px",
                      minWidth: 110,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
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
                    const pct = row[col] ?? 0;

                    return (
                      <td
                        key={col}
                        style={{
                          textAlign: "center",
                          padding: "6px 4px",
                          color: "#fff",
                          fontWeight: 600,
                          background: cellColor(pct),
                          borderBottom: "1px solid #fff",
                        }}
                      >
                        {pct.toFixed(0)}%
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

export default SATHeatMapChart;
