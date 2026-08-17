import { Box, Paper, Typography, Grid } from "@mui/material";

export const bandColor = (band = "") => {
  if (band.startsWith("High")) return "#2E7D32";
  if (band.startsWith("Good")) return "#66BB6A";
  if (band.startsWith("Average")) return "#FB8C00";
  if (band.startsWith("Needs")) return "#EF6C00";
  return "#D32F2F"; // Low Performing
};

const CombinedBandSummary = ({ bandSummary = [], weights = {} }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        borderRadius: 4,
        border: "1px solid #E4E7F0",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          px: 3,
          pt: 2.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            fontSize: 18,
            color: "#16233B",
          }}
        >
          Performance Band Distribution
        </Typography>

        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          WEIGHT — PGI-D {(weights.pgid * 100).toFixed(0)}% · PARAKH{" "}
          {(weights.parakh * 100).toFixed(0)}%
          {weights.sat != null && ` · SAT ${(weights.sat * 100).toFixed(0)}%`}
        </Typography>
      </Box>

      <Grid container sx={{ mt: 2 }}>
        {bandSummary.map((b, i) => (
          <Grid
            size={{ xs: 6, sm: 12 / bandSummary.length }}
            key={b.band}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRight: { sm: i < bandSummary.length - 1 ? "1px solid #E4E7F0" : "none" },
              borderTop: `3px solid ${bandColor(b.band)}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Fraunces", serif',
                fontWeight: 700,
                fontSize: 32,
                color: bandColor(b.band),
              }}
            >
              {b.count}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{b.band}</Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default CombinedBandSummary;
