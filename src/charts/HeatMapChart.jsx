import { Card, CardContent, Typography, Box } from "@mui/material";

// Max weight for each PGI-D category (used to compute % for color scaling)
const CATEGORY_MAX = {
  "Outcomes (/290)": 290,
  "Classroom Transaction (/90)": 90,
  "Infrastructure (/51)": 51,
  "Safety & Protection (/35)": 35,
  "Digital Learning (/50)": 50,
  "Governance (/84)": 84,
};

const cellColor = (value, max) => {
  const pct = max ? (value / max) * 100 : 0;
  if (pct >= 71) return "#2E7D32"; // Atti-Uttam and above
  if (pct >= 51) return "#66BB6A"; // Prachesta-1
  if (pct >= 31) return "#FB8C00"; // Prachesta-2/3
  return "#D32F2F"; // Akanshi
};

const HeatMapChart = ({ categories = [], data = [] }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          🌡️ Category-wise Score Heat-map (% of max, by District)
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
                {categories.map((cat) => (
                  <th
                    key={cat}
                    style={{
                      background: "#6A1B9A",
                      color: "#fff",
                      padding: "8px",
                      minWidth: 110,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat}
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

                  {categories.map((cat) => {
                    const max = CATEGORY_MAX[cat] || 100;
                    const value = row[cat] ?? 0;
                    const pct = max ? ((value / max) * 100).toFixed(0) : 0;

                    return (
                      <td
                        key={cat}
                        title={`${value} / ${max}`}
                        style={{
                          textAlign: "center",
                          padding: "6px 4px",
                          color: "#fff",
                          fontWeight: 600,
                          background: cellColor(value, max),
                          borderBottom: "1px solid #fff",
                        }}
                      >
                        {pct}%
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

export default HeatMapChart;
