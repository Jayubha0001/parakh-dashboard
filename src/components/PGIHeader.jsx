import { Box, Grid, Typography, Paper, Chip } from "@mui/material";
import { colors, fontDisplay, fontMono } from "../theme/theme";

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
        background: `linear-gradient(120deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
        borderRadius: 4,
        color: "#fff",
        p: { xs: 2.5, md: 3.5 },
        mb: 2.5,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.25)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldLight})`,
        }}
      />

      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography
            sx={{
              fontFamily: fontMono,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.goldLight,
              fontWeight: 600,
            }}
          >
            🏛️ Performance Grading Index — State &amp; District
          </Typography>

          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: { xs: 26, md: 34 }, mt: 0.3 }}>
            Gujarat PGI 2.0 Dashboard
          </Typography>

          <Typography sx={{ mt: 1.5, opacity: 0.85, fontSize: 15 }}>
            6 Domains · 33 Districts · Scored out of 1000 (State) / 600 (District)
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography sx={{ fontSize: 13, opacity: 0.8 }}>Gujarat State Overall Score</Typography>

            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 40, mt: 0.5 }}>
              {overall?.score?.toFixed(1) ?? "-"}
              <Typography component="span" sx={{ fontSize: 16, opacity: 0.75 }}>
                {" "}/ {overall?.maxWeight ?? 1000}
              </Typography>
            </Typography>

            <Chip
              label={`${overall?.grade || "-"} · ${overall?.percentAchieved?.toFixed(1) ?? 0}%`}
              size="small"
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
