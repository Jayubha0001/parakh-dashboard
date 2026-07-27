import { Card, CardContent, Typography, Grid, Box, LinearProgress } from "@mui/material";

const ContextualSummaryCards = ({ data = [] }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, mt: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#1E3A8A" }}>
          🧩 Contextual Variables — High vs Low Performing Schools (Gujarat-wide)
        </Typography>

        <Grid container spacing={3}>
          {data.map((row, i) => {
            const high = row["Avg High-Performing (%)"] ?? 0;
            const low = row["Avg Low-Performing (%)"] ?? 0;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: "#fff",
                    height: "100%",
                  }}
                >
                  <Typography fontWeight="bold" fontSize={14} mb={1.5}>
                    {row.District}
                  </Typography>

                  <Typography fontSize={12} color="text.secondary">
                    High-Performing Schools
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(high * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      mt: 0.5,
                      mb: 0.5,
                      bgcolor: "#eee",
                      "& .MuiLinearProgress-bar": { bgcolor: "#2E7D32" },
                    }}
                  />
                  <Typography fontSize={13} fontWeight="bold" sx={{ color: "#2E7D32" }} mb={1.5}>
                    {(high * 100).toFixed(1)}%
                  </Typography>

                  <Typography fontSize={12} color="text.secondary">
                    Low-Performing Schools
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(low * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      mt: 0.5,
                      mb: 0.5,
                      bgcolor: "#eee",
                      "& .MuiLinearProgress-bar": { bgcolor: "#D32F2F" },
                    }}
                  />
                  <Typography fontSize={13} fontWeight="bold" sx={{ color: "#D32F2F" }}>
                    {(low * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContextualSummaryCards;
