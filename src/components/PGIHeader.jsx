import { Box, Grid, Typography, Paper, Chip } from "@mui/material";

const gradeColor = (grade = "") => {
  if (grade.startsWith("Daksh") || grade.startsWith("Utkarsh")) return "#2E7D32";
  if (grade.startsWith("Atti-Uttam") || grade.startsWith("Uttam")) return "#1976D2";
  if (grade.startsWith("Prachesta")) return "#FB8C00";
  return "#D32F2F";
};

const PGIHeader = ({ overall }) => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg,#4A148C,#7B1FA2)",
        borderRadius: 4,
        color: "#fff",
        p: 4,
        mb: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h3" fontWeight="bold">
            Gujarat PGI 2.0 Dashboard
          </Typography>

          <Typography sx={{ mt: 1, opacity: 0.9, fontSize: 18 }}>
            Performance Grading Index — State & District (PGI-D)
          </Typography>

          <Typography sx={{ mt: 2, fontSize: 16 }}>
            🏛️ 6 Domains • 33 Districts • Out of 1000 (State) / 600 (District)
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.15)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography fontSize={15}>Gujarat State Overall Score</Typography>

            <Typography variant="h3" fontWeight="bold">
              {overall?.score?.toFixed(1) ?? "-"}
              <Typography component="span" fontSize={18} sx={{ opacity: 0.8 }}>
                {" "}/ {overall?.maxWeight ?? 1000}
              </Typography>
            </Typography>

            <Chip
              label={`${overall?.grade || "-"} · ${overall?.percentAchieved?.toFixed(1) ?? 0}%`}
              sx={{
                mt: 1,
                bgcolor: gradeColor(overall?.grade),
                color: "#fff",
                fontWeight: "bold",
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PGIHeader;
export { gradeColor };
